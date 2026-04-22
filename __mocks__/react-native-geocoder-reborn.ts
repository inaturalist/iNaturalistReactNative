export default ( {
  geocodePosition: jest.fn( coord => [
    `Somewhere near ${coord.lat}, ${coord.lng}`,
    "Somewhere",
    "Somewheria",
    "SW",
  ] ),
} );
