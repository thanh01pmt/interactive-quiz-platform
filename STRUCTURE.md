
# Project Structure

This document outlines the file and directory structure for the Interactive Quiz Kit project.
The project is organized with a core library in `src/`, an example application in `example/`, and a root-level application for development and demonstration.

## Root Level

```
.
├── App.tsx                   # Root application component (React)
├── index.html                # Main HTML file for the root application
├── index.tsx                 # Entry point for rendering the root App.tsx
├── metadata.json             # Application metadata for the hosting environment
├── package.json              # Project dependencies, scripts, and metadata
├── postcss.config.js         # PostCSS configuration
├── README.md                 # Project overview, setup, and usage instructions
├── rollup.config.js          # Rollup configuration for building the library
├── tsconfig.json             # TypeScript configuration for the entire project
├── vitest.config.ts          # Vitest configuration for testing
|
├── example/                  # Example Vite application demonstrating library usage
│   ├── index.html            # HTML entry point for the example app
│   ├── package.json          # Dependencies and scripts for the example app
│   ├── postcss.config.js     # PostCSS configuration for the example app
│   ├── tailwind.config.js    # Tailwind CSS configuration for the example app
│   ├── vite.config.js        # Vite configuration for the example app
│   ├── public/               # Static assets for the example app
│   │   └── blockly-styles.css # Global styles for Blockly/Scratch components
│   └── src/                  # Source code for the example app
│       ├── App.tsx           # Main React component for the example app
│       └── index.tsx         # Entry point for rendering the example App.tsx
│
└── src/                      # Source code for the 'interactive-quiz-kit' library
    ├── index.ts              # Main entry point for the library (exports modules)
    ├── types.ts              # TypeScript type definitions for the library
    │
    ├── components/           # Reusable UI components for the library
    │   ├── BlocklyProgrammingQuestionUI.tsx
    │   ├── DragAndDropQuestionUI.tsx
    │   ├── FillInTheBlanksQuestionUI.tsx
    │   ├── HotspotQuestionUI.tsx
    │   ├── MatchingQuestionUI.tsx
    │   ├── MultipleChoiceQuestionUI.tsx
    │   ├── MultipleResponseQuestionUI.tsx
    │   ├── NumericQuestionUI.tsx
    │   ├── QuestionRenderer.tsx
    │   ├── QuizDataManagement.tsx
    │   ├── QuizPlayer.tsx
    │   ├── QuizResult.tsx
    │   ├── ScratchProgrammingQuestionUI.tsx
    │   ├── SequenceQuestionUI.tsx
    │   ├── ShortAnswerQuestionUI.tsx
    │   ├── TrueFalseQuestionUI.tsx
    │   │
    │   ├── authoring/          # Components specific to the quiz authoring tool
    │   │   ├── AIQuestionGeneratorForm.tsx
    │   │   ├── AIQuestionGeneratorModal.tsx
    │   │   ├── BaseQuestionFormFields.tsx
    │   │   ├── EditQuestionModal.tsx
    │   │   ├── FillInTheBlanksQuestionForm.tsx
    │   │   ├── MatchingQuestionForm.tsx
    │   │   ├── MultipleChoiceQuestionForm.tsx
    │   │   ├── MultipleResponseQuestionForm.tsx
    │   │   ├── NumericQuestionForm.tsx
    │   │   ├── QuestionList.tsx
    │   │   ├── QuizAuthoringTool.tsx
    │   │   ├── QuizSettingsForm.tsx
    │   │   ├── SequenceQuestionForm.tsx
    │   │   ├── ShortAnswerQuestionForm.tsx
    │   │   ├── TrueFalseQuestionForm.tsx
    │   │   └── questionTemplates.ts
    │   │
    │   └── shared/             # Common shared UI components (Button, Card, etc.)
    │       ├── Button.tsx
    │       └── Card.tsx
    │
    ├── samples/                # Sample JSON files for each question type
    │   ├── blocklyProgrammingQuestion.sample.json
    │   ├── dragAndDropQuestion.sample.json
    │   ├── fillInTheBlanksQuestion.sample.json
    │   ├── hotspotQuestion.sample.json
    │   ├── matchingQuestion.sample.json
    │   ├── multipleChoiceQuestion.sample.json
    │   ├── multipleResponseQuestion.sample.json
    │   ├── numericQuestion.sample.json
    │   ├── scratchProgrammingQuestion.sample.json
    │   ├── sequenceQuestion.sample.json
    │   ├── shortAnswerQuestion.sample.json
    │   └── trueFalseQuestion.sample.json
    │
    ├── schemas/                # JSON schema definitions for quiz and question types
    │   ├── baseQuestion.schema.json
    │   ├── blocklyProgrammingQuestion.schema.json
    │   ├── dragAndDropQuestion.schema.json
    │   ├── fillInTheBlanksQuestion.schema.json
    │   ├── hotspotQuestion.schema.json
    │   ├── matchingQuestion.schema.json
    │   ├── multipleChoiceQuestion.schema.json
    │   ├── multipleResponseQuestion.schema.json
    │   ├── numericQuestion.schema.json
    │   ├── scratchProgrammingQuestion.schema.json
    │   ├── sequenceQuestion.schema.json
    │   ├── shortAnswerQuestion.schema.json
    │   └── trueFalseQuestion.schema.json
    │
    ├── services/             # Core logic, API interactions, and business logic
    │   ├── AIGenerationService.ts  # Service for AI-based question generation
    │   ├── HTMLLauncherGenerator.ts # Generates HTML for SCORM launcher
    │   ├── QuizEngine.test.ts    # Unit tests for QuizEngine
    │   ├── QuizEngine.ts         # Core quiz logic (state, scoring, navigation)
    │   ├── SCORMManifestGenerator.ts # Generates imsmanifest.xml for SCORM
    │   ├── SCORMService.ts       # SCORM communication Abstraction
    │   └── sampleQuiz.ts         # Sample quiz configuration data
    │
    └── utils/                  # Utility functions
        └── idGenerators.ts       # Functions for generating unique IDs
```

## Key Points

*   **`src/`**: This is the heart of your `interactive-quiz-kit` library. All components, types, services, and utilities that are part of the distributable library reside here.
*   **`example/`**: A standalone Vite application that consumes the `interactive-quiz-kit` library, primarily for testing and demonstration. It uses path aliasing (`interactive-quiz-kit` pointing to `../src`) in its `vite.config.js` to import directly from the source during development.
*   **Root `App.tsx` and `index.tsx`**: These form a simple React application at the project root. This app also consumes the library from `src/` using path aliases defined in `tsconfig.json`. This can serve as a primary development playground or a more complex demo.
*   **Configuration Files**:
    *   Root `package.json` and `rollup.config.js` are for building and publishing the `interactive-quiz-kit` library.
    *   Root `tsconfig.json` configures TypeScript for the entire project, including path aliases.
    *   `example/package.json` and `example/vite.config.js` are specific to the example application.
*   **SCORM Related Files**:
    *   `HTMLLauncherGenerator.ts` and `SCORMManifestGenerator.ts` in `src/services/` are used to generate files for SCORM packages.
    *   `example/public/blockly-styles.css` is included as a static asset in the example and needs to be manually included or correctly referenced in SCORM packages that use Blockly/Scratch questions.

This structure promotes a clear separation between the library code, the example application, and the root development application, making the project more maintainable and scalable.
