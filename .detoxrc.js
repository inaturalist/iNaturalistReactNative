// const { version } = require("./package.json");
// const fs = require("fs");

// const buildGradle = fs.readFileSync("./android/app/build.gradle", "utf8");
// // const versionCode = buildGradle.match(/versionCode (\d+)/)[1];
const apkFilenamePrefix = "org.inaturalist.iNaturalistMobile";

/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    $0: "jest",
    args: {
      config: "e2e/jest.config.js",
      _: ["e2e"]
    },
    jest: {
      setupTimeout: 900000,
      teardownTimeout: 900000
    }
  },
  apps: {
    "ios.debug": {
      type: "ios.app",
      binaryPath:
        "ios/build/Build/Products/Debug-iphonesimulator/iNaturalistReactNative.app",
      build:
        /* eslint-disable-next-line max-len */
        "xcodebuild -workspace ios/iNaturalistReactNative.xcworkspace -scheme iNaturalistReactNative -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build"
    },
    "ios.release": {
      type: "ios.app",
      binaryPath:
        "ios/build/Build/Products/Release-iphonesimulator/iNaturalistReactNative.app",
      build:
      /* eslint-disable-next-line max-len */
        "xcodebuild -workspace ios/iNaturalistReactNative.xcworkspace -scheme iNaturalistReactNative -configuration Release -sdk iphonesimulator -derivedDataPath ios/build"
    },
    "android.debug": {
      type: "android.apk",
      binaryPath: `android/app/build/outputs/apk/debug/${apkFilenamePrefix}-debug.apk`,
      /* eslint-disable-next-line max-len */
      testBinaryPath: `android/app/build/outputs/apk/androidTest/debug/${apkFilenamePrefix}-debug-androidTest.apk`,
      build:
        /* eslint-disable-next-line max-len */
        "(cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug -PreactNativeArchitectures=x86_64)"
    },
    "android.release": {
      type: "android.apk",
      binaryPath: `android/app/build/outputs/apk/release/${apkFilenamePrefix}-release.apk`,
      /* eslint-disable-next-line max-len */
      testBinaryPath: `android/app/build/outputs/apk/androidTest/release/${apkFilenamePrefix}-release-androidTest.apk`,
      build:
        /* eslint-disable-next-line max-len */
        "(cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release -PreactNativeArchitectures=x86_64)"
    }
  },
  devices: {
    simulator: {
      type: "ios.simulator",
      device: {
        type: "iPhone 15 Pro"
      }
    },
    emulator: {
      type: "android.emulator",
      device: {
        avdName: "Pixel_5_API_31_AOSP"
      }
    }
  },
  configurations: {
    "ios.debug": {
      device: "simulator",
      app: "ios.debug"
    },
    "ios.release": {
      device: "simulator",
      app: "ios.release"
    },
    "android.debug": {
      device: "emulator",
      app: "android.debug"
    },
    "android.release": {
      device: "emulator",
      app: "android.release"
    }
  }
};
