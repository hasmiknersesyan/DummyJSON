# DummyJSON API Test Suite

A robust TypeScript-based API test suite using Playwright to validate the Products endpoints of the DummyJSON REST API. This test suite provides comprehensive coverage of product-related operations including CRUD operations, search functionality, and category filtering.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Viewing Test Results](#viewing-test-results)
- [Design Decisions and Tradeoffs](#design-decisions-and-tradeoffs)
- [Project Structure](#project-structure)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for cloning the repository)

## Installation

Follow these steps to set up the test suite on your local machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hasmiknersesyan/DummyJSON.git
   cd DummyJSON
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

   This command downloads the necessary browser binaries (Chromium, Firefox, and WebKit) that Playwright uses for testing.

## Running Tests

The test suite provides several options for running tests based on your needs:

### Run All Tests

Execute the complete test suite:
```bash
npm test
```

### Run Tests in Headed Mode

Run tests with visible browser windows (useful for debugging):
```bash
npm run test:headed
```

### Run Tests in Debug Mode

Launch tests with Playwright Inspector for step-by-step debugging:
```bash
npm run test:debug
```

### Run Specific Test File

Execute a specific test file:
```bash
npx playwright test tests/products.spec.ts
```

### Run Tests in Parallel

By default, tests run in parallel. To control parallelism:
```bash
npx playwright test --workers=4
```

### Run Tests with Specific Reporter

Generate different report formats:
```bash
npx playwright test --reporter=html
npx playwright test --reporter=json
npx playwright test --reporter=junit
```

## Viewing Test Results

The test suite provides multiple ways to view and analyze test results:

### 1. HTML Report (Recommended)

After running tests, generate and view an interactive HTML report:
```bash
npx playwright show-report
```

This opens a browser with a detailed report including:
- Test execution timeline
- Pass/fail status for each test
- Screenshots and videos (for failed tests)
- Network activity logs
- Detailed error messages and stack traces

### 2. Console Output

Tests display real-time results in the console, including:
- Test names and their status (✓ passed, ✗ failed)
- Execution time for each test
- Summary of total tests, passed, failed, and skipped

### 3. JSON Report

For programmatic access or CI/CD integration:
```bash
npx playwright test --reporter=json > test-results.json
```

### 4. JUnit Report

For integration with CI/CD systems like Jenkins:
```bash
npx playwright test --reporter=junit > junit-results.xml
```

### 5. Trace Viewer

For deep debugging, enable trace recording:
```bash
npx playwright test --trace on
```

Then view traces:
```bash
npx playwright show-trace trace.zip
```

## Design Decisions and Tradeoffs

### Architecture and Framework Choice

We chose **Playwright** over alternatives like Axios or Supertest for API testing due to its robust built-in capabilities for handling HTTP requests, automatic retries, and comprehensive assertion libraries. Playwright's Request API provides a powerful abstraction that simplifies test writing while maintaining flexibility. While Playwright is traditionally known for UI testing, its API testing capabilities offer unique advantages such as integrated tracing, parallel execution with worker isolation, and unified reporting across different test types. The tradeoff is a slightly larger footprint compared to lightweight HTTP libraries, but the benefits of having a unified testing framework for both UI and API tests outweigh this consideration.

### Test Organization and Reliability

The test suite is structured using the **Arrange-Act-Assert (AAA)** pattern, making tests readable and maintainable. Each test is isolated and independent, with proper setup and teardown to prevent test pollution. We implement **automatic retries** for flaky network operations and use **explicit waits** with configurable timeouts to handle varying response times from the DummyJSON API. Data-driven testing is employed where multiple scenarios can be validated efficiently. The tradeoff here is that comprehensive test isolation may lead to slightly longer execution times due to repeated setup operations, but this ensures test reliability and prevents cascading failures.

### Parallel Execution and Performance

Tests are designed to run in **parallel by default**, utilizing Playwright's worker-based architecture to maximize throughput. Each worker runs in an isolated context with its own request context, preventing race conditions and data corruption. We use unique identifiers for any created resources and implement proper cleanup to avoid conflicts. The configuration allows for flexible worker counts based on the CI environment or local machine capabilities. The main tradeoff is increased resource consumption during parallel execution, but the significantly reduced overall test execution time (often 3-5x faster) makes this worthwhile for CI/CD pipelines. We also implement rate limiting awareness to prevent overwhelming the DummyJSON API, ensuring tests remain stable even when running at scale.

## Project Structure

```
DummyJSON/
├── tests/
│   ├── products.spec.ts          # Product endpoint tests
│   ├── products-crud.spec.ts     # CRUD operation tests
│   ├── products-search.spec.ts   # Search functionality tests
│   └── products-category.spec.ts # Category filtering tests
├── lib/
│   ├── api/
│   │   └── products-api.ts       # Product API client
│   ├── fixtures/
│   │   └── test-data.ts          # Test data and fixtures
│   └── helpers/
│       ├── assertions.ts         # Custom assertion helpers
│       └── utils.ts              # Utility functions
├── playwright.config.ts          # Playwright configuration
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## CI/CD Integration

The test suite is designed to integrate seamlessly with CI/CD pipelines:

### GitHub Actions Example

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Environment Variables

Configure test behavior using environment variables:
```bash
BASE_URL=https://dummyjson.com npm test
TIMEOUT=30000 npm test
WORKERS=2 npm test
```

## Troubleshooting

### Common Issues

**Tests are failing with timeout errors:**
- Increase the timeout in `playwright.config.ts`
- Check your internet connection
- Verify DummyJSON API is accessible

**Browsers not found:**
```bash
npx playwright install --with-deps
```

**Tests are flaky:**
- Enable retries in configuration
- Add explicit waits where needed
- Check for race conditions in parallel execution

**Port conflicts:**
- Ensure no other services are using the same ports
- Modify port configuration in `playwright.config.ts`

### Debug Tips

1. **Use Playwright Inspector:**
   ```bash
   PWDEBUG=1 npm test
   ```

2. **Enable verbose logging:**
   ```bash
   DEBUG=pw:api npm test
   ```

3. **Run single test in headed mode:**
   ```bash
   npx playwright test tests/products.spec.ts --headed --workers=1
   ```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Resources

- [DummyJSON API Documentation](https://dummyjson.com/docs)
- [Playwright Documentation](https://playwright.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

**Note:** This test suite validates against the DummyJSON API, which is a free, publicly available REST API. Some operations (like POST, PUT, DELETE) are simulated and don't persist data permanently.
