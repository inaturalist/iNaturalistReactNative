import isolateHumans from "sharedHooks/useSuggestions/isolateHumans";

const PROD_HUMAN_ID = 43584;

describe( "useSuggestions/isolateHumans", () => {
  test.each( [
    [
      [{ _isHuman: false, taxon: {} }, { _isHuman: true, taxon: { id: PROD_HUMAN_ID } }],
    ],
    [
      [{ _isHuman: false, taxon: {} }, { _isHuman: true, taxon: { name: "Homo" } }],
    ],
    [
      [{ _isHuman: false, taxon: {} }, { _isHuman: true, taxon: { name: "Homo sapiens" } }],
    ],
  ] )(
    "should return array with only human suggestion if human suggestion is included in input ",
    suggestions => {
      const result = isolateHumans( suggestions );

      expect( result ).toHaveLength( 1 );
      expect( result[0]._isHuman ).toBe( true );
    },
  );

  test( "should not modify input if no human suggestion is included in input", () => {
    const suggestions = [{ taxon: { id: 123, name: "Panda" } }, { taxon: {} }];

    const result = isolateHumans( suggestions );

    expect( result ).toBe( suggestions );
    expect( result ).toHaveLength( 2 );
  } );
} );
