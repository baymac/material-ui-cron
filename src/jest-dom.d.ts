// Makes the @testing-library/jest-dom matchers (toBeInTheDocument, toBeDisabled,
// ...) available on Vitest's `expect` for type-checking the test files. The
// matching runtime augmentation is loaded via vitest.setup.browser.ts.
import '@testing-library/jest-dom/vitest';
