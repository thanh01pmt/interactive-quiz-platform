
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BlocklyProgrammingQuestion, UserAnswerType } from '../types';

const loadScript = (src: string, async = true): Promise<void> => {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      // If script tag exists, assume browser is handling/has handled loading.
      // Further checks for global objects should be done by the caller.
      console.log(`Script tag for ${src} already exists. Assuming loaded or loading.`);
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.onload = () => {
      console.log(`Successfully loaded script: ${src}`);
      resolve();
    };
    script.onerror = () => {
      console.error(`Failed to load script: ${src}`);
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.head.appendChild(script);
  });
};

const loadBlocklyScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof (window as any).Blockly?.Blocks !== 'undefined' &&
        typeof (window as any).Blockly?.JavaScript !== 'undefined') {
      console.log("Blockly already fully loaded.");
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
      console.log(`Attempting to load Blockly from ${cdn.name}...`);

      try {
        await loadScript(cdn.mainSrc);
        const BlocklyGlobal = (window as any).Blockly;
        if (typeof BlocklyGlobal === 'undefined') {
          throw new Error(`Blockly global object not found after loading main script from ${cdn.name}.`);
        }
        console.log(`Blockly main loaded from ${cdn.name}. Version: ${BlocklyGlobal.VERSION}`);

        if (BlocklyGlobal.utils?.global) {
          BlocklyGlobal.utils.global.blocklyPath = cdn.mediaPath;
        } else {
            // Fallback for older versions or different structures - Blockly usually sets its own path.
            // Explicitly setting Blockly.MEDIA might be needed for some setups if icons are broken.
            // However, the embedded CSS has <<<PATH>>> which Blockly's core should replace if blocklyPath is set.
            console.warn(`Blockly.utils.global not found. Media path for ${cdn.name} might need manual verification if icons fail.`);
            BlocklyGlobal.MEDIA = cdn.mediaPath; // A common older way
        }

        await Promise.all([
          loadScript(cdn.blocksSrc),
          loadScript(cdn.generatorSrc)
        ]);

        if (typeof BlocklyGlobal.Blocks === 'undefined') {
          throw new Error(`Blockly.Blocks not found after loading blocks script from ${cdn.name}.`);
        }
        if (typeof BlocklyGlobal.JavaScript === 'undefined') {
          throw new Error(`Blockly.JavaScript generator not found after loading JS generator script from ${cdn.name}.`);
        }

        console.log(`Successfully loaded Blockly with Blocks and JavaScript generator from ${cdn.name}`);
        resolve(); // Resolve the main loadBlocklyScript promise

      } catch (error) {
        console.warn(`Failed to load Blockly from ${cdn.name}:`, error);
        await tryLoadFromCDN(cdnIndex + 1); // Try next CDN
      }
    };

    tryLoadFromCDN(0).catch(reject); // Catch if all CDNs fail
  });
};

const useBlocklyLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const attemptLoad = useCallback(() => {
    // No need to set isLoading true here, it's set by initial state or retry
    setLoadError(null); // Reset error before new attempt
    setIsReady(false);  // Reset ready state
    console.log("useBlocklyLoader: attempting to load Blockly.");
    loadBlocklyScript()
      .then(() => {
        console.log("useBlocklyLoader: Blockly loaded successfully.");
        setIsReady(true);
        setIsLoading(false);
        setLoadError(null);
      })
      .catch((error) => {
        console.error("useBlocklyLoader: Blockly Load Error in Hook:", error);
        setLoadError(error.message || "Unknown error loading Blockly.");
        setIsLoading(false);
        setIsReady(false);
      });
  }, []);

  useEffect(() => {
    // Only attempt load if marked as loading, and not yet ready/failed
    if (isLoading && !isReady && !loadError) {
      attemptLoad();
    }
  }, [isLoading, isReady, loadError, attemptLoad]);

  const retry = useCallback(() => {
    console.log("useBlocklyLoader: Retry initiated.");
    setLoadError(null);
    setIsReady(false);
    setIsLoading(true); // This will trigger the useEffect to call attemptLoad
  }, []);

  return { isLoading, loadError, isReady, retry };
};

interface BlocklyProgrammingQuestionUIProps {
  question: BlocklyProgrammingQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null;
  showCorrectAnswer?: boolean;
}

export const BlocklyProgrammingQuestionUI: React.FC<BlocklyProgrammingQuestionUIProps> = ({
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
    if (!LocalBlockly?.inject || !LocalBlockly?.Xml || !LocalBlockly?.Events || !LocalBlockly?.Themes) {
      setComponentError("Blockly library is not fully loaded or essential parts are missing (inject, Xml, Events, Themes).");
      setIsInitializingComponent(false);
      return;
    }

    setComponentError(null);
    setIsInitializingComponent(true);
    console.log(`Initializing Blockly workspace for question: ${question.id}`);

    if (workspaceRef.current?.dispose && typeof workspaceRef.current.dispose === 'function') {
      try {
        console.log("Disposing existing Blockly workspace.");
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

      // Rely on CSS in index.html for dark theme, use Classic as base JS theme.
      const themeToUse = LocalBlockly.Themes.Classic || undefined;

      const workspace = LocalBlockly.inject(blocklyDivRef.current, {
        toolbox: toolbox,
        scrollbars: true,
        trashcan: !showCorrectAnswer,
        readOnly: showCorrectAnswer,
        zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
        grid: { spacing: 20, length: 3, colour: '#374151', snap: true }, // Adjusted grid color for dark
        theme: themeToUse
      });

      workspaceRef.current = workspace;
      console.log("Blockly workspace injected.");

      let xmlToLoad: string | null = null;
      if (showCorrectAnswer && question.solutionWorkspaceXML) {
        xmlToLoad = question.solutionWorkspaceXML;
         console.log("Loading solution XML for Blockly.");
      } else if (userAnswer && typeof userAnswer === 'string' && userAnswer.trim().startsWith('<xml')) {
        xmlToLoad = userAnswer; // Initial load of userAnswer
        console.log("Loading user answer XML for Blockly initial setup.");
      } else if (question.initialWorkspace) {
        xmlToLoad = question.initialWorkspace;
        console.log("Loading initial workspace XML for Blockly.");
      }

      if (xmlToLoad) {
        try {
          const dom = LocalBlockly.Xml.textToDom(xmlToLoad);
          LocalBlockly.Xml.domToWorkspace(dom, workspace);
          console.log("XML loaded into Blockly workspace.");
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
             if (!workspaceRef.current) {
                console.warn('Blockly workspaceRef is null in change listener, skipping.');
                return;
            }
            const CurrentBlockly = (window as any).Blockly;
            if (!CurrentBlockly || !CurrentBlockly.Events || typeof event?.type === 'undefined') {
              console.warn('Blockly or Blockly.Events not available in change listener callback for Blockly.');
              return;
            }

            if (event.isUiEvent || event.type === CurrentBlockly.Events.VIEWPORT_CHANGE || event.group === 'drag') {
                if(event.type === CurrentBlockly.Events.FINISHED_LOADING) {} else {return;}
            }

            const significantEventTypes = [
              CurrentBlockly.Events.BLOCK_MOVE, CurrentBlockly.Events.BLOCK_CREATE,
              CurrentBlockly.Events.BLOCK_DELETE, CurrentBlockly.Events.BLOCK_CHANGE,
              CurrentBlockly.Events.VAR_CREATE, CurrentBlockly.Events.VAR_DELETE,
              CurrentBlockly.Events.VAR_RENAME, CurrentBlockly.Events.FINISHED_LOADING
            ].filter(Boolean);

            if (significantEventTypes.includes(event.type)) {
               console.log("Blockly relevant event, updating answer:", event.type);
               updateAnswer();
            }
          } catch (listenerError) {
            console.error('Error in Blockly change listener:', listenerError, 'Raw Event:', event);
          }
        });
        console.log("Blockly change listener added.");
      }

      setIsInitializingComponent(false);
      console.log("Blockly workspace initialization complete.");
    } catch (e) {
      console.error("Error initializing Blockly workspace:", e);
      setComponentError(`Failed to initialize workspace: ${e instanceof Error ? e.message : String(e)}`);
      setIsInitializingComponent(false);
    }
  }, [blocklyReady, question.id, question.toolboxDefinition, question.initialWorkspace, question.solutionWorkspaceXML, showCorrectAnswer, updateAnswer]);

  useEffect(() => {
    if (blocklyReady && blocklyDivRef.current) {
      console.log(`Blockly is ready, question ID: ${question.id}. Initializing workspace.`);
      initializeBlocklyWorkspace();
    }
    return () => {
      if (workspaceRef.current?.dispose && typeof workspaceRef.current.dispose === 'function') {
        try {
            console.log(`Disposing Blockly workspace for question: ${question.id}`);
            workspaceRef.current.dispose();
        } catch (disposeError) {
            console.error("Error during Blockly workspace disposal:", disposeError);
        }
        workspaceRef.current = null;
      }
    };
  }, [blocklyReady, question.id, initializeBlocklyWorkspace]);

  useEffect(() => {
    if (blocklyReady && workspaceRef.current && !showCorrectAnswer &&
        typeof userAnswer === 'string' && userAnswer.trim().startsWith('<xml')) {
      const LocalBlockly = (window as any).Blockly;
      if (!LocalBlockly?.Xml || !workspaceRef.current) return;

      try {
        // Avoid re-loading if XML is identical to prevent flicker or cursor jump
        const currentWorkspaceXML = LocalBlockly.Xml.domToText(LocalBlockly.Xml.workspaceToDom(workspaceRef.current));
        if (currentWorkspaceXML !== userAnswer) {
          console.log(`External userAnswer changed for Blockly question ${question.id}, reloading workspace XML.`);
          LocalBlockly.Xml.clearWorkspace(workspaceRef.current);
          const dom = LocalBlockly.Xml.textToDom(userAnswer);
          LocalBlockly.Xml.domToWorkspace(dom, workspaceRef.current);
          if (workspaceRef.current.scrollCenter && typeof workspaceRef.current.scrollCenter === 'function') {
            workspaceRef.current.scrollCenter();
          }
        }
      } catch (e) {
        console.error("Error applying external userAnswer to Blockly workspace:", e);
        setComponentError("Failed to load your saved progress into the workspace.");
      }
    }
  }, [userAnswer, blocklyReady, showCorrectAnswer, question.id]);

  useEffect(() => {
    const handleResize = () => {
      if (workspaceRef.current && blocklyReady) {
         const LocalBlockly = (window as any).Blockly;
         if (!LocalBlockly?.svgResize || !workspaceRef.current) {
            console.warn("Blockly or svgResize not available in resize handler (Blockly).");
            return;
         }
         try {
          LocalBlockly.svgResize(workspaceRef.current);
        } catch (resizeError) {
          console.error("Error during Blockly svgResize on window resize:", resizeError);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [blocklyReady]);

  const workspaceHeight = showCorrectAnswer ? '350px' : '500px';
  const workspaceContainerId = `blockly-workspace-container-${question.id}`;

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
      <div
        id={workspaceContainerId}
        ref={blocklyDivRef}
        style={{
          height: workspaceHeight,
          width: '100%',
          borderRadius: '8px',
          border: `1px solid ${componentError ? '#ef4444' : '#4A5568'}`,
          backgroundColor: '#1E293B',
          position: 'relative'
        }}
        aria-label={`Blockly programming workspace for question: ${question.prompt}`}
      >
        {blocklyReady && isInitializingComponent && !componentError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 bg-opacity-85 rounded-md z-10" aria-live="polite">
            <div className="text-center">
              <p className="text-slate-300 text-lg animate-pulse mb-2">Initializing Workspace...</p>
              <div className="w-6 h-6 border-4 border-slate-600 border-t-slate-300 rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        )}

        {componentError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-85 rounded-md p-4 z-10" role="alert">
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
          <div className="absolute inset-0 flex items-center justify-center" aria-live="polite">
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
