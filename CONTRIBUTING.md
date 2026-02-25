# Contributing to Banaspati

First off, thank you for considering contributing to Banaspati! 🎉

This document provides guidelines for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, browser, React version, etc.)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- **Clear use case** for the enhancement
- **Detailed description** of the proposed functionality
- **Examples** of how it would work
- **Potential implementation** ideas (optional)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** with clear, descriptive commits
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Submit a pull request**

#### Pull Request Guidelines

- Follow the existing code style
- Write clear commit messages
- Include tests for new features
- Update README.md if adding new props or features
- Keep PRs focused on a single feature/fix

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/banaspati.git
cd banaspati

# Install dependencies
npm install

# Start development
npm run dev

# Build the package
npm run build
```

## Code Style

- Use TypeScript for all new code
- Follow the existing formatting (Prettier config is provided)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Testing

Before submitting a PR:

1. Test your changes in the demo/example
2. Verify the component works across different browsers
3. Check that the build succeeds without errors
4. Ensure TypeScript types are correct

## Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Start with a capital letter
- Keep first line under 72 characters
- Reference issues and PRs when relevant

Examples:
```
Add new flame preset configurations
Fix eye tracking on mobile devices
Update README with new API examples
Improve performance of Perlin noise calculation
```

## Documentation

- Update README.md for new features or API changes
- Add JSDoc comments for new props or functions
- Include usage examples for new functionality
- Update CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/)

## Questions?

Feel free to open an issue for questions or discussions!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Banaspati! 🔥
