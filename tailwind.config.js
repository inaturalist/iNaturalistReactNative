/** @type {import('tailwindcss').Config} */

const setLineHeight = lineHeight => ( { lineHeight } );

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      letterSpacing: {
        tight: "-.25px",
        wide: ".65px",
        widest: "2px",
      },
      fontSize: {
        // Typography: Heading1
        "3xl": ["25px", setLineHeight( "30px" )],
        // Typography: Heading2
        "2xl": ["21px", setLineHeight( "25.2px" )],
        // Typography: Subheading1
        xl: ["20px", setLineHeight( "24px" )],
        // Typography: Heading3
        lg: ["18px", setLineHeight( "21.6px" )],
        // Typography: Body1/List1
        base: ["17px", setLineHeight( "20.4px" )],
        // Typography: Heading4/Body2/UnderlinedLink
        md: ["15px", setLineHeight( "18px" )],
        // Typography: List2
        sm: ["14px", setLineHeight( "16.8px" )],
        // Typography: Body3
        xs: ["13px", setLineHeight( "18px" )],
        // Typography: Body4
        "2xs": ["11px", setLineHeight( "13.2px" )],
        // Typography: Heading5
        "3xs": ["8px", setLineHeight( "9.6px" )],
      },
      height: {
        22: "5.5rem",
      },
      fontFamily: {
        "Lato-Bold": ["Lato-Bold"],
        "Lato-BoldItalic": ["Lato-BoldItalic"], // working
        "Lato-Italic": ["Lato-Italic"], // working
        "Lato-Medium": ["Lato-Medium"],
        "Lato-MediumItalic": ["Lato-MediumItalic"], // working
        "Lato-Regular": ["Lato-Regular"],
        // selected from list of fonts already available in RN
        // https://infinitbility.com/react-native-font-family-list/
        monospace: ["monospace"],
        Menlo: ["Menlo"],
      },
      borderRadius: {
        // tried using rem value here, but it wouldn't load on iOS or Android
        DEFAULT: "7px",
        xs: "1px",
        sm: "4px",
        md: "9px",
        lg: "8px",
        "2xl": "15px",
      },
    },
    colors: {
      accessibleGreen: "#5D8017",
      black: "#000000",
      darkGray: "#454545",
      darkGrayDisabled: "#828181",
      darkModeGray: "#232323",
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
      orange: "#FFA500",
    },
    screens: {
      sm: "240px",
      md: "320px",
      lg: "390px",
      xl: "744px",
      "2xl": "1366px",
    },
  },
};
