const fs = require( "fs" );
const path = require( "path" );
// postcss is a dependency of tailwindcss, which pins the compatible version
// eslint-disable-next-line import/no-extraneous-dependencies
const postcss = require( "postcss" );
const tailwindcss = require( "tailwindcss" );

const CSS_CACHE_DIR = path.join( __dirname, ".cache" );
const CSS_CACHE_PATH = path.join( CSS_CACHE_DIR, "nativewind.css" );

module.exports = async () => {
  process.env.TZ = "UTC";

  // In the app, metro compiles global.css with tailwind and injects the
  // result into the nativewind runtime. Jest has no metro, so compile it once
  // here; tests/nativewind.setup.js loads it into the runtime per worker.
  const input = fs.readFileSync(
    path.join( __dirname, "..", "global.css" ),
    "utf8",
  );
  const { css } = await postcss( [
    // eslint-disable-next-line global-require, import/no-dynamic-require
    tailwindcss( require( "../tailwind.config" ) ),
  ] ).process( input, { from: undefined } );
  fs.mkdirSync( CSS_CACHE_DIR, { recursive: true } );
  fs.writeFileSync( CSS_CACHE_PATH, css );
};
