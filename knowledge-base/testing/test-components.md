# Purpose: Test individual component behavior in isolation with minimal dependencies.

In the project directory, these tests are under /tests/unit/components/

## Strategy:
- Mock hooks (useCurrentUser, useLocalObservation), navigation, and queries
- Isolated rendering: Use renderComponent with only the component under test
- State testing: Focus on component UI states, props, and user interactions
- *Do not* mock child components