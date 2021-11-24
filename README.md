# iNaturalistReactNative

## Install packages and pods
1. Run `npm install`
2. Run `npx pod-install ios` or `cd ios && pod install` from the root directory

## Set up pre-commit hooks
1. We're using [Husky](https://typicode.github.io/husky/#/) to automatically run `eslint` before each commit. Run `npm run prepare` to install Husky locally.

## Run build
1. Run `npm start -- --reset-cache` (`npm start` works too, but resetting the cache each time makes for a lot less build issues)
2. Run `npm run ios` or `npm run android`

## Tests
```bash
# Run all tests
npm test

# Run test paths matching a pattern
./node_modules/.bin/jest MyObs

# Run individual tests matching a pattern
./node_modules/.bin/jest -t accessibility
```

We currently have two kinds of tests
1. `tests/integration`: Tests the test the integration of multiple modules, e.g. a list of observation that makes requests to a mocked API, persists the response data in local storage, retrieves the data from local storage and renders components.
1. `tests/unit`: Tests that only test specific modules, like a single component, or a hook.

We're using [Jest](https://jestjs.io/) and [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) for most of our tests, [factoria](https://github.com/phanan/factoria) and [faker.js](https://github.com/Marak/faker.js/) to generate test data for use with mocks. `Local*` model factories represent locally persisted data, while `Remote*` factories represent that kinds of records we get from an API or external package.

## Troubleshooting
1. Run `react-native clean-project`. This will give you options to clean caches, clean builds, reinstall pods, and reinstall node_modules. Using this eliminates a lot of hard-to-diagnose build issues.
