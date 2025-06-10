
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ScratchProgrammingQuestion, UserAnswerType } from '../types';

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      console.log(`Script tag for ${src} (Scratch) already exists. Assuming loaded or loading.`);
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
        console.log(`Successfully loaded script (Scratch): ${src}`);
        resolve();
    };
    script.onerror = () => {
        console.error(`Failed to load script (Scratch): ${src}`);
        reject(new Error(`Failed to load ${src}`));
    };
    document.head.appendChild(script);
  });
};

const loadScratchLikeBlockly = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof (window as any).Blockly?.JavaScript !== 'undefined' && 
        typeof (window as any).Blockly?.Blocks !== 'undefined' &&
        (window as any).Blockly?.Themes?.scratch) { // Check if scratch theme is also defined as a signal
      console.log("Scratch-like Blockly already fully loaded.");
      resolve();
      return;
    }
    console.log("Loading Scratch-like Blockly environment...");

    const blocklyMainSrc = 'https://cdnjs.cloudflare.com/ajax/libs/blockly/9.0.0/blockly.min.js';
    const blocklyBlocksSrc = 'https://cdnjs.cloudflare.com/ajax/libs/blockly/9.0.0/blocks.min.js';
    const blocklyJsGeneratorSrc = 'https://cdnjs.cloudflare.com/ajax/libs/blockly/9.0.0/javascript.min.js';
    const blocklyMediaPath = 'https://cdnjs.cloudflare.com/ajax/libs/blockly/9.0.0/media/';

    loadScript(blocklyMainSrc)
    .then(() => {
        const BlocklyGlobal = (window as any).Blockly;
        if (!BlocklyGlobal) {
            throw new Error('Blockly global not found after loading main script for Scratch UI.');
        }
        console.log(`Blockly main loaded for Scratch UI. Version: ${BlocklyGlobal.VERSION}`);

        if (BlocklyGlobal.utils?.global) {
          BlocklyGlobal.utils.global.blocklyPath = blocklyMediaPath;
        } else {
          BlocklyGlobal.MEDIA_PATH = blocklyMediaPath; 
        }
        
        return Promise.all([
          loadScript(blocklyBlocksSrc),
          loadScript(blocklyJsGeneratorSrc)
        ]);
    })
    .then(() => {
      const BlocklyGlobal = (window as any).Blockly;
      if (!BlocklyGlobal.Blocks) {
        throw new Error('Blockly.Blocks not found after loading blocks script for Scratch UI.');
      }
      if (!BlocklyGlobal.JavaScript) {
        throw new Error('Blockly.JavaScript generator not found for Scratch UI.');
      }
      console.log("Blockly core, Blocks, and JS Generator loaded for Scratch UI.");

      // Define Scratch-like block styles if not already present
      if (BlocklyGlobal.Theme && !BlocklyGlobal.Themes.scratch) {
        console.log("Defining 'scratch' theme for Blockly.");
        BlocklyGlobal.Theme.defineTheme('scratch', {
          'base': BlocklyGlobal.Themes.Classic, // Or another base like Zelos if preferred as direct base
          'blockStyles': {
            'motion_blocks': {'colourPrimary': '#4C97FF', 'colourSecondary': '#4280D7', 'colourTertiary': '#3373CC'},
            'looks_blocks': {'colourPrimary': '#9966FF', 'colourSecondary': '#855CD6', 'colourTertiary': '#774DCB'},
            'sound_blocks': {'colourPrimary': '#CF63CF', 'colourSecondary': '#C94FC9', 'colourTertiary': '#BD42BD'},
            'event_blocks': {'colourPrimary': '#FFBF00', 'colourSecondary': '#E6AC00', 'colourTertiary': '#CC9900'},
            'control_blocks': {'colourPrimary': '#FFAB19', 'colourSecondary': '#EC9C13', 'colourTertiary': '#CF8B17'},
            'sensing_blocks': {'colourPrimary': '#5CB1D6', 'colourSecondary': '#47A8D1', 'colourTertiary': '#2E8EB8'},
            'operators_blocks': {'colourPrimary': '#59C059', 'colourSecondary': '#46B946', 'colourTertiary': '#389438'},
            'variables_blocks': {'colourPrimary': '#FF8C1A', 'colourSecondary': '#FF8000', 'colourTertiary': '#DB6E00'},
            'text_blocks': {'colourPrimary': '#59C059', 'colourSecondary': '#46B946', 'colourTertiary': '#389438'} // Match operators for consistency if desired
          },
          'categoryStyles': {
            'motion_category': {'colour': '#4C97FF'},
            'looks_category': {'colour': '#9966FF'},
            'sound_category': {'colour': '#CF63CF'},
            'event_category': {'colour': '#FFBF00'},
            'control_category': {'colour': '#FFAB19'},
            'sensing_category': {'colour': '#5CB1D6'},
            'operators_category': {'colour': '#59C059'},
            'variables_category': {'colour': '#FF8C1A'}
          },
          'fontStyle': { 'family': '"Helvetica Neue", Helvetica, Arial, sans-serif', 'weight': 'bold', 'size': 11 } // Scratch uses bolder, smaller font
        });
      } else if(BlocklyGlobal.Theme && BlocklyGlobal.Themes.scratch) {
        console.log("'scratch' theme already defined.");
      } else {
        console.warn("Blockly.Theme not available for defining 'scratch' theme.");
      }
      console.log("Scratch-like Blockly environment setup complete.");
      resolve();
    }).catch(error => {
        console.error("Error in loadScratchLikeBlockly chain:", error);
        reject(error);
    });
  });
};

const useScratchBlocksLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const attemptLoad = useCallback(() => {
    setLoadError(null);
    setIsReady(false);
    console.log("useScratchBlocksLoader: attempting to load Scratch-like Blockly.");
    loadScratchLikeBlockly()
      .then(() => {
        console.log("useScratchBlocksLoader: Scratch-like Blockly loaded successfully.");
        setIsReady(true);
        setIsLoading(false);
        setLoadError(null);
      })
      .catch((error) => {
        console.error("useScratchBlocksLoader: Load Error:", error);
        setLoadError(error.message || "Unknown error loading Scratch-like Blockly.");
        setIsLoading(false);
        setIsReady(false);
      });
  }, []);

  useEffect(() => {
     if (isLoading && !isReady && !loadError) {
      attemptLoad();
    }
  }, [isLoading, isReady, loadError, attemptLoad]);

  const retry = useCallback(() => {
    console.log("useScratchBlocksLoader: Retry initiated.");
    setLoadError(null);
    setIsReady(false);
    setIsLoading(true); // Trigger useEffect
  }, []);

  return { isLoading, loadError, isReady, retry };
};

interface ScratchQuestionComponentProps {
  question: ScratchProgrammingQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null;
  showCorrectAnswer?: boolean;
}

export const ScratchProgrammingQuestionUI: React.FC<ScratchQuestionComponentProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer = false,
}) => {
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);
  const [isInitializingComponent, setIsInitializingComponent] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);
  
  const { isLoading: scratchLoading, loadError: scratchLoadError, isReady: scratchReady, retry } = useScratchBlocksLoader();

  const updateAnswer = useCallback(() => {
    if (workspaceRef.current && !showCorrectAnswer && scratchReady) {
      const LocalBlockly = (window as any).Blockly;
      if (!LocalBlockly?.Xml?.workspaceToDom || !LocalBlockly?.Xml?.domToText) {
          console.warn("Blockly.Xml methods not available for Scratch updateAnswer.");
          return;
      }
      try {
        const xml = LocalBlockly.Xml.workspaceToDom(workspaceRef.current);
        const xmlText = LocalBlockly.Xml.domToText(xml);
        onAnswerChange(xmlText);
      } catch (e) {
        console.error("Error serializing Scratch workspace to XML:", e);
      }
    }
  }, [onAnswerChange, showCorrectAnswer, scratchReady]);

  const defineScratchCustomBlocks = useCallback((Blockly: any) => {
    if (!Blockly || !Blockly.Blocks) {
        console.warn("Blockly.Blocks not available for defining Scratch custom blocks.");
        return;
    }
    console.log("Defining Scratch custom blocks...");
    // Event blocks
    if (!Blockly.Blocks['event_whenflagclicked']) {
      Blockly.Blocks['event_whenflagclicked'] = { init: function() { this.appendDummyInput().appendField("when 🏁 clicked"); this.setNextStatement(true, null); this.setTooltip("Runs when the green flag is clicked"); this.setStyle('event_blocks'); } };
    }
    if (!Blockly.Blocks['event_whenkeypressed']) {
      Blockly.Blocks['event_whenkeypressed'] = { init: function() { this.appendDummyInput().appendField("when").appendField(new Blockly.FieldDropdown([["space","SPACE"], ["up arrow","UP"], ["down arrow","DOWN"], ["left arrow","LEFT"], ["right arrow","RIGHT"], ["any","ANY"], ["a","A"], ["b","B"], ["c","C"], ["1","ONE"]]), "KEY").appendField("key pressed"); this.setNextStatement(true, null); this.setTooltip("Runs when the specified key is pressed"); this.setStyle('event_blocks');}};
    }
    // Motion blocks
    if (!Blockly.Blocks['motion_movesteps']) {
      Blockly.Blocks['motion_movesteps'] = { init: function() { this.appendValueInput("STEPS").setCheck("Number").appendField("move"); this.appendDummyInput().appendField("steps"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setTooltip("Move forward by the specified number of steps"); this.setStyle('motion_blocks'); }};
    }
    if (!Blockly.Blocks['motion_turnright']) {
      Blockly.Blocks['motion_turnright'] = { init: function() { this.appendValueInput("DEGREES").setCheck("Number").appendField("turn ↻"); this.appendDummyInput().appendField("degrees"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setTooltip("Turn clockwise by the specified degrees"); this.setStyle('motion_blocks'); }};
    }
    if (!Blockly.Blocks['motion_turnleft']) {
      Blockly.Blocks['motion_turnleft'] = { init: function() { this.appendValueInput("DEGREES").setCheck("Number").appendField("turn ↺"); this.appendDummyInput().appendField("degrees"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setTooltip("Turn counter-clockwise by the specified degrees"); this.setStyle('motion_blocks'); }};
    }
    // Looks blocks
    if (!Blockly.Blocks['looks_say']) {
      Blockly.Blocks['looks_say'] = { init: function() { this.appendValueInput("MESSAGE").setCheck("String").appendField("say"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setTooltip("Display a speech bubble with the message"); this.setStyle('looks_blocks'); }};
    }
     if (!Blockly.Blocks['looks_think']) {
      Blockly.Blocks['looks_think'] = { init: function() { this.appendValueInput("MESSAGE").setCheck("String").appendField("think"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setTooltip("Display a thought bubble with the message"); this.setStyle('looks_blocks'); }};
    }
    // Control blocks
    if(!Blockly.Blocks['control_wait']){
      Blockly.Blocks['control_wait'] = { init: function() { this.appendValueInput("DURATION").setCheck("Number").appendField("wait"); this.appendDummyInput().appendField("seconds"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setTooltip("Pause for the specified number of seconds"); this.setStyle('control_blocks'); }};
    }
    if(!Blockly.Blocks['control_repeat']){
        Blockly.Blocks['control_repeat'] = { init: function() { this.appendValueInput("TIMES").setCheck("Number").appendField("repeat"); this.appendStatementInput("SUBSTACK").setCheck(null); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setTooltip("Repeat the enclosed blocks the specified number of times"); this.setStyle('control_blocks'); }};
    }
    if(!Blockly.Blocks['control_forever']){
        Blockly.Blocks['control_forever'] = { init: function() { this.appendDummyInput().appendField("forever"); this.appendStatementInput("SUBSTACK").setCheck(null); this.setPreviousStatement(true, null); this.setColour('#FFAB19'); this.setTooltip("Repeat the enclosed blocks forever"); this.setStyle('control_blocks'); }};
    }
    if(!Blockly.Blocks['control_if']){
        Blockly.Blocks['control_if'] = { init: function() { this.appendValueInput("CONDITION").setCheck("Boolean").appendField("if"); this.appendDummyInput().appendField("then"); this.appendStatementInput("SUBSTACK").setCheck(null); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setTooltip("Execute blocks if condition is true"); this.setStyle('control_blocks'); }};
    }
     // Operator blocks
    if(!Blockly.Blocks['operator_add']){
        Blockly.Blocks['operator_add'] = { init: function() { this.appendValueInput("NUM1").setCheck("Number"); this.appendValueInput("NUM2").setCheck("Number").appendField("+"); this.setOutput(true, "Number"); this.setTooltip("Add two numbers"); this.setStyle('operators_blocks'); }};
    }
    if(!Blockly.Blocks['operator_subtract']){
        Blockly.Blocks['operator_subtract'] = { init: function() { this.appendValueInput("NUM1").setCheck("Number"); this.appendValueInput("NUM2").setCheck("Number").appendField("-"); this.setOutput(true, "Number"); this.setTooltip("Subtract two numbers"); this.setStyle('operators_blocks'); }};
    }
    console.log("Scratch custom blocks defined (or ensured).");
  }, []);


  const initializeScratchWorkspace = useCallback(() => {
    if (!scratchReady || !blocklyDivRef.current) {
        console.warn("Scratch-like Blockly not ready or div ref not available for workspace initialization.");
        return;
    }

    const LocalBlockly = (window as any).Blockly;
    if (!LocalBlockly?.inject || !LocalBlockly?.Xml || !LocalBlockly?.Events || !LocalBlockly?.Themes?.scratch) {
        setComponentError("Scratch-like Blockly theme or essential parts are missing.");
        setIsInitializingComponent(false);
        return;
    }
    
    try {
        defineScratchCustomBlocks(LocalBlockly);
    } catch (blockDefError) {
        console.error("Error defining Scratch custom blocks:", blockDefError);
        setComponentError("Failed to define custom Scratch blocks.");
        setIsInitializingComponent(false);
        return;
    }


    setComponentError(null);
    setIsInitializingComponent(true);
    console.log(`Initializing Scratch workspace for question: ${question.id}`);

    if (workspaceRef.current?.dispose && typeof workspaceRef.current.dispose === 'function') {
      try {
        console.log("Disposing existing Scratch workspace.");
        workspaceRef.current.dispose();
      } catch (disposeError) {
         console.error("Error disposing existing Scratch workspace:", disposeError);
      }
      workspaceRef.current = null;
    }

    while (blocklyDivRef.current.firstChild) {
      blocklyDivRef.current.removeChild(blocklyDivRef.current.firstChild);
    }

    try {
      const toolbox = question.toolboxDefinition || `
        <xml xmlns="https://developers.google.com/blockly/xml">
          <category name="Events" categorystyle="event_category"><block type="event_whenflagclicked"></block><block type="event_whenkeypressed"></block></category>
          <category name="Motion" categorystyle="motion_category"><block type="motion_movesteps"><value name="STEPS"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block><block type="motion_turnright"><value name="DEGREES"><shadow type="math_number"><field name="NUM">15</field></shadow></value></block><block type="motion_turnleft"><value name="DEGREES"><shadow type="math_number"><field name="NUM">15</field></shadow></value></block></category>
          <category name="Looks" categorystyle="looks_category"><block type="looks_say"><value name="MESSAGE"><shadow type="text"><field name="TEXT">Hello!</field></shadow></value></block><block type="looks_think"><value name="MESSAGE"><shadow type="text"><field name="TEXT">Hmm...</field></shadow></value></block></category>
          <category name="Control" categorystyle="control_category"><block type="control_wait"><value name="DURATION"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block><block type="control_repeat"><value name="TIMES"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block><block type="control_forever"></block><block type="control_if"></block></category>
          <category name="Operators" categorystyle="operators_category"><block type="operator_add"><value name="NUM1"><shadow type="math_number"><field name="NUM"></field></shadow></value><value name="NUM2"><shadow type="math_number"><field name="NUM"></field></shadow></value></block><block type="operator_subtract"><value name="NUM1"><shadow type="math_number"><field name="NUM"></field></shadow></value><value name="NUM2"><shadow type="math_number"><field name="NUM"></field></shadow></value></block></category>
        </xml>`;

      const workspaceOptions: any = {
        toolbox: toolbox,
        scrollbars: true,
        trashcan: !showCorrectAnswer,
        readOnly: showCorrectAnswer,
        zoom: { controls: true, wheel: true, startScale: 0.8, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
        grid: { spacing: 20, length: 1, colour: '#e0e0e0', snap: true },
        theme: LocalBlockly.Themes.scratch, // Apply the Scratch-like theme
      };
      if (LocalBlockly.zelos) { // Check if Zelos renderer is available
        workspaceOptions.renderer = 'zelos';
      } else {
        console.warn("Zelos renderer not found, using default Blockly renderer for Scratch UI.");
      }

      const workspace = LocalBlockly.inject(blocklyDivRef.current, workspaceOptions);
      workspaceRef.current = workspace;
      console.log("Scratch workspace injected.");

      let xmlToLoad: string | null = null;
      if (showCorrectAnswer && question.solutionWorkspaceXML) {
        xmlToLoad = question.solutionWorkspaceXML;
        console.log("Loading solution XML for Scratch.");
      } else if (userAnswer && typeof userAnswer === 'string' && userAnswer.trim().startsWith('<xml')) {
        xmlToLoad = userAnswer; // Initial load of userAnswer
        console.log("Loading user answer XML for Scratch initial setup.");
      } else if (question.initialWorkspace) {
        xmlToLoad = question.initialWorkspace;
        console.log("Loading initial workspace XML for Scratch.");
      }

      if (xmlToLoad) {
        try {
          const dom = LocalBlockly.Xml.textToDom(xmlToLoad);
          LocalBlockly.Xml.domToWorkspace(dom, workspace);
          console.log("XML loaded into Scratch workspace.");
        } catch (e) {
          console.error("Error loading XML to Scratch workspace:", e, "XML was:", xmlToLoad);
          setComponentError("Error loading blocks into workspace.");
        }
      }

      if (workspace.scrollCenter && typeof workspace.scrollCenter === 'function') workspace.scrollCenter();
      if (LocalBlockly.svgResize && typeof LocalBlockly.svgResize === 'function') LocalBlockly.svgResize(workspace);

      if (!showCorrectAnswer) {
        workspace.addChangeListener((event: any) => {
          try {
            if (!workspaceRef.current) {
                console.warn('Scratch workspaceRef is null in change listener, skipping.');
                return;
            }
            const CurrentBlockly = (window as any).Blockly;
            if (!CurrentBlockly || !CurrentBlockly.Events || typeof event?.type === 'undefined') {
              console.warn('Blockly or Blockly.Events not available in change listener callback for Scratch.');
              return;
            }
             if (event.isUiEvent || event.type === CurrentBlockly.Events.VIEWPORT_CHANGE || event.group === 'drag') {
                if(event.type === CurrentBlockly.Events.FINISHED_LOADING) {/* Allow */} else {return;}
            }
            const significantEventTypes = [
              CurrentBlockly.Events.BLOCK_MOVE, CurrentBlockly.Events.BLOCK_CREATE,
              CurrentBlockly.Events.BLOCK_DELETE, CurrentBlockly.Events.BLOCK_CHANGE,
              CurrentBlockly.Events.VAR_CREATE, CurrentBlockly.Events.VAR_DELETE,
              CurrentBlockly.Events.VAR_RENAME, CurrentBlockly.Events.FINISHED_LOADING
            ].filter(Boolean);
            if (significantEventTypes.includes(event.type)) {
              console.log("Scratch relevant event, updating answer:", event.type);
              updateAnswer();
            }
          } catch (listenerError) {
            console.error("Error in Scratch change listener:", listenerError, "Raw Event:", event);
          }
        });
        console.log("Scratch change listener added.");
      }
      setIsInitializingComponent(false);
      console.log("Scratch workspace initialization complete.");
    } catch (e) {
      console.error("Error initializing Scratch workspace:", e);
      setComponentError(`Failed to initialize Scratch workspace: ${e instanceof Error ? e.message : String(e)}`);
      setIsInitializingComponent(false);
    }
  }, [scratchReady, question.id, question.toolboxDefinition, question.initialWorkspace, question.solutionWorkspaceXML, showCorrectAnswer, updateAnswer, defineScratchCustomBlocks]); // Removed userAnswer

  useEffect(() => {
    if (scratchReady && blocklyDivRef.current) {
      console.log(`Scratch-like Blockly is ready, question ID: ${question.id}. Initializing workspace.`);
      initializeScratchWorkspace();
    }
    return () => {
      if (workspaceRef.current?.dispose && typeof workspaceRef.current.dispose === 'function') {
        try {
            console.log(`Disposing Scratch workspace for question: ${question.id}`);
            workspaceRef.current.dispose();
        } catch(e){console.error("Error disposing Scratch UI workspace:", e)}
        workspaceRef.current = null;
      }
    };
  }, [scratchReady, question.id, initializeScratchWorkspace]);


  useEffect(() => { 
    if (scratchReady && workspaceRef.current && !showCorrectAnswer && typeof userAnswer === 'string' && userAnswer.trim().startsWith('<xml')) {
      const LocalBlockly = (window as any).Blockly;
      if (!LocalBlockly?.Xml || !workspaceRef.current) return;
      try {
        const currentWorkspaceXML = LocalBlockly.Xml.domToText(LocalBlockly.Xml.workspaceToDom(workspaceRef.current));
        if (currentWorkspaceXML !== userAnswer) {
          console.log(`External userAnswer changed for Scratch question ${question.id}, reloading workspace XML.`);
          LocalBlockly.Xml.clearWorkspace(workspaceRef.current);
          const dom = LocalBlockly.Xml.textToDom(userAnswer);
          LocalBlockly.Xml.domToWorkspace(dom, workspaceRef.current);
          if(workspaceRef.current.scrollCenter && typeof workspaceRef.current.scrollCenter === 'function') workspaceRef.current.scrollCenter();
        }
      } catch (e) {
        console.error("Error applying external userAnswer to Scratch workspace:", e);
        setComponentError("Failed to load your saved progress into the workspace.");
      }
    }
  }, [userAnswer, scratchReady, showCorrectAnswer, question.id]);

  useEffect(() => {
    const handleResize = () => {
      if (workspaceRef.current && scratchReady) {
        const LocalBlockly = (window as any).Blockly;
        if (!LocalBlockly?.svgResize || !workspaceRef.current) {
           console.warn("Blockly or svgResize not available in resize handler (Scratch).");
           return;
        }
        try {LocalBlockly.svgResize(workspaceRef.current);} catch(e) {console.error("Error resizing Scratch UI workspace:", e)}
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scratchReady]);

  const workspaceHeight = showCorrectAnswer ? '350px' : '500px';

  if (scratchLoading) {
    return <div style={{ height: workspaceHeight, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#f0f0f0', borderRadius:'8px'}}><p className="animate-pulse text-slate-600">Loading Scratch Environment...</p></div>;
  }
  if (scratchLoadError) {
    return <div style={{ height: workspaceHeight, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', backgroundColor:'#fff0f0', border:'1px solid red', borderRadius:'8px', padding:'10px'}}><p className="text-red-600 font-semibold text-center">Failed to load Scratch Env: {scratchLoadError}</p><button onClick={retry} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">Retry</button></div>;
  }

  return (
    <div className="space-y-4 scratch-theme"> {/* Added scratch-theme class here */}
      <div ref={blocklyDivRef} style={{ height: workspaceHeight, width: '100%', borderRadius: '12px', border: `1px solid ${componentError ? '#ef4444' : '#e2e8f0'}`, backgroundColor: '#ffffff', position: 'relative', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
        {(isInitializingComponent || (!workspaceRef.current && scratchReady && !scratchLoadError && !componentError)) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-xl z-10"><p className="text-slate-500 animate-pulse">Initializing Scratch Workspace...</p></div>
        )}
        {componentError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 bg-opacity-90 rounded-xl p-4 z-10 text-center"><p className="text-red-600 text-sm mb-2">Workspace Error: {componentError}</p><button onClick={initializeScratchWorkspace} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Retry Init</button></div>
        )}
      </div>
      {showCorrectAnswer && question.solutionWorkspaceXML && userAnswer !== question.solutionWorkspaceXML && !componentError && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm"><h4 className="font-semibold text-blue-700">Solution View:</h4><p className="text-blue-600">You are viewing the provided solution.</p></div>
      )}
    </div>
  );
};
