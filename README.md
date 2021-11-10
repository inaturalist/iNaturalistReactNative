# iNaturalistReactNative

## Run build
1. Run `npm start -- --reset-cache` (`npm start` works too, but resetting the cache each time makes for a lot less build issues)
2. Run `npm run ios` or `npm run android`

## Run tests
1. Run `npm run test`

## Troubleshooting
1. Run `react-native clean-project`. This will give you options to clean caches, clean builds, reinstall pods, and reinstall node_modules. Using this eliminates a lot of hard-to-diagnose build issues.

## FBT Translations
# 1. Generate enum and source manifests
`npm run manifest`
# 2. Collect FBT translatable texts
`npm run collect-fbts`
# 3. Generate translatedFbts.js from translation_input.json
`npm run translate-fbts`
# 4. Generate android/res translation files by running the generate-android-localizable script with the ouput of translate-fbts
`npm run generate-android-fbt`
# 5. Run a local web server with hot reloading at localhost:8081
`npm run android` or `npm run ios`