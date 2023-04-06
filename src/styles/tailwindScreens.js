// @flow

import resolveConfig from "tailwindcss/resolveConfig";

import tailwindConfig from "../../tailwind.config";

// $FlowIgnore
const fullConfig = resolveConfig( tailwindConfig );

export default fullConfig.theme.screens;
