/** @type {import('tailwindcss').Config} */

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
        "Whitney-Semibold": ["Whitney-Semibold"],
        "Whitney-Semibold-Pro": ["Whitney-Semibold-Pro"], // Android naming convention
        "Whitney-Semibold-Italic": ["Whitney-Semibold-Italic"],
        "Whitney-Semibold-Italic-Pro": ["Whitney-Semibold-Italic-Pro"], // Android naming convention
        "Whitney-Book": ["Whitney-Book"],
        "Whitney-Book-Pro": ["Whitney-Book-Pro"], // Android naming convention
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
        xs: "1px",
        sm: "4px",
        md: "9px",
        lg: "8px",
        "2xl": "15px"
      }
    },
    colors: {
      accessibleGreen: "#5D8017",
      black: "#000000",
      darkGray: "#454545",
      darkGrayDisabled: "#828181",
      inatGreen: "#74AC00",
      inatGreenDisabled: "#B9D580",
      inatGreenDisabledDark: "#3A5600",
      lightGray: "#E8E8E8",
      mediumGray: "#BFBFBF",
      mediumGrayGhost: "#BFBFBF33",
      warningRed: "#9B1010",
      warningRedDisabled: "#b06365",
      warningYellow: "#E6A939",
      white: "#ffffff",
      yellow: "#FFD600",

      // Mostly for debugging
      red: "#FF0000",
      green: "#00FF00",
      blue: "#0000FF",
      deepPink: "#FF1493",
      deeppink: "#FF1493",
      DeepPink: "#FF1493",
      orange: "#FFA500"
    },
    screens: {
      sm: "240px",
      md: "320px",
      lg: "390px",
      xl: "744px",
      "2xl": "1366px"
    }
  },
  plugins: []
};
