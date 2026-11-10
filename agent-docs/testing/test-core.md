# Core Testing Guidelines

Standards live in `.claude/rules/tests.md`. This doc is the setup detail and the
worked example.

## Stack

React Native Testing Library for unit and integration tests, `factoria` plus
`@faker-js/faker` for mock data, `jest-fetch-mock` for HTTP. Unit and component
tests are under `tests/unit/`; integration tests under `tests/integration/`.

## Realm and Zustand in tests

- **Realm:** reuse the `// UNIQUE REALM SETUP` block that appears in existing
  tests. It gives each test file its own realm file, which is what keeps
  parallel workers from fighting over one database.
- **Zustand:** `useStore.setState( ... )` for whole-slice state, or
  `zustandStorage.setItem( key, value )` for a single persisted value. Persisted
  values have to go through `zustandStorage`, since that is what the store reads
  on hydration.
- **Hooks and services:** `jest.mock` the module, then `jest.spyOn` with
  `mockImplementation` to vary behavior per test.

## Mock taxa

Prefer these over invented ones, so IDs stay stable across test files and a
fixture is recognizable when it shows up in a failure message.

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

## Worked example

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

The full RNTL matcher list is `docs/guides/llm-guidelines.md` inside
`@testing-library/react-native`.
