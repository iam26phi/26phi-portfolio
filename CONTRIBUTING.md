# Contributing Guide

Thank you for your interest in contributing to the 26phi Photography Portfolio project!

## Development Setup

### Prerequisites

- Node.js 22.x or higher
- pnpm package manager
- MySQL 8.0+
- Git

### Getting Started

1. Fork the repository on GitHub

2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/26phi_portfolio.git
cd 26phi_portfolio
```

3. Install dependencies:
```bash
pnpm install
```

4. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Configure database and authentication settings

5. Run database migrations:
```bash
pnpm db:push
```

6. Start development server:
```bash
pnpm dev
```

## Project Structure

```
26phi_portfolio/
├── client/              # Frontend React application
│   ├── public/         # Static assets
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── lib/        # Utilities
│   │   └── contexts/   # React contexts
├── server/             # Backend Express application
│   ├── _core/         # Core utilities
│   ├── routers.ts     # tRPC routes
│   └── db.ts          # Database queries
├── drizzle/           # Database schema
└── shared/            # Shared types
```

## Development Workflow

### Making Changes

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes

3. Test your changes:
```bash
pnpm check        # TypeScript type checking
pnpm build        # Build production bundle
```

4. Commit your changes:
```bash
git add .
git commit -m "feat: add your feature description"
```

### Commit Message Convention

Follow the Conventional Commits specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add photo batch delete functionality
fix: resolve lightbox navigation bug on mobile
docs: update deployment guide
```

### Pull Request Process

1. Push your branch to GitHub:
```bash
git push origin feature/your-feature-name
```

2. Open a Pull Request on GitHub

3. Provide a clear description:
   - What changes were made
   - Why these changes are needed
   - How to test the changes

4. Wait for review and address feedback

## Code Style

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow existing code formatting
- Use meaningful variable names
- Add comments for complex logic

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props

Example:
```typescript
interface PhotoCardProps {
  photo: Photo;
  onSelect: (photo: Photo) => void;
}

export function PhotoCard({ photo, onSelect }: PhotoCardProps) {
  // Component implementation
}
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow the brutalist minimalism design system
- Maintain consistent spacing and typography
- Ensure responsive design

### Database

- Use Drizzle ORM for queries
- Add proper indexes for performance
- Write migrations for schema changes
- Never commit sensitive data

## Testing

Currently, the project uses manual testing. Future contributions for automated testing are welcome:

- Unit tests with Vitest
- Integration tests for API endpoints
- E2E tests with Playwright

## Documentation

When adding new features:

- Update README.md if needed
- Add inline code comments
- Update DEPLOYMENT.md for deployment changes
- Document new environment variables

## Bug Reports

When reporting bugs, include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, OS, Node version
6. **Screenshots**: If applicable

## Feature Requests

When suggesting features:

1. **Use Case**: Explain the problem you're solving
2. **Proposed Solution**: Describe your idea
3. **Alternatives**: Other approaches considered
4. **Additional Context**: Screenshots, mockups, etc.

## Code Review

All submissions require review. We look for:

- Code quality and readability
- Adherence to project conventions
- Proper error handling
- Performance considerations
- Security implications
- Documentation completeness

## Areas for Contribution

### High Priority

- [ ] Automated testing suite
- [ ] Image optimization pipeline
- [ ] Drag-and-drop photo reordering
- [ ] Batch operations for photos
- [ ] S3 integration for photo uploads

### Medium Priority

- [ ] SEO optimization
- [ ] Performance monitoring
- [ ] Accessibility improvements
- [ ] Internationalization (i18n)
- [ ] Dark/light theme toggle

### Low Priority

- [ ] Social media sharing
- [ ] Photo comments system
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Advanced search/filtering

## Questions?

If you have questions about contributing:

1. Check existing issues and discussions
2. Review the documentation
3. Open a new issue with the "question" label

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to 26phi Photography Portfolio! 🎉
