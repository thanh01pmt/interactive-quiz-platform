
import { QuizQuestion, QuestionTypeStrings, BaseQuestion } from '../../types';
import { generateUniqueId } from '../../utils/idGenerators';

// This helper creates the common part of a question, matching BaseQuestion (excluding id and questionType)
// All fields from BaseQuestion (except id and questionType) should be listed here with default values.
const createBaseQuestionPart = (): Omit<BaseQuestion, 'id' | 'questionType'> => {
  return {
    prompt: '',
    points: 10,
    explanation: '',
    learningObjective: '', 
    glossary: [],           
    bloomLevel: '',         
    difficulty: 'medium',   
    category: '',           
    topic: '',              
    gradeBand: '',          
    contextCode: '',
    course: '', // Added course to BaseQuestion, so initializing it here
  };
};

export const getNewQuestionTemplate = (type: QuestionTypeStrings): QuizQuestion => {
  const basePart = createBaseQuestionPart();
  const id = generateUniqueId('q_'); 

  switch (type) {
    case 'multiple_choice':
      return {
        ...basePart,
        id,
        questionType: 'multiple_choice',
        options: [{ id: generateUniqueId('opt_'), text: '' }],
        correctAnswerId: '',
      };
    case 'multiple_response':
      return {
        ...basePart,
        id,
        questionType: 'multiple_response',
        options: [{ id: generateUniqueId('opt_'), text: '' }],
        correctAnswerIds: [],
      };
    case 'true_false':
      return {
        ...basePart,
        id,
        questionType: 'true_false',
        correctAnswer: false,
      };
    case 'short_answer':
        return {
            ...basePart,
            id,
            questionType: 'short_answer',
            acceptedAnswers: [''],
            isCaseSensitive: false,
        };
    case 'numeric':
        return {
            ...basePart,
            id,
            questionType: 'numeric',
            answer: 0,
            tolerance: 0,
        };
    case 'fill_in_the_blanks':
        const blankId = generateUniqueId('blank_');
        return {
            ...basePart,
            id,
            questionType: 'fill_in_the_blanks',
            segments: [ {type: 'text', content: 'Example: The capital of France is '}, {type: 'blank', id: blankId} ],
            answers: [{ blankId: blankId, acceptedValues: ['Paris'] }],
            isCaseSensitive: false,
        };
    case 'sequence':
        const seqItemId1 = generateUniqueId('seq_item_');
        const seqItemId2 = generateUniqueId('seq_item_');
        return {
            ...basePart,
            id,
            questionType: 'sequence',
            items: [{id: seqItemId1, content: 'Item 1'}, {id: seqItemId2, content: 'Item 2'}],
            correctOrder: [seqItemId1, seqItemId2], 
        };
    case 'matching':
        const promptId = generateUniqueId('match_p_');
        const optionId = generateUniqueId('match_o_');
        return {
            ...basePart,
            id,
            questionType: 'matching',
            prompts: [{id: promptId, content: 'Prompt 1'}],
            options: [{id: optionId, content: 'Option A'}],
            correctAnswerMap: [{promptId, optionId}],
            shuffleOptions: true,
        };
    case 'drag_and_drop':
        const dragId = generateUniqueId('drag_');
        const dropId = generateUniqueId('drop_');
        return {
            ...basePart,
            id,
            questionType: 'drag_and_drop',
            draggableItems: [{id: dragId, content: 'Draggable 1'}],
            dropZones: [{id: dropId, label: 'Drop Zone A'}],
            answerMap: [{draggableId: dragId, dropZoneId: dropId}],
        };
    case 'hotspot':
        return {
            ...basePart,
            id,
            questionType: 'hotspot',
            imageUrl: 'https://via.placeholder.com/600x400.png?text=Upload+Hotspot+Image',
            imageAltText: 'Placeholder hotspot image',
            hotspots: [{id: generateUniqueId('hs_'), shape: 'rect', coords: [10,10,20,20], description: 'Hotspot 1'}],
            correctHotspotIds: [],
        };
    case 'blockly_programming':
        return {
            ...basePart,
            id,
            questionType: 'blockly_programming',
            toolboxDefinition: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>', // Default empty toolbox
            initialWorkspace: '',
            solutionWorkspaceXML: '',
        };
    case 'scratch_programming':
        return {
            ...basePart,
            id,
            questionType: 'scratch_programming',
            toolboxDefinition: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>', // Default empty toolbox
            initialWorkspace: '',
            solutionWorkspaceXML: '',
        };
    default:
      // This ensures that if QuestionTypeStrings gets a new type, TypeScript will complain here
      // if we haven't added a case for it, because `type` would not be `never`.
      const _exhaustiveCheck: never = type;
      console.error(`Unhandled question type in getNewQuestionTemplate: ${_exhaustiveCheck}`);
      throw new Error(`Unhandled question type in getNewQuestionTemplate: ${type}`);
  }
};
