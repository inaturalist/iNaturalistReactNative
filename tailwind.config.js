/** @type {import('tailwindcss').Config} */

const PRIMARY_DISABLED = "#C6DC98";
const WARNING_DISABLED = "#B95F5E";
const NEUTRAL_DISABLED = "#D3D3D3";

module.exports = {
  content: ["index.js", "./src/**/*.js"],
  theme: {
    extend: {
      fontSize: {
        "3xl": [
          "26px",
          {
            lineHeight: "31px"
          }
        ],
        "2xl": [
          "22px",
          {
            lineHeight: "26px"
          }
        ],
        xl: [
          "21px",
          {
            lineHeight: "25px"
          }
        ],
        lg: [
          "19px",
          {
            lineHeight: "23px"
          }
        ],
        base: [
          "18px",
          {
            lineHeight: "22px"
          }
        ],
        md: [
          "16px",
          {
            lineHeight: "18px"
          }
        ],
        sm: [
          "14px",
          {
            lineHeight: "18px"
          }
        ],
        xs: [
          "12px",
          {
            lineHeight: "14px"
          }
        ],
        "2xs": [
          "8px",
          {
            lineHeight: "10px"
          }
        ]
      },
      height: {
        22: "5.5rem"
      },
      fontFamily: {
        "Whitney-Medium": ["Whitney-Medium"],
        "Whitney-Medium-Pro": ["Whitney-Medium-Pro"], // Android naming convention
        "Whitney-Light": ["Whitney-Light"],
        "Whitney-Light-Pro": ["Whitney-Light-Pro"], // Android naming convention
        "Whitney-BookItalic": ["Whitney-BookItalic"],
        "Whitney-BookItalic-Pro": ["Whitney-BookItalic-Pro"], // Android naming convention
        // selected from list of fonts already available in RN
        // https://infinitbility.com/react-native-font-family-list/
        "Papyrus-Condensed": ["Papyrus-Condensed"],
        Roboto: ["Roboto"],
        monospace: ["monospace"],
        Menlo: ["Menlo"]
      },
      borderRadius: {
        // tried using rem value here, but it wouldn't load on iOS or Android
        DEFAULT: "7px",
        lg: "8px",
        "2xl": "15px"
      }
    },
    colors: {
      darkGray: "#454545",
      warningRed: "#9B1010",
      focusGreen: "#74AC00",
      secondary: "#979797",
      tertiary: "#C4C4C4",
      white: "#ffffff",
      red: "#ff0000",
      black: "#000000",
      transparent: "#ff000000",
      inatGreen: "#77b300",
      inatGreenDisabled: "#cce2a4",
      gray: "#393939",
      lightGray: "#e8e8e8",
      midGray: "#cccccc",
      borderGray: "#d1d1d1",
      grayText: "#999999",
      logInGray: "#999999",
      border: "#DBDBDB",
      accessibleGreen: "#5D8017",
      buttonPrimaryDisabled: PRIMARY_DISABLED,
      buttonWarningDisabled: WARNING_DISABLED,
      buttonNeutralDisabled: NEUTRAL_DISABLED,
      selectionGreen: "#C1FF00",
      warningYellow: "#E6A939"
    }
  },
  plugins: []
};
