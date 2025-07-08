# 🤝 Contributing to Ignition

Thank you for your interest in contributing to Ignition! We're building the future of compliance management and project orchestration, and we'd love your help.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork locally
3. **Install** dependencies: `npm install`
4. **Create** a feature branch: `git checkout -b feature/amazing-feature`
5. **Make** your changes
6. **Test** thoroughly: `npm run test:all`
7. **Commit** with conventional format: `git commit -m "feat: add amazing feature"`
8. **Push** to your fork: `git push origin feature/amazing-feature`
9. **Create** a Pull Request

## 🎯 Development Guidelines

### 📝 Code Style
- **TypeScript First** - All new code should be TypeScript
- **Consistent Formatting** - We use Prettier (runs automatically)
- **Meaningful Names** - Clear, descriptive variable and function names
- **Document Complex Logic** - Add comments for non-obvious code
- **Component Structure** - Follow existing patterns in `/components`

### 🧪 Testing Requirements
- **Unit Tests** - Write tests for new functions and utilities
- **Component Tests** - Test React components with React Testing Library
- **E2E Tests** - Add Playwright tests for user workflows
- **Coverage** - Maintain or improve test coverage
- **All Tests Pass** - `npm run test:ci` must pass

### 📦 Project Structure
```
├── components/          # React components
├── services/           # Business logic and API calls
├── types.ts           # TypeScript type definitions
├── constants.tsx      # Application constants
├── data/             # Static data and configurations
├── e2e/              # End-to-end tests
├── src/              # Additional source files
└── public/           # Static assets
```

### 🔧 Available Scripts
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run test          # Run unit tests
npm run test:e2e      # Run E2E tests
npm run test:all      # Run all tests
npm run lint          # Check code style
```

## 📋 Contribution Types

### 🐛 Bug Fixes
- **Search existing issues** first
- **Create detailed bug reports** with reproduction steps
- **Include environment details** (browser, OS, etc.)
- **Add tests** to prevent regression

### ✨ New Features
- **Discuss in issues** before starting large features
- **Follow existing patterns** and architecture
- **Update documentation** as needed
- **Consider compliance implications**

### 📚 Documentation
- **Keep README updated** with new features
- **Add inline code comments** for complex logic
- **Update type definitions** for new interfaces
- **Create wiki pages** for detailed guides

### 🛡️ Compliance & Security
- **Follow security best practices**
- **Consider audit trail implications**
- **Test compliance features thoroughly**
- **Document compliance-related changes**

## 🔄 Pull Request Process

### ✅ Before Submitting
- [ ] All tests pass (`npm run test:ci`)
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format
- [ ] No console errors or warnings

### 📝 PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Compliance Impact
- [ ] No compliance impact
- [ ] Compliance features affected (describe)

## Screenshots (if applicable)
```

### 🔍 Review Process
1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** in review environment
4. **Approval** and merge

## 📏 Commit Message Format

We use [Conventional Commits](https://conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Examples
```bash
feat: add ISO 27001 compliance assessment
fix: resolve API key validation issue
docs: update installation instructions
test: add E2E tests for project creation
```

## 🌟 Recognition

Contributors will be:
- **Listed** in our README acknowledgments
- **Credited** in release notes
- **Invited** to our contributor Discord
- **Considered** for maintainer roles

## 🆘 Getting Help

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and general discussion
- **Documentation** - Check our [Wiki](https://github.com/castle-bravo-project/ignition/wiki)

## 📜 Code of Conduct

### Our Standards
- **Be respectful** and inclusive
- **Collaborate constructively**
- **Focus on what's best** for the community
- **Show empathy** towards other contributors

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Publishing private information
- Unprofessional conduct

## 🎉 Thank You!

Every contribution makes Ignition better. Whether you're fixing a typo, adding a feature, or improving documentation, you're helping build the future of compliance management.

**Happy coding!** 🚀
