import { QuizConfig } from '../../types';

// Basic Toolbox XML for Blockly (Logic, Loops, Math, Text, Variables)
const basicToolboxXml = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <category name="Logic" colour="%{BKY_LOGIC_HUE}">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
    <block type="logic_operation"></block>
    <block type="logic_negate"></block>
    <block type="logic_boolean"></block>
  </category>
  <category name="Loops" colour="%{BKY_LOOPS_HUE}">
    <block type="controls_repeat_ext">
      <value name="TIMES">
        <shadow type="math_number">
          <field name="NUM">10</field>
        </shadow>
      </value>
    </block>
    <block type="controls_whileUntil"></block>
  </category>
  <category name="Math" colour="%{BKY_MATH_HUE}">
    <block type="math_number">
      <field name="NUM">123</field>
    </block>
    <block type="math_arithmetic">
      <value name="A">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
      <value name="B">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
    </block>
    <block type="math_single">
      <value name="NUM">
        <shadow type="math_number">
          <field name="NUM">9</field>
        </shadow>
      </value>
    </block>
  </category>
  <category name="Text" colour="%{BKY_TEXTS_HUE}">
    <block type="text"></block>
    <block type="text_join"></block>
    <block type="text_append">
      <value name="TEXT">
        <shadow type="text"></shadow>
      </value>
    </block>
    <block type="text_print"></block>
  </category>
  <sep></sep>
  <category name="Variables" colour="%{BKY_VARIABLES_HUE}" custom="VARIABLE"></category>
  <category name="Functions" colour="%{BKY_PROCEDURES_HUE}" custom="PROCEDURE"></category>
</xml>
`;

// Sample initial workspace: just a single print block
const initialPrintBlockXml = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="text_print" id="initial_print_block" x="70" y="70">
    <value name="TEXT">
      <shadow type="text">
        <field name="TEXT">abc</field>
      </shadow>
    </value>
  </block>
</xml>
`;
// Sample solution workspace: print "Hello World"
const solutionPrintHelloWorldXml = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="text_print" id="solution_print_block" x="70" y="70">
    <value name="TEXT">
      <shadow type="text" id="text_shadow_hello">
        <field name="TEXT">Hello World</field>
      </shadow>
    </value>
  </block>
</xml>
`;

// Scratch-like toolbox (subset for demo)
const scratchToolboxXml = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <category name="Events" categorystyle="event_category">
    <block type="event_whenflagclicked"></block>
  </category>
  <category name="Looks" categorystyle="looks_category">
    <block type="looks_say">
      <value name="MESSAGE">
        <shadow type="text">
          <field name="TEXT">Hello!</field>
        </shadow>
      </value>
    </block>
  </category>
  <category name="Control" categorystyle="control_category">
    <block type="control_wait">
      <value name="DURATION">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
    </block>
  </category>
</xml>
`;

const scratchInitialWorkspaceXml = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="event_whenflagclicked" x="20" y="20">
    <next>
      <block type="looks_say">
        <value name="MESSAGE">
          <shadow type="text">
            <field name="TEXT">Start here...</field>
          </shadow>
        </value>
      </block>
    </next>
  </block>
</xml>
`;

const scratchSolutionHelloWorldXml = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="event_whenflagclicked" x="20" y="20">
    <next>
      <block type="looks_say">
        <value name="MESSAGE">
          <block type="text">
            <field name="TEXT">Hello World</field>
          </block>
        </value>
      </block>
    </next>
  </block>
</xml>
`;


export const sampleQuiz: QuizConfig = {
  id: "sample-quiz-1",
  title: "Comprehensive Knowledge Challenge",
  description: "Test your knowledge with these varied questions, including new types!",
  settings: {
    shuffleQuestions: false,
    showCorrectAnswers: "end_of_quiz",
    passingScorePercent: 70,
    shuffleOptions: true, // General setting for MCQs, MRQs, Matching
  },
  questions: [
    {
      id: "q1",
      questionType: "multiple_choice",
      prompt: "What is the capital of France?",
      points: 10,
      options: [
        { id: "q1-opt1", text: "Berlin" },
        { id: "q1-opt2", text: "Madrid" },
        { id: "q1-opt3", text: "Paris" },
        { id: "q1-opt4", text: "Rome" }
      ],
      correctAnswerId: "q1-opt3",
      explanation: "Paris is the capital and most populous city of France."
    },
    {
      id: "q2",
      questionType: "multiple_response",
      prompt: "Which of the following are primary colors in the RGB model?",
      points: 10,
      options: [
        { id: "q2-opt1", text: "Red" },
        { id: "q2-opt2", text: "Green" },
        { id: "q2-opt3", "text": "Blue" },
        { id: "q2-opt4", text: "Yellow" }
      ],
      correctAnswerIds: ["q2-opt1", "q2-opt2", "q2-opt3"],
      explanation: "In the additive RGB color model, Red, Green, and Blue are the primary colors."
    },
    {
      id: "q3",
      questionType: "fill_in_the_blanks",
      prompt: "The sun rises in the {blank1} and sets in the {blank2}.",
      points: 10,
      segments: [
        { type: "text", content: "The sun rises in the " },
        { type: "blank", id: "blank1" },
        { type: "text", content: " and sets in the " },
        { type: "blank", id: "blank2" },
        { type: "text", content: "." }
      ],
      answers: [
        { blankId: "blank1", acceptedValues: ["east"] },
        { blankId: "blank2", acceptedValues: ["west"] }
      ],
      isCaseSensitive: false, // Explicitly set case sensitivity
      explanation: "Due to Earth's rotation, the sun appears to rise in the East and set in the West."
    },
    {
      id: "q4",
      questionType: "drag_and_drop",
      prompt: "Match the country to its flag characteristic color.",
      points: 15,
      draggableItems: [
        { id: "item_japan", content: "Japan" },
        { id: "item_canada", content: "Canada" },
        { id: "item_brazil", content: "Brazil" }
      ],
      dropZones: [
        { id: "zone_red", label: "Predominantly Red" },
        { id: "zone_green", label: "Predominantly Green" },
        { id: "zone_white_red", label: "Red & White" }
      ],
      answerMap: [
        { draggableId: "item_japan", dropZoneId: "zone_white_red" },
        { draggableId: "item_canada", dropZoneId: "zone_red" },
        { draggableId: "item_brazil", dropZoneId: "zone_green" }
      ],
      explanation: "Japan: Red circle on white. Canada: Red maple leaf. Brazil: Green field, yellow rhombus, blue circle."
    },
    {
      id: "q5",
      questionType: "true_false",
      prompt: "The Great Wall of China is visible from the moon with the naked eye.",
      points: 5,
      correctAnswer: false,
      explanation: "This is a common misconception. The Great Wall is not visible from the moon without aid."
    },
    {
      id: "q6",
      questionType: "short_answer",
      prompt: "What is the chemical symbol for water?",
      points: 5,
      acceptedAnswers: ["H2O", "H₂O"],
      isCaseSensitive: false,
      explanation: "The chemical symbol for water is H₂O, representing two hydrogen atoms and one oxygen atom."
    },
    {
      id: "q7",
      questionType: "numeric",
      prompt: "How many days are in a leap year?",
      points: 5,
      answer: 366,
      explanation: "A leap year has 366 days, with an extra day (February 29th)."
    },
    {
      id: "q8",
      questionType: "numeric",
      prompt: "What is the approximate value of Pi (to 2 decimal places)? Enter the value.",
      points: 5,
      answer: 3.14,
      tolerance: 0.005, // Accepts 3.135 to 3.145
      explanation: "Pi (π) is approximately 3.14. A small tolerance is allowed for this answer."
    },
    {
      id: "q9",
      questionType: "sequence",
      prompt: "Arrange the first three planets of our solar system in order from the Sun.",
      points: 10,
      items: [
        { id: "earth", content: "Earth" },
        { id: "mercury", content: "Mercury" },
        { id: "venus", content: "Venus" }
      ],
      correctOrder: ["mercury", "venus", "earth"],
      explanation: "The correct order from the Sun is Mercury, Venus, Earth."
    },
    {
      id: "q10",
      questionType: "matching",
      prompt: "Match the inventors to their inventions.",
      points: 15,
      prompts: [
        { id: "prompt_bell", content: "Alexander Graham Bell" },
        { id: "prompt_edison", content: "Thomas Edison" },
        { id: "prompt_wright", content: "Wright Brothers" }
      ],
      options: [
        { id: "option_bulb", content: "Light Bulb (practical)" },
        { id: "option_plane", content: "Airplane" },
        { id: "option_telephone", content: "Telephone" }
      ],
      correctAnswerMap: [
        { promptId: "prompt_bell", optionId: "option_telephone" },
        { promptId: "prompt_edison", optionId: "option_bulb" },
        { promptId: "prompt_wright", optionId: "option_plane" }
      ],
      shuffleOptions: true, // Will use quizConfig.settings.shuffleOptions if true here
      explanation: "Bell - Telephone, Edison - Light Bulb, Wright Brothers - Airplane."
    },
    {
      id: "q11",
      questionType: "hotspot",
      prompt: "Click on the continent of Africa on the map.",
      points: 10,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1280px-World_map_-_low_resolution.svg.png", // Sample public domain map
      imageAltText: "A world map showing continents.",
      hotspots: [
        // Coordinates are [x_percent, y_percent, width_percent, height_percent] for rect
        // Coordinates are [cx_percent, cy_percent, radius_percent] for circle
        // These are rough estimates for Africa on the provided map.
        { id: "africa_hs", shape: "rect", coords: [45, 40, 15, 30], description: "Africa" },
        { id: "s_america_hs", shape: "rect", coords: [28, 50, 12, 25], description: "South America" },
        { id: "n_america_hs", shape: "rect", coords: [15, 15, 25, 30], description: "North America" },
        { id: "europe_hs", shape: "rect", coords: [45,15,15,15], description: "Europe" },
        { id: "asia_hs", shape: "rect", coords: [60,15,30,35], description: "Asia"},
        { id: "australia_hs", shape: "rect", coords: [78,60,12,15], description: "Australia"}
      ],
      correctHotspotIds: ["africa_hs"],
      explanation: "The highlighted region on the map is Africa."
    },
    {
      id: "q12_blockly",
      questionType: "blockly_programming", // Updated type
      prompt: "Using the Blockly blocks, create a program that prints 'Hello World' to the console (conceptually).",
      points: 20,
      toolboxDefinition: basicToolboxXml,
      initialWorkspace: initialPrintBlockXml,
      solutionWorkspaceXML: solutionPrintHelloWorldXml,
      explanation: "The solution involves using a 'text_print' block (or equivalent) with the text 'Hello World'."
    },
    {
      id: "q13_scratch",
      questionType: "scratch_programming",
      prompt: "Using Scratch-style blocks, make the character say 'Hello World' when the green flag is clicked.",
      points: 20,
      toolboxDefinition: scratchToolboxXml, // Use a Scratch-like toolbox definition
      initialWorkspace: scratchInitialWorkspaceXml,
      solutionWorkspaceXML: scratchSolutionHelloWorldXml,
      explanation: "The solution uses an 'event_whenflagclicked' block followed by a 'looks_say' block with 'Hello World'."
    }
  ]
};