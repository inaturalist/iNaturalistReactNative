import React from "react";
import {fireEvent, render, waitFor} from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import AddID from "../../../../src/components/ObsEdit/AddID";
import factory, {makeResponse} from "../../../factory";
// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );
import inatjs from "inaturalistjs";

// this resolves a test failure with the Animated library:
// Animated: `useNativeDriver` is not supported because the native animated module is missing.
jest.useFakeTimers( );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
    } )
  };
} );

const testTaxaList = [
  { taxon: factory( "RemoteTaxon" ) },
  { taxon: factory( "RemoteTaxon" ) },
  { taxon: factory( "RemoteTaxon" ) }
];

const mockExpected = testTaxaList;

const renderAddID = ( route ) => render(
  <NavigationContainer>
    <AddID route={route} />
  </NavigationContainer>
);

test( "renders taxon search results", async ( ) => {
  inatjs.search.mockResolvedValue( makeResponse( mockExpected ) );
  const route = { params: { } };
  const { getByTestId } = renderAddID( route );


  const input = getByTestId( "SearchTaxon" );
  await waitFor( () => {
    fireEvent.changeText( input, "Some taxon" );
  } );

  const taxon = testTaxaList[0].taxon;

  expect( getByTestId( `Search.taxa.${taxon.id}` ) ).toBeTruthy( );
  expect( getByTestId( `Search.taxa.${taxon.id}.photo` ).props.source ).toStrictEqual( { "uri": taxon.default_photo.square_url } );
} );
