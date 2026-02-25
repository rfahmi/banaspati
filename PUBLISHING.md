# Publishing Guide

This guide explains how to publish the Banaspati package to npm.

## Prerequisites

1. **npm account**: Create one at [npmjs.com](https://www.npmjs.com/signup) if you don't have one
2. **npm CLI**: Ensure npm is installed (`npm --version`)
3. **Authentication**: Log in to npm (`npm login`)

## Pre-publish Checklist

- [ ] All tests pass
- [ ] Documentation is up to date
- [ ] CHANGELOG.md is updated
- [ ] Version number is bumped in package.json
- [ ] Build succeeds without errors

## Publishing Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Package

```bash
npm run build
```

This will create the `dist` folder with compiled JavaScript and TypeScript definitions.

### 3. Test the Build Locally (Optional)

Link the package locally to test it in another project:

```bash
npm link
cd /path/to/test-project
npm link com.rfahmi.banaspati
```

### 4. Check Package Contents

Preview what will be published:

```bash
npm pack --dry-run
```

### 5. Publish to npm

For the first release:

```bash
npm publish --access public
```

For subsequent releases, first bump the version:

```bash
# Patch release (1.0.0 -> 1.0.1)
npm version patch

# Minor release (1.0.0 -> 1.1.0)
npm version minor

# Major release (1.0.0 -> 2.0.0)
npm version major
```

Then publish:

```bash
npm publish
```

### 6. Verify Publication

Check that your package is live:

```bash
npm view com.rfahmi.banaspati
```

Or visit: https://www.npmjs.com/package/com.rfahmi.banaspati

## Post-publish

1. **Tag the release** on GitHub:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Create a GitHub release** with the changelog

3. **Announce** the release on relevant channels

## Troubleshooting

### "Package name already exists"

The package name `com.rfahmi.banaspati` must be unique on npm. If it's taken, you'll need to:
- Choose a different name
- Or use a scoped package: `@username/banaspati`

### "You must be logged in"

Run `npm login` and enter your credentials.

### "Permission denied"

Make sure you're logged in as the correct user and have publishing rights.

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

## Automated Publishing (Optional)

Consider setting up GitHub Actions for automated publishing:

1. Add npm token to GitHub secrets
2. Create a workflow that publishes on new tags
3. Automate changelog generation

---

**Ready to publish?** Make sure everything is tested and documented! 🚀
