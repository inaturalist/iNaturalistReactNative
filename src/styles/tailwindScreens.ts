// Same JSON tailwind.config.js reads. Importing it instead of the config gives typed values
// and keeps the config and tailwindcss/resolveConfig out of the app bundle.
import tailwindTheme from "./tailwindTheme.json";

export default tailwindTheme.screens;
