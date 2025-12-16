# Testing Guide

This project uses [Vitest](https://vitest.dev/) for testing.

## Running Tests

```bash
# Run tests in watch mode (re-runs on file changes)
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are located in the `tests/` directory:

```
tests/
├── statusUtils.test.ts   # Core status logic
└── config.test.ts        # Configuration validation
```

## What's Tested

### Status Utils (`statusUtils.test.ts`)

**determineStatusFromResponse** - Converts HTTP responses to status values:
- `operational` - Response OK and fast (<2s)
- `degraded` - Response OK but slow (>2s), or 4xx error
- `outage` - 5xx error or unreachable

**determineOverallStatus** - Calculates overall status from all regions:
- Returns `outage` if any region has outage
- Returns `degraded` if any region is degraded
- Returns `operational` only if all regions are operational

**groupByEnvironment** - Groups region results by environment name:
- Maintains order from config
- Handles multiple regions per environment

**validateEndpoint** - Validates endpoint configuration:
- Checks URL is valid
- Ensures environment and region are provided

### Config Validation (`config.test.ts`)

**Brand config** - Validates branding settings:
- Required properties exist
- Primary color is valid hex format
- Footer link is valid URL

**Endpoints** - Validates endpoint configuration:
- At least one endpoint exists
- All endpoints have required properties
- All URLs are valid

**Settings** - Validates timing settings:
- Refresh interval and timeout are positive numbers
- Refresh interval > request timeout

**Mode** - Validates deployment mode:
- Mode is one of: direct, proxy, backend
- Required URLs are set for each mode

## Adding New Tests

1. Create a new file in `tests/` with `.test.ts` extension
2. Import from vitest:
   ```typescript
   import { describe, it, expect } from 'vitest';
   ```
3. Write tests:
   ```typescript
   describe('myFunction', () => {
     it('does something', () => {
       expect(myFunction()).toBe(expected);
     });
   });
   ```

## CI Integration

Tests run automatically on:
- Push to `main` or `testing` branches
- Pull requests to `main`

See `.github/workflows/test.yml` for the workflow configuration.
