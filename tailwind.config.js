/** @type {import('tailwindcss').Config} */

const PRIMARY_DISABLED = "#C6DC98";
const WARNING_DISABLED = "#B95F5E";
const NEUTRAL_DISABLED = "#D3D3D3";

module.exports = {
  content: ["index.js", "./src/**/*.js"],
  theme: {
    extend: {
      height: {
        22: "5.5rem"
      },
      fontFamily: {
        "Whitney-Medium": ["Whitney-Medium"],
        "Whitney-Medium-Pro": ["Whitney-Medium-Pro"], // Android naming convention
        "Whitney-Light": ["Whitney-Light"],
        // selected from list of fonts already available in RN
        // https://infinitbility.com/react-native-font-family-list/
        "Papyrus-Condensed": ["Papyrus-Condensed"],
        Roboto: ["Roboto"],
        monospace: ["monospace"],
        Menlo: ["Menlo"]
      },
      borderRadius: {
        // tried using rem value here, but it wouldn't load on iOS or Android
        DEFAULT: "7px"
      }
    },
    colors: {
      primary: "#77b300",
      secondary: "#979797",
      tertiary: "#C4C4C4",
      white: "#ffffff",
      red: "#ff0000",
      black: "#000000",
      transparent: "#ff000000",
      inatGreen: "#77b300",
      inatGreenDisabled: "#cce2a4",
      gray: "#393939",
      lightGray: "#f5f5f5",
      midGray: "#cccccc",
      borderGray: "#d1d1d1",
      grayText: "#999999",
      logInGray: "#999999",
      border: "#DBDBDB",
      accessibleGreen: "#5D8017",
      darkGray: "#454545",
      warningRed: "#9B1010",
      buttonPrimaryDisabled: PRIMARY_DISABLED,
      buttonWarningDisabled: WARNING_DISABLED,
      buttonNeutralDisabled: NEUTRAL_DISABLED,
      selectionGreen: "#C1FF00"
    }
  },
  plugins: []
};
