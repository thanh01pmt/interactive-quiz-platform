import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // Use jsdom for DOM-related testing (e.g., React components later)
    setupFiles: [], // No setup files needed for now for QuizEngine pure logic
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/types.ts', 
        'src/index.ts', 
        'src/schemas/**', 
        'src/samples/**',
        'src/components/authoring/AIQuestionGeneratorModal.tsx', // Placeholder for components
        'src/components/authoring/AIQuestionGeneratorForm.tsx', // Placeholder for components
        'src/components/authoring/EditQuestionModal.tsx',
        // Add other UI components or files not intended for direct unit test coverage here
        // as component tests will cover them through interaction.
        'src/**/BlockProgrammingQuestionUI.tsx', // complex UI with external deps
        'src/**/BlocklyProgrammingQuestionUI.tsx', 
        'src/**/ScratchProgrammingQuestionUI.tsx',
      ],
    },
  },
});