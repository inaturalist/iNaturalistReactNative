# iNaturalistReactNative

## Requirements

* Xcode 13 or above
* [Android and iOS environment setup](https://reactnative.dev/docs/environment-setup) described in the RN docs

## Install packages and pods

1. Run `npm install`
1. Run `npx pod-install ios` or `cd ios && pod install` from the root directory
1. `cp env.example .env` and fill in appropriate values. This is not part of the code repo (contains secrets, such as OAuth client ID).
1. To run on Android, do this `cp android/example-keystore.properties android/keystore.properties`. Fill in the relevant values. If you are a member of iNat staff, get them from another member of iNat Staff. 

## Set up pre-commit hooks

1. We're using [Husky](https://typicode.github.io/husky/#/) to automatically run `eslint` before each commit. Run `npm run postinstall` to install Husky locally.

## Run build

1. Run `npm start -- --reset-cache` (`npm start` works too, but resetting the cache each time makes for a lot less build issues)
2. Run `npm run ios` or `npm run android`

## Tests
We currently have three kinds of tests:

1. `tests/integration`: Tests the integration of multiple modules, e.g. a list of observation that makes requests to a mocked API, persists the response data in local storage, retrieves the data from local storage and renders components.
2. `tests/unit`: Tests only specific modules, like a single component, or a hook.
3. `e2e`: Tests user interactions on the finished app build running on the iOS simulator (see below).

### Unit tests & integration tests
We're using [Jest](https://jestjs.io/) and [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) for most of our tests, [factoria](https://github.com/phanan/factoria) and [faker.js](https://github.com/Marak/faker.js/) to generate test data for use with mocks. `Local*` model factories represent locally persisted data, while `Remote*` factories represent that kinds of records we get from an API or external package.

```bash
# Run all tests
npm test

# Run test paths matching a pattern
npx jest MyObs

# Run individual tests matching a pattern
npx jest -t accessibility
```

### E2E tests
We're using [Detox](https://wix.github.io/Detox/docs/19.x/) for E2E tests. If you want to run the e2e tests on your local machine (MacOS only), make sure you fulfill the general requirements, see above, and also follow the test-specific [environment setup](https://wix.github.io/Detox/docs/19.x/introduction/ios-dev-env/).

```bash
# Build the app and run the tests
npm run e2e
```

If you have built the app already for a previous test, and just want to run an updated test without changing the app code, you can run `npm run e2e:test`.

If you are running into some issues after the tests have been working for some time, try updating `applesimutils` with `brew update && brew upgrade applesimutils`.

## Running with Staging Environment

1. Override `API_URL` to a staging API domain - either using a local `.env` file, or overriding the environment variable when calling `npm start` - e.g. `API_URL=http://example.com npm start -- --reset-cache`

## Translations

### Adding New Text

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

### Translating Text

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

## Styling
We're using Nativewind, a styling system for React Native based on Tailwind CSS. Check the [Nativewind documentation](https://www.nativewind.dev/) to see what styles can be used in RN.

## Troubleshooting

1. Run `react-native clean-project`. This will give you options to clean caches, clean builds, reinstall pods, and reinstall node_modules. Using this eliminates a lot of hard-to-diagnose build issues.
1. If you're running on an M series chip, you may need to install a specific version of NDK to the app to build for Android. See `android/build.gradle`


## Deploying

We use [fastlane](https://docs.fastlane.tools/) to help automate parts of the deployment process, which requires some additional setup.

### Setting up fastlane

1. Make a [Github personal access token](https://github.com/settings/tokens/) with repo access in the `GITHUB_TOKEN` environmental variable.
1. `cp android/example-keystore.properties android/keystore.properties` and fill in the relevant values provided by another member of iNat staff.
1. `cp fastlane/example-Appfile fastlane/Appfile` and fill in the relevant values provided by another member of iNat staff.
1. Work with iNat staff to either get a new Apple ID or associate an existing one with the iNat Apple development team
1. Sign in to Xcode with your Apple ID
1. Manage Certificates and add an Apple Distribution certificate associated with the iNaturalist team


### Usage

The current expectation is that you we tag to freeze the code, bump the version, and describe the changes represented by the tag. Then we release to make builds and publish on Github. Later, presumably when some of the change logs have been translated, we push builds for internal testing. If that looks ok, we push to public testing, and later to production release.

```zsh
# Make a git tag. This will bump the build number and prompt you to describe
# what changed, which will be used for the eventual github release
# description and changelogs uploaded to the app stores.
fastlane tag

# Make a github release. This will make relevant builds, a github release, and
# add build files to the release
fastlane release

# Upload the build for the latest tag for internal testing
fastlane internal

# Upload the build for the latest tag for public testing (promotes latest
# internal build to open testing)
fastlane beta

# Upload the build for the latest tag to production release. In Android, this
# should just promote the last beta to prod.
fastlane prod
```
