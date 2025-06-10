
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BlocklyProgrammingQuestion, UserAnswerType } from '../types'; // Changed BlockProgrammingQuestion to BlocklyProgrammingQuestion

const loadScript = (src: string, async = true): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      const checkInterval = setInterval(() => {
        // Check for Blockly specifically because its sub-modules might take time
        if (src.includes('blockly') && typeof (window as any).Blockly?.Blocks !== 'undefined' && typeof (window as any).Blockly?.JavaScript !== 'undefined') {
          clearInterval(checkInterval);
          resolve();
        } else if (!src.includes('blockly')) { // For other scripts, assume loaded if tag exists
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // Timeout to prevent infinite loop if script fails to set global
      setTimeout(() => {
        clearInterval(checkInterval);
        // Resolve anyway if it's a non-Blockly script, or if Blockly is partially loaded
        // The main loadBlocklyScript function will do further checks for Blockly completeness
        resolve(); 
      }, 7000); // Increased timeout slightly
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

const loadBlocklyScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof (window as any).Blockly !== 'undefined' && 
        (window as any).Blockly.Blocks && 
        (window as any).Blockly.JavaScript) {
      resolve();
      return;
    }

    const cdnOptions = [
      {
        name: 'cdnjs',
        mainSrc: 'https://cdnjs.cloudflare.com/ajax/libs/blockly/9.0.0/blockly.min.js',
        blocksSrc: 'https://cdnjs.cloudflare.com/ajax/libs/blockly/9.0.0/blocks.min.js',
        generatorSrc: 'https://cdnjs.cloudflare.com/ajax/libs/blockly/9.0.0/javascript.min.js',
        mediaPath: 'https://cdnjs.cloudflare.com/ajax/libs/blockly/9.0.0/media/'
      },
      {
        name: 'unpkg',
        mainSrc: 'https://unpkg.com/blockly@9.0.0/blockly.min.js',
        blocksSrc: 'https://unpkg.com/blockly@9.0.0/blocks.min.js', 
        generatorSrc: 'https://unpkg.com/blockly@9.0.0/javascript.min.js',
        mediaPath: 'https://unpkg.com/blockly@9.0.0/media/'
      },
      {
        name: 'jsdelivr',
        mainSrc: 'https://cdn.jsdelivr.net/npm/blockly@9.0.0/blockly.min.js',
        blocksSrc: 'https://cdn.jsdelivr.net/npm/blockly@9.0.0/blocks.min.js',
        generatorSrc: 'https://cdn.jsdelivr.net/npm/blockly@9.0.0/javascript.min.js', 
        mediaPath: 'https://cdn.jsdelivr.net/npm/blockly@9.0.0/media/'
      }
    ];

    const tryLoadFromCDN = async (cdnIndex: number): Promise<void> => {
      if (cdnIndex >= cdnOptions.length) {
        throw new Error('All Blockly CDN loading options failed');
      }

      const cdn = cdnOptions[cdnIndex];
      
      try {
        console.log(`Attempting to load Blockly from ${cdn.name}...`);
        
        await loadScript(cdn.mainSrc);
        
        const BlocklyGlobal = (window as any).Blockly;
        if (typeof BlocklyGlobal === 'undefined') {
          throw new Error(`Blockly global object not found after loading main script from ${cdn.name}.`);
        }

        if (BlocklyGlobal.utils?.global) {
          BlocklyGlobal.utils.global.blocklyPath = cdn.mediaPath;
        } else {
          BlocklyGlobal.MEDIA_PATH = cdn.mediaPath; // Fallback for older versions or different structures
        }

        await Promise.all([
          loadScript(cdn.blocksSrc),
          loadScript(cdn.generatorSrc)
        ]);

        if (!BlocklyGlobal.Blocks || !BlocklyGlobal.JavaScript) {
          throw new Error(`Blockly Blocks or JavaScript generator not loaded correctly from ${cdn.name}.`);
        }
        
        // Optional: Apply theme adjustments if they rely on Blockly being fully loaded
        BlocklyGlobal.HSV_SATURATION = 0.55; 
        BlocklyGlobal.HSV_VALUE = 0.55;

        console.log(`Successfully loaded Blockly from ${cdn.name}`);
        
      } catch (error) {
        console.warn(`Failed to load Blockly from ${cdn.name}:`, error);
        await tryLoadFromCDN(cdnIndex + 1); // Try next CDN
      }
    };

    tryLoadFromCDN(0)
      .then(() => resolve())
      .catch(error => {
        console.error("All Blockly CDN loading attempts failed:", error);
        reject(error);
      });
  });
};

const useBlocklyLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const attemptLoad = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    setIsReady(false);
    loadBlocklyScript()
      .then(() => {
        setIsReady(true);
        setIsLoading(false);
        setLoadError(null);
      })
      .catch((error) => {
        console.error("Blockly Load Error in Hook:", error);
        setLoadError(error.message || "Unknown error loading Blockly.");
        setIsLoading(false);
        setIsReady(false);
      });
  }, []);

  useEffect(() => {
    if (!isReady && !loadError && isLoading) { // Only attempt load if not ready, no error, and marked as loading
      attemptLoad();
    }
  }, [isReady, loadError, isLoading, attemptLoad]);

  const retry = useCallback(() => {
    // Reset states to trigger a new loading attempt via useEffect
    setLoadError(null);
    setIsReady(false);
    setIsLoading(true); 
  }, []);

  return { isLoading, loadError, isReady, retry };
};

interface BlockProgrammingQuestionUIProps {
  question: BlocklyProgrammingQuestion; // Changed BlockProgrammingQuestion to BlocklyProgrammingQuestion
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null;
  showCorrectAnswer?: boolean;
}

export const BlockProgrammingQuestionUI: React.FC<BlockProgrammingQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer = false,
}) => {
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);
  const [isInitializingComponent, setIsInitializingComponent] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);
  
  const { isLoading: blocklyLoading, loadError: blocklyLoadError, isReady: blocklyReady, retry } = useBlocklyLoader();

  const updateAnswer = useCallback(() => {
    if (workspaceRef.current && !showCorrectAnswer && blocklyReady) {
      const LocalBlockly = (window as any).Blockly;
      if (!LocalBlockly?.Xml?.workspaceToDom || !LocalBlockly?.Xml?.domToText) {
        console.warn("Blockly.Xml methods not available for updateAnswer.");
        return;
      }
      try {
        const xml = LocalBlockly.Xml.workspaceToDom(workspaceRef.current);
        const xmlText = LocalBlockly.Xml.domToText(xml);
        onAnswerChange(xmlText);
      } catch (e) {
        console.error("Error serializing workspace to XML:", e);
      }
    }
  }, [onAnswerChange, showCorrectAnswer, blocklyReady]);

  const initializeBlocklyWorkspace = useCallback(() => {
    if (!blocklyReady || !blocklyDivRef.current) {
      console.warn("Blockly not ready or div ref not available for workspace initialization.");
      return;
    }

    const LocalBlockly = (window as any).Blockly;
    if (!LocalBlockly?.inject || !LocalBlockly?.Xml || !LocalBlockly?.Events) {
      setComponentError("Blockly library is not fully loaded or essential parts are missing (inject, Xml, Events).");
      setIsInitializingComponent(false);
      return;
    }

    setComponentError(null);
    setIsInitializingComponent(true);

    if (workspaceRef.current?.dispose && typeof workspaceRef.current.dispose === 'function') {
      try {
        workspaceRef.current.dispose();
      } catch (disposeError) {
         console.error("Error disposing existing Blockly workspace:", disposeError);
      }
      workspaceRef.current = null;
    }

    while (blocklyDivRef.current.firstChild) {
      blocklyDivRef.current.removeChild(blocklyDivRef.current.firstChild);
    }

    try {
      const toolbox = question.toolboxDefinition || `
        <xml xmlns="https://developers.google.com/blockly/xml">
          <category name="Logic" colour="%{BKY_LOGIC_HUE}"><block type="controls_if"></block><block type="logic_compare"></block><block type="logic_operation"></block><block type="logic_negate"></block><block type="logic_boolean"></block></category>
          <category name="Loops" colour="%{BKY_LOOPS_HUE}"><block type="controls_repeat_ext"></block><block type="controls_whileUntil"></block><block type="controls_for"></block></category>
          <category name="Math" colour="%{BKY_MATH_HUE}"><block type="math_number"></block><block type="math_arithmetic"></block><block type="math_single"></block></category>
          <category name="Text" colour="%{BKY_TEXTS_HUE}"><block type="text"></block><block type="text_print"></block><block type="text_join"></block></category>
          <category name="Variables" colour="%{BKY_VARIABLES_HUE}" custom="VARIABLE"></category>
          <category name="Functions" colour="%{BKY_PROCEDURES_HUE}" custom="PROCEDURE"></category>
        </xml>
      `;

      const workspace = LocalBlockly.inject(blocklyDivRef.current, {
        toolbox: toolbox,
        scrollbars: true,
        trashcan: !showCorrectAnswer,
        readOnly: showCorrectAnswer,
        zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
        grid: { spacing: 20, length: 3, colour: '#4A5568', snap: true },
        theme: LocalBlockly.Themes?.Dark || 'classic' // Use classic if Dark is not available
      });
      
      workspaceRef.current = workspace;

      let xmlToLoad: string | null = null;
      if (showCorrectAnswer && question.solutionWorkspaceXML) {
        xmlToLoad = question.solutionWorkspaceXML;
      } else if (userAnswer && typeof userAnswer === 'string' && userAnswer.trim().startsWith('<xml')) {
        xmlToLoad = userAnswer;
      } else if (question.initialWorkspace) {
        xmlToLoad = question.initialWorkspace;
      }

      if (xmlToLoad) {
        try {
          const dom = LocalBlockly.Xml.textToDom(xmlToLoad);
          LocalBlockly.Xml.domToWorkspace(dom, workspace);
        } catch (e) {
          console.error("Error loading XML to workspace:", e, "XML was:", xmlToLoad);
          setComponentError("Error loading blocks into workspace. XML might be malformed.");
        }
      }

      if (workspace.scrollCenter && typeof workspace.scrollCenter === 'function') workspace.scrollCenter();
      if (LocalBlockly.svgResize && typeof LocalBlockly.svgResize === 'function') LocalBlockly.svgResize(workspace);

      if (!showCorrectAnswer) {
        workspace.addChangeListener((event: any) => {
          try {
            const CurrentBlockly = (window as any).Blockly;
            if (!CurrentBlockly || !CurrentBlockly.Events || typeof event?.type === 'undefined') {
              console.warn('Blockly or Blockly.Events not available in change listener callback.');
              return;
            }
            
            const {
              BLOCK_CREATE, BLOCK_DELETE, BLOCK_CHANGE, BLOCK_MOVE, 
              VAR_CREATE, VAR_DELETE, VAR_RENAME, FINISHED_LOADING, UI: EVENT_UI
            } = CurrentBlockly.Events;

            const relevantEventTypes = [
              BLOCK_CREATE, BLOCK_DELETE, BLOCK_CHANGE, BLOCK_MOVE,
              VAR_CREATE, VAR_DELETE, VAR_RENAME, FINISHED_LOADING
            ].filter(type => typeof type !== 'undefined');


            if (relevantEventTypes.includes(event.type)) {
               if (event.element !== 'drag' && event.element !== 'scroll' && event.element !== 'zoom') {
                  try {
                      updateAnswer();
                  } catch (updateError) {
                      console.error('Error calling updateAnswer from Blockly relevantEventTypes listener:', updateError, 'Event:', event);
                  }
               }
            } else if (EVENT_UI && event.type === EVENT_UI && event.element === 'click') {
                 // Only update if it's a meaningful click, e.g., not just opening a category
                 if (event.oldValue !== event.newValue || (event.blockId && event.workspaceId)) {
                    try {
                        updateAnswer();
                    } catch (updateError) {
                        console.error('Error calling updateAnswer from Blockly UI click listener:', updateError, 'Event:', event);
                    }
                 }
            }
          } catch (listenerError) {
            console.error('Error in Blockly change listener:', listenerError, 'Event:', event);
          }
        });
      }
      
      setIsInitializingComponent(false);
    } catch (e) {
      console.error("Error initializing Blockly workspace:", e);
      setComponentError(`Failed to initialize workspace: ${e instanceof Error ? e.message : String(e)}`);
      setIsInitializingComponent(false);
    }
  }, [blocklyReady, question, showCorrectAnswer, userAnswer, updateAnswer]);

  useEffect(() => {
    if (blocklyReady && blocklyDivRef.current) {
      initializeBlocklyWorkspace();
    }
    return () => {
      if (workspaceRef.current?.dispose && typeof workspaceRef.current.dispose === 'function') {
        try {
            workspaceRef.current.dispose();
        } catch (disposeError) {
            console.error("Error during Blockly workspace disposal:", disposeError);
        }
        workspaceRef.current = null;
      }
    };
  }, [blocklyReady, question.id, initializeBlocklyWorkspace]); // question.id ensures re-initialization for new questions

  useEffect(() => { // Effect to load userAnswer XML if it changes externally
    if (blocklyReady && workspaceRef.current && !showCorrectAnswer && 
        typeof userAnswer === 'string' && userAnswer.trim().startsWith('<xml')) {
      const LocalBlockly = (window as any).Blockly;
      if (!LocalBlockly?.Xml || !workspaceRef.current) return;

      try {
        const currentWorkspaceXML = LocalBlockly.Xml.domToText(LocalBlockly.Xml.workspaceToDom(workspaceRef.current));
        if (currentWorkspaceXML !== userAnswer) { // Only update if different
          const dom = LocalBlockly.Xml.textToDom(userAnswer);
          LocalBlockly.Xml.clearWorkspace(workspaceRef.current); // Clear before loading new
          LocalBlockly.Xml.domToWorkspace(dom, workspaceRef.current);
          if (workspaceRef.current.scrollCenter && typeof workspaceRef.current.scrollCenter === 'function') {
            workspaceRef.current.scrollCenter();
          }
        }
      } catch (e) {
        console.error("Error applying external userAnswer to workspace:", e);
        setComponentError("Failed to load your saved progress into the workspace.");
      }
    }
  }, [userAnswer, blocklyReady, showCorrectAnswer, question.id]); // Add question.id to re-evaluate if userAnswer is for current q

  useEffect(() => {
    const handleResize = () => {
      if (workspaceRef.current && blocklyReady) {
        const LocalBlockly = (window as any).Blockly;
        if (LocalBlockly?.svgResize && typeof LocalBlockly.svgResize === 'function' && workspaceRef.current) {
           try {
            LocalBlockly.svgResize(workspaceRef.current);
          } catch (resizeError) {
            console.error("Error during Blockly svgResize on window resize:", resizeError);
          }
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [blocklyReady]);

  const workspaceHeight = showCorrectAnswer ? '350px' : '500px';

  if (blocklyLoading) {
    return (
      <div className="space-y-4">
        <div style={{ height: workspaceHeight, width: '100%', borderRadius: '8px', border: '1px solid #4A5568', backgroundColor: '#1E293B' }} className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-300 text-lg animate-pulse mb-2">Loading Blockly Environment...</p>
            <div className="w-8 h-8 border-4 border-slate-600 border-t-slate-300 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (blocklyLoadError) {
    return (
      <div className="space-y-4">
        <div style={{ height: workspaceHeight, width: '100%', borderRadius: '8px', border: '1px solid #ef4444', backgroundColor: '#1E293B' }} className="flex items-center justify-center p-4">
          <div className="text-red-400 text-center">
            <p className="font-semibold text-lg">Failed to load Blockly</p>
            <p className="text-sm mt-2 mb-3">{blocklyLoadError}</p>
            <div className="space-x-2">
              <button 
                onClick={retry}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Styles are now in index.html or embedded blockly.css */}
      <div 
        ref={blocklyDivRef} 
        style={{ 
          height: workspaceHeight, 
          width: '100%', 
          borderRadius: '8px', 
          border: `1px solid ${componentError ? '#ef4444' : '#4A5568'}`,
          backgroundColor: '#1E293B', // Ensure this matches blocklyMainBackground if overridden by CSS
          position: 'relative'
        }} 
      >
        {blocklyReady && isInitializingComponent && !componentError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 bg-opacity-85 rounded-md z-10">
            <div className="text-center">
              <p className="text-slate-300 text-lg animate-pulse mb-2">Initializing Workspace...</p>
              <div className="w-6 h-6 border-4 border-slate-600 border-t-slate-300 rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        )}
        
        {componentError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-85 rounded-md p-4 z-10">
            <div className="text-center">
              <p className="text-red-200 text-sm mb-3">Workspace Error: {componentError}</p>
              <button 
                onClick={initializeBlocklyWorkspace}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                Retry Initialize
              </button>
            </div>
          </div>
        )}
        
        {!workspaceRef.current && blocklyReady && !blocklyLoading && !blocklyLoadError && !componentError && !isInitializingComponent && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-slate-500">Preparing Blockly workspace area...</p>
          </div>
        )}
      </div>
      
      {showCorrectAnswer && question.solutionWorkspaceXML && userAnswer !== question.solutionWorkspaceXML && !componentError && !isInitializingComponent && (
        <div className="mt-2 p-3 bg-slate-700 rounded-md">
          <h4 className="font-semibold text-sky-300">Note:</h4>
          <p className="text-slate-300 text-sm">
            You are viewing the provided solution. Your submitted answer might have been different.
          </p>
        </div>
      )}
    </div>
  );
};
