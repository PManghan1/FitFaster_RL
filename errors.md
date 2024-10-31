# ESLint Errors and Warnings

## Summary
Total: 474 problems (287 errors, 187 warnings)
- 161 errors potentially fixable with `--fix` option

## Categories

### Import Order Issues
- Multiple files have incorrect import ordering
- Common pattern: React/React Native imports should come before other imports
- Example: `@react-navigation/native` imports should occur before `react` imports

### TypeScript Issues
- Unused variables (marked with @typescript-eslint/no-unused-vars)
- Usage of `any` type (marked with @typescript-eslint/no-explicit-any)
- Missing type specifications
- Triple slash references instead of imports

### React Native Style Issues
- Inline styles used instead of StyleSheet
- Color literals used directly in styles
- Raw text outside of Text components
- Style properties not in ascending order

### React Hook Issues
- Missing dependencies in useEffect hooks
- Incomplete dependency arrays
- Example: `useEffect` missing 'stopRestTimer' dependency

### Code Style Issues
- Missing empty lines between import groups
- Unescaped entities in text
- Prefer const over let for variables never reassigned

## Critical Files

### App.tsx
- Import order issues
- Missing empty lines between import groups

### Components
- Multiple components using inline styles instead of StyleSheet
- Raw text outside of Text components in various files
- Color literals used directly in styles

### Services
- Multiple unused imports and variables
- TypeScript any types used frequently
- Import ordering issues

### Store
- Multiple any types in store implementations
- Missing dependencies in hooks
- Import ordering issues

### Types
- Multiple any types used
- Unused type definitions
- Import ordering issues

## Recommendations

1. **Import Ordering**
   - Use consistent import ordering
   - Group imports by type (React, third-party, local)
   - Add empty lines between import groups

2. **TypeScript Improvements**
   - Remove unused variables
   - Replace any types with specific types
   - Use proper type imports

3. **React Native Best Practices**
   - Use StyleSheet instead of inline styles
   - Properly wrap text in Text components
   - Use theme constants for colors

4. **React Hooks**
   - Include all dependencies in useEffect hooks
   - Review and fix dependency arrays

5. **Code Style**
   - Add proper spacing between import groups
   - Use proper escaping for text entities
   - Use const where variables aren't reassigned

## Next Steps

1. Run ESLint with --fix option to automatically fix formatting issues:
```bash
npx eslint . --ext .js,.jsx,.ts,.tsx --fix
```

2. Manually address remaining issues:
   - Remove unused variables
   - Add proper typing
   - Fix React Hook dependencies
   - Convert inline styles to StyleSheet
   - Wrap raw text in Text components

3. Consider implementing:
   - ESLint pre-commit hooks
   - Stricter TypeScript configuration
   - Shared style constants
   - Component style guide
