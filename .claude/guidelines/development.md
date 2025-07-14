# Development Guidelines

## 1. Package Management
- **Recommended Tools**: Unify per project (npm/yarn/pnpm, pip/poetry/uv, etc.)
- **Installation**: Recommend `[tool] add package` format
- **Execution**: Recommend `[tool] run command` format
- **Prohibited Practices**: 
  - Mixed usage (using multiple package managers together)
  - Using `@latest` syntax (version pinning recommended)
  - Global installation (keep everything within project)

## 2. Code Quality Standards
- **Type Annotations**: Add type information to all functions and variables
- **Documentation**: Required for public APIs and complex processes
- **Function Design**: Aim for single responsibility and small functions
- **Existing Patterns**: Always follow existing code patterns
- **Line Length**: 80-120 characters (unified by language/team)

## 3. Command List

### Basic Development Flow
```bash
# Project setup (first time only)
[tool] install                   # Install dependencies
[tool] run dev                   # Start development server

# Test execution
[tool] run test                  # Run all tests
[tool] run test:watch           # Watch mode

# Quality checks
[tool] run format               # Apply code formatting
[tool] run lint                 # Lint check and auto-fix
[tool] run typecheck            # Run type check (for applicable languages)

# Build and release
[tool] run build                # Production build
[tool] run check                # Comprehensive check (pre-CI confirmation)
```

### Package Management
```bash
[tool] add [package-name]       # Add dependency
[tool] remove [package-name]    # Remove dependency
[tool] update                   # Update all dependencies
```

**Note**: Replace `[tool]` with the package manager used in the project
- Node.js: `npm`, `yarn`, `pnpm`
- Python: `pip`, `poetry`, `uv`
- Rust: `cargo`
- Go: `go`
- Standard tools for other languages

## 4. Error Handling Guide

### Standard Problem-Solving Order
1. **Format Errors** → `[tool] run format`
2. **Type Errors** → `[tool] run typecheck`
3. **Lint Errors** → `[tool] run lint:fix`
4. **Test Errors** → `[tool] run test`

### Common Problems and Solutions
- **Line length errors**: Break at appropriate places
- **Import order**: Use auto-fix
- **Type errors**: Add explicit type annotations

## 5. Quality Gates

### Pre-commit Checks
- [ ] `[tool] run format` - Formatting applied
- [ ] `[tool] run lint` - Lint warnings resolved
- [ ] `[tool] run typecheck` - Type check passed
- [ ] `[tool] run test` - All tests passed

### CI/CD Automation
- Code formatting
- Lint checks
- Type checks
- Unit test execution