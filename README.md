# iNaturalistReactNative

## Install packages and pods
1. Run `npm install`
2. Run `npx pod-install ios` or `cd ios && pod install` from the root directory
3. Make sure to place the `.env` file in the root folder, which is not part of the code repo (contains secrets, such as OAuth client ID).

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

# Translations

## Adding New Text

1. Add new strings in English to `src/i18n/strings.ftl` using [Fluent syntax](https://projectfluent.org/fluent/guide/), e.g.
    ```Fluent
    # Header for a paragraph describing projects
    ABOUT-PROJECTS = ABOUT
    # Text describing what projects are
    projects-description =
      Projects are really great, probably iNat's best feature.
    ```
    Try to match case and strike a balance between specificity and reusability when choosing a key. Please add context comments to help translators understand how the text is used, avoid variables whenever possible, and try to keep `strings.ftl` alphabetized by key.
1. Run `node src/i18n/i18ncli.js build` to build the JSON files i18next needs to access text in the app
1. In a commponent, use the `useTranslation` hook to reference your new string, e.g.
    ```jsx
    import { useTranslation } from "react-i18next";
    const MyComponent = ( ) => {
      const { t } = useTranslation();
      return (
        <View>
          <Text>{ t( "ABOUT-PROJECTS" ) }</Text>
          <Text>{ t( "projects-description" ) }</Text>
        </View>
      );
    };
    ````

## Translating Text
We manage translations through Crowdin. Actually updating the translation files should be largely automated, but this is what it looks like to do it manually (you must have the [Crowdin CLI](https://github.com/crowdin/crowdin-cli) installed and have an [access token](https://crowdin.com/settings#api-key) associated with a Crowdin user that can post files to the specified project):

```bash
# Upload new strings. Source and destination paths are specified in crowdin.yml
crowdin upload --token YOUR_ACCESS_TOKEN --project-id YOUR_PROJECT_ID

# Download new translations and build for use in the app
crowdin download --token YOUR_ACCESS_TOKEN --project-id YOUR_PROJECT_ID
node src/i18n/i18ncli.js build
git add src/i18n/l10n/*
git commit -a -m "Updated translations"
```


## Troubleshooting
1. Run `react-native clean-project`. This will give you options to clean caches, clean builds, reinstall pods, and reinstall node_modules. Using this eliminates a lot of hard-to-diagnose build issues.
