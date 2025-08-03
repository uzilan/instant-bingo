# Coding Standards

## Development Philosophy
- **Go slowly and step by step**: Take your time to understand each change before proceeding
- **Make small, focused changes**: Break down complex tasks into smaller, manageable pieces
- **Seek confirmation before major changes**: Ask for approval before implementing significant modifications
- **Explain your reasoning**: Always explain why you're making changes and what they accomplish
- **Find the root cause**: Instead of using workarounds, identify and solve the real underlying issue

## Code Quality
- **Keep functions small and modular**: Write focused, single-purpose functions that are easy to understand and test
- **Use descriptive names**: Choose clear, meaningful names for variables, functions, and components
- **Remove unused code**: Always clean up unused imports, variables, and functions
- **Follow linting rules**: Run linters before committing and fix all issues

## React Best Practices
- **Use React Hooks properly**: 
  - Include all dependencies in useEffect dependency arrays
  - Use useCallback for functions passed as props or used in useEffect
  - Use useMemo for expensive computations or objects that shouldn't recreate on every render
- **Component organization**: 
  - Keep components focused on a single responsibility
  - Extract reusable logic into custom hooks
  - Use TypeScript interfaces for props and state
- **State management**: 
  - Use appropriate state management patterns
  - Avoid prop drilling by using context when needed
  - Keep state as local as possible

## TypeScript Standards
- **Always use imports**: Import types and interfaces rather than using inline type definitions
- **Remove unused imports**: Keep import sections clean and organized
- **Use proper typing**: Define interfaces for all data structures and component props
- **Avoid any type**: Use specific types instead of `any` whenever possible

## Code Organization
- **File structure**: Organize files logically by feature or functionality
- **Component hierarchy**: Keep component relationships clear and maintainable
- **Data models**: Define clear interfaces for all data structures
- **Utility functions**: Extract reusable logic into separate utility files

## Development Workflow
- **Lint before committing**: Always run `npm run lint` and fix all issues before committing
- **Test your changes**: Verify that changes work as expected before proceeding
- **Incremental development**: Make small changes, test them, then move to the next step
- **Documentation**: Update README and comments when adding new features

## Performance Considerations
- **Optimize re-renders**: Use React.memo, useCallback, and useMemo appropriately
- **Bundle size**: Be mindful of dependencies and their impact on bundle size
- **Memory leaks**: Clean up event listeners and subscriptions in useEffect cleanup functions
- **Lazy loading**: Use React.lazy for code splitting when appropriate

## Error Handling
- **Graceful degradation**: Handle errors gracefully without breaking the user experience
- **User feedback**: Provide clear error messages and loading states
- **Validation**: Validate user input and data before processing
- **Logging**: Use appropriate logging for debugging and monitoring

## Testing
- **Write testable code**: Structure code to be easily testable
- **Component testing**: Test component behavior and user interactions
- **Integration testing**: Test how components work together
- **Accessibility**: Ensure components are accessible and test with screen readers

## Code Review Standards
- **Small, focused PRs**: Keep pull requests small and focused on a single feature or fix
- **Clear descriptions**: Explain what changes were made and why
- **Test coverage**: Ensure new code has appropriate test coverage
- **Documentation**: Update documentation for new features or API changes

## Git Workflow
- **Meaningful commits**: Write clear, descriptive commit messages
- **Atomic commits**: Make commits that represent a single logical change
- **Branch naming**: Use descriptive branch names that indicate the purpose
- **Clean history**: Keep commit history clean and logical

## Tools and Automation
- **ESLint**: Use ESLint for code quality and consistency
- **Prettier**: Use Prettier for consistent code formatting
- **TypeScript**: Use TypeScript for type safety and better developer experience
- **Vite**: Use Vite for fast development and building
- **Git hooks**: Use pre-commit hooks to run linting and tests automatically

## Mobile Optimization Standards
- **Responsive design**: Ensure all components work seamlessly across different screen sizes
- **Touch-friendly interfaces**: 
  - Use minimum 44px touch targets for buttons and interactive elements
  - Provide adequate spacing between touchable elements (at least 8px)
  - Avoid hover-only interactions that don't work on touch devices
- **Performance optimization**:
  - Optimize images for mobile bandwidth and storage constraints
  - Use lazy loading for images and components
  - Minimize bundle size for faster loading on mobile networks
  - Implement proper caching strategies
- **Mobile-specific considerations**:
  - Test on actual mobile devices, not just browser dev tools
  - Consider viewport meta tag and proper scaling
  - Handle orientation changes gracefully
  - Optimize for one-handed use where possible
  - Ensure keyboard navigation works for accessibility
- **Progressive Web App (PWA) features**:
  - Implement service workers for offline functionality
  - Add proper manifest.json for app-like experience
  - Consider install prompts and home screen functionality
- **Mobile UX patterns**:
  - Use familiar mobile navigation patterns (bottom tabs, swipe gestures)
  - Implement pull-to-refresh where appropriate
  - Consider mobile-specific loading states and feedback
  - Optimize forms for mobile input (larger text inputs, proper keyboard types)

## Collaboration
- **Communication**: Explain your changes and reasoning clearly
- **Code reviews**: Review code thoroughly and provide constructive feedback
- **Knowledge sharing**: Document decisions and share knowledge with the team
- **Pair programming**: Work together when tackling complex problems 