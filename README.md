# iNaturalistReactNative

## Install packages and pods
1. Run `npm install`
2. Run `npx pod-install ios` or `cd ios && pod install` from the root directory
3. Make sure to place the `.env` file in the root folder, which is not part of the code repo (contains secrets, such as OAuth client ID).

## Run build
1. Run `npm start -- --reset-cache` (`npm start` works too, but resetting the cache each time makes for a lot less build issues)
2. Run `npm run ios` or `npm run android`

## Run tests
1. Run `npm run test`

## Troubleshooting
1. Run `react-native clean-project`. This will give you options to clean caches, clean builds, reinstall pods, and reinstall node_modules. Using this eliminates a lot of hard-to-diagnose build issues.
