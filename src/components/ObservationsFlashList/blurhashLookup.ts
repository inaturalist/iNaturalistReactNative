// output of blurhash node app
import data from "./blurhashTest.json";

const sourceToBlurhash = Object.fromEntries(
  data.results
    // uncomment the following for: col 1 blur, col 2 existing behavior
    // .filter( ( _x, i ) => i % 2 === 0 )
    .map(
      ( { source, blurhash } ) => [source.replace( "square", "medium" ), blurhash],
    ),
);
// swap these for enabling / disabling
// export default {};
export default sourceToBlurhash;
