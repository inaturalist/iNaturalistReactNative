# Core Testing Guidelines

## Tech Stack
- **Testing Framework**: React Native Testing Library for unit/integration tests
- **Mocking**: Use `factoria` + `@faker-js/faker` to generate mock data. Use jest.mock and then jest.spyOn and mockImplementation for mocking hooks and services.
- **State Management**: For components that use a realm-js realm, reuse the //UNIQUE REALM SETUP block found in many tests. zustand stores for testing can be created using useStore.setState or sepecific values can be set using zustandStorage.setItem
- **HTTP Testing**: jest-fetch-mock for mocking http responses

### Test Strategy
- Group public methods in describe
- Test files should focus on user behavior, not implementation details
- Use SIFER pattern
- Strongly prefer meaningful test cases to maximizing coverage
- Add only one or two code comments per file

# Run individual test by name
You *must* use the following command to run a specific test file (paths are relative to the repo root):
```bash
node 'node_modules/.bin/jest' 'PATH_TO_FILE' -c './jest.config.ts' -t 'TEST_NAME'
```

### Mocking Strategy

**DO Mock:**
- External API services
- Third-party libraries

**DON'T Mock:**
- React framework features
- Your own models/interfaces
- Simple utility functions
- Child components

### Mock Taxa
Prefer the following taxa for mock data
```ts
[
  { id: 745, name: "Silphium perfoliatum", preferred_common_name: "Cup Plant", rank: "species", rank_level: 10 },
  { id: 746, name: "Silphium laciniatum", preferred_common_name: "Compass Plant", rank: "species", rank_level: 10 },
  { id: 747, name: "Silphium integrifolium", preferred_common_name: "Wholeleaf Rosinweed", rank: "species", rank_level: 10 },
  { id: 748, name: "Silphium terebinthinaceum", preferred_common_name: "Prairie Dock", rank: "species", rank_level: 10 },
  { id: 749, name: "Silphium asteriscus", preferred_common_name: "Starry Rosinweed", rank: "species", rank_level: 10 },
  { id: 750, name: "Opuntia humifusa", preferred_common_name: "Eastern Prickly Pear", rank: "species", rank_level: 10 },
  { id: 752, name: "Opuntia engelmannii", preferred_common_name: "Engelmann's Prickly Pear", rank: "species", rank_level: 10 },
  { id: 753, name: "Opuntia basilaris", preferred_common_name: "Beavertail Cactus", rank: "species", rank_level: 10 },
  { id: 754, name: "Opuntia fragilis", preferred_common_name: "Brittle Prickly Pear", rank: "species", rank_level: 10 },
  { id: 755, name: "Ondatra zibethicus", preferred_common_name: "Common Muskrat", rank: "species", rank_level: 10 },
  { id: 47170, name: "Fungi", preferred_common_name: "Fungi Including Lichens", rank: "kingdom", rank_level: 70 },
  { id: 3, name: "Aves", preferred_common_name: "Birds", rank: "class", rank_level: 50 },
  { id: 47115, name: "Mollusca", preferred_common_name: "Mollusks", rank: "phylum", rank_level: 60 },
];
```

### Example
```ts
jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: () => undefined
} ) );

describe( "shows tooltip", () => {
  it( "to logged out users with 2 observations", async () => {
    zustandStorage.setItem( "numOfUserObservations", 2 );

    renderComponent( <AddObsButton /> );

    const tooltipText = await screen.findByText(
      "Press and hold to view more options"
    );
    expect( tooltipText ).toBeVisible();
  } );

  it( "to logged in users with less than 50 observations", async () => {
    zustandStorage.setItem( "numOfUserObservations", 2 );
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( () => mockUser );

    renderComponent( <AddObsButton /> );

    const tooltipText = await screen.findByText(
      "Press and hold to view more options"
    );
    expect( tooltipText ).toBeVisible();
  } );
});
```