import React from "react";
import { Linking } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import factory from "../../../factory";
import TaxonDetails from "../../../../src/components/TaxonDetails/TaxonDetails";

const testTaxon = factory( "RemoteTaxon" );

// TODO: is this really the best way to mock hooks? based on this answer in Stack Overflow:
// https://stackoverflow.com/questions/60270013/how-to-mock-react-custom-hook-returned-value
const mockExpected = testTaxon;
jest.mock( "../../../../src/components/TaxonDetails/hooks/useTaxonDetails", ( ) => ( {
  useTaxonDetails: ( ) => {
    return {
      taxon: mockExpected,
      loading: false
    };
  },
  useSimilarSpecies: ( ) => {
    return {
      similarSpecies: []
    };
  }
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        id: mockExpected.id
      }
    } )
  };
} );

const renderTaxonDetails = ( ) => render(
  <NavigationContainer>
    <TaxonDetails />
  </NavigationContainer>
);

test( "renders taxon details from API call", ( ) => {
  const { getByTestId, getByText } = renderTaxonDetails( );

  expect( getByTestId( `TaxonDetails.${testTaxon.id}` ) ).toBeTruthy( );
  expect( getByTestId( "PhotoScroll.photo" ).props.source ).toStrictEqual( { "uri": testTaxon.taxonPhotos[0].photo.url } );
  expect( getByText( testTaxon.preferred_common_name ) ).toBeTruthy( );
  expect( getByText( testTaxon.wikipedia_summary ) ).toBeTruthy( );
} );

// right now this is failing on react-native-modal, since there's a TouchableWithFeedback
// that allows the user to tap the backdrop and exit the modal
test.todo( "should not have accessibility errors" );
// test( "should not have accessibility errors", ( ) => {
//   const taxonDetails = (
//     <NavigationContainer>
//       <TaxonDetails />
//     </NavigationContainer>
//   );
//   expect( taxonDetails ).toBeAccessible( );
// } );


test( "navigates to Wikipedia on button press", ( ) => {
  const { getByTestId } = renderTaxonDetails( );

  fireEvent.press( getByTestId( "TaxonDetails.wikipedia" ) );
  expect( Linking.openURL ).toHaveBeenCalledTimes( 1 );
  expect( Linking.openURL ).toHaveBeenCalledWith( testTaxon.wikipedia_url );
} );
