# Purpose: Test how components integrate with real systems like Realm database, API calls, and navigation.

In the project directory, these tests are under /tests/integration/

For a comprehensive analysis of patterns, quality assessment, and strategic recommendations, see [integration-test-analysis.md](./integration-test-analysis.md).

## Strategy:
  - Real database: Use actual Realm instances (via setupUniqueRealm) and write real data
  - Real navigation: Render components within the full navigation stack using renderAppWithComponent
  - API mocking: Mock API responses (like inatjs.observations.fetch) but test the full data flow
  - Cross-system testing: Verify data persistence, sync operations, and multi-component interactions