# Testing the Pincast CLI

This document explains how to test the Pincast CLI commands, including the new `create` command.

## Running Tests

To run all tests:

```bash
pnpm test
```

To run tests in watch mode during development:

```bash
pnpm test:watch
```

To run a specific test file:

```bash
pnpm test commands/create.spec.ts
```

## Test Coverage

To generate test coverage report:

```bash
pnpm test --coverage
```

## Manual Testing

To manually test the `create` command:

1. Build the CLI:
   ```bash
   pnpm build
   ```

2. Link the package for local development:
   ```bash
   pnpm link --global
   ```

3. Create a new directory for testing:
   ```bash
   mkdir test-pincast
   cd test-pincast
   ```

4. Run the create command:
   ```bash
   pincast create my-app
   ```

5. Check the created files:
   ```bash
   cd my-app
   ls -la
   ```

6. Test the development server:
   ```bash
   pincast dev
   ```

## Adding New Tests

When adding new tests for CLI commands:

1. Create a test file in `test/commands/` with the naming pattern `[command-name].spec.ts`
2. Mock external dependencies using Vitest's mocking capabilities
3. Test both success and failure scenarios
4. Ensure that proper error handling is tested

## Testing Guidelines

- Mock filesystem operations to avoid actual file creation during tests
- Mock prompts to simulate user input
- Test error conditions and edge cases
- Verify console output for user feedback
- Check that process.exit is called with appropriate codes on errors