/** @type {import('tailwindcss').Config} */

const PRIMARY = "#5D8017";
const PRIMARY_DISABLED = "#C6DC98";
const WARNING = "#9B1111";
const WARNING_DISABLED = "#B95F5E";
const NEUTRAL = "#979797";
const NEUTRAL_DISABLED = "#D3D3D3";

module.exports = {
  content: ["index.js", "./src/**/*.js"],
  theme: {
    extend: {},
    colors: {
      primary: "#77b300",
      secondary: "#979797",
      tertiary: "#C4C4C4",
      white: "#ffffff",
      red: "#ff0000",
      black: "#000000",
      border: "#DBDBDB",
      buttonPrimary: PRIMARY,
      buttonPrimaryDisabled: PRIMARY_DISABLED,
      buttonWarning: WARNING,
      buttonWarningDisabled: WARNING_DISABLED,
      buttonNeutral: NEUTRAL,
      buttonNeutralDisabled: NEUTRAL_DISABLED
    }
  },
  plugins: []
};
