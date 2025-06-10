
import type { QuizQuestion, QuestionTypeStrings, BaseQuestion } from '../../../../types';
import { generateUniqueId } from '../../utils/idGenerators';

// This helper creates the common part of a question.
// To resolve "property X does not exist" errors, we simplify this to core fields.
// This assumes the BaseQuestion type seen by the compiler for this file is simpler.
const createBaseQuestionPart = (): Omit<BaseQuestion, 'id' | 'questionType' | 'learningObjective' | 'glossary' | 'bloomLevel' | 'difficulty' | 'category' | 'topic' | 'gradeBand' | 'contextCode' | 'course'> & Partial<Pick<BaseQuestion, 'learningObjective' | 'glossary' | 'bloomLevel' | 'difficulty' | 'category' | 'topic' | 'gradeBand' | 'contextCode' | 'course'>> => {
  return {
    prompt: '',
    points: 10,
    explanation: '',
    // The following are made optional at this level to satisfy stricter interpretations of BaseQuestion by the compiler for this context
    // Default values from full BaseQuestion are preferred if types align correctly across the project.
    // learningObjective: '', 
    // glossary: [],           
    // bloomLevel: '',         
    // difficulty: 'medium',   
    // category: '',           
    // topic: '',              
    // gradeBand: '',          
    // contextCode: '',
    // course: '',
  };
};

export const getNewQuestionTemplate = (type: QuestionTypeStrings): QuizQuestion => {
  const basePart = createBaseQuestionPart();
  const id = generateUniqueId('q_'); 

  // Full base question structure with all optional fields from the main types.ts definition
  const fullBase: Omit<BaseQuestion, 'id' | 'questionType'> = {
    prompt: basePart.prompt,
    points: basePart.points,
    explanation: basePart.explanation,
    learningObjective: '',
    glossary: [],
    bloomLevel: '',
    difficulty: 'medium',
    category: '',
    topic: '',
    gradeBand: '',
    contextCode: '',
    course: '',
  };


  switch (type) {
    case 'multiple_choice':
      return {
        ...fullBase, // Use fullBase which includes all optional metadata fields
        id,
        questionType: 'multiple_choice',
        options: [{ id: generateUniqueId('opt_'), text: '' }],
        correctAnswerId: '',
      };
    case 'multiple_response':
      return {
        ...fullBase,
        id,
        questionType: 'multiple_response',
        options: [{ id: generateUniqueId('opt_'), text: '' }],
        correctAnswerIds: [],
      };
    case 'true_false':
      return {
        ...fullBase,
        id,
        questionType: 'true_false',
        correctAnswer: false,
      };
    case 'short_answer':
        return {
            ...fullBase,
            id,
            questionType: 'short_answer',
            acceptedAnswers: [''],
            isCaseSensitive: false,
        };
    case 'numeric':
        return {
            ...fullBase,
            id,
            questionType: 'numeric',
            answer: 0,
            tolerance: 0,
        };
    case 'fill_in_the_blanks':
        const blankId = generateUniqueId('blank_');
        return {
            ...fullBase,
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
            ...fullBase,
            id,
            questionType: 'sequence',
            items: [{id: seqItemId1, content: 'Item 1'}, {id: seqItemId2, content: 'Item 2'}],
            correctOrder: [seqItemId1, seqItemId2], 
        };
    case 'matching':
        const promptId = generateUniqueId('match_p_');
        const optionId = generateUniqueId('match_o_');
        return {
            ...fullBase,
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
            ...fullBase,
            id,
            questionType: 'drag_and_drop',
            draggableItems: [{id: dragId, content: 'Draggable 1'}],
            dropZones: [{id: dropId, label: 'Drop Zone A'}],
            answerMap: [{draggableId: dragId, dropZoneId: dropId}],
        };
    case 'hotspot':
        return {
            ...fullBase,
            id,
            questionType: 'hotspot',
            imageUrl: 'https://via.placeholder.com/600x400.png?text=Upload+Hotspot+Image',
            imageAltText: 'Placeholder hotspot image',
            hotspots: [{id: generateUniqueId('hs_'), shape: 'rect', coords: [10,10,20,20], description: 'Hotspot 1'}],
            correctHotspotIds: [],
        };
    case 'blockly_programming':
        return {
            ...fullBase,
            id,
            questionType: 'blockly_programming',
            toolboxDefinition: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>', // Default empty toolbox
            initialWorkspace: '',
            solutionWorkspaceXML: '',
        };
    case 'scratch_programming':
        return {
            ...fullBase,
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
      // console.error(`Unhandled question type in getNewQuestionTemplate: ${_exhaustiveCheck}`);
      throw new Error(`Unhandled question type in getNewQuestionTemplate: ${type}`);
  }
};
