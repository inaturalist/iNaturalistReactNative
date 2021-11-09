// import React from "react";
// import { render } from "@testing-library/react-native";
// import { NavigationContainer } from "@react-navigation/native";
import inatjs from "inaturalistjs";
// import AccessibilityEngine from "react-native-accessibility-engine";

// import ObsList from "../ObsList";
// import EmptyList from "../EmptyList";

// test( "it renders all inputs as expected", ( ) => {
//   const { toJSON } = render(
//     // need nav container here so the useNavigation hook in Footer does not fail
//     // not sure if there's a better way of doing this without needing to wrap every test
//     // https://www.reactnativeschool.com/setup-jest-tests-with-react-navigation
//     <NavigationContainer>
//       <ObsList />
//     </NavigationContainer>
//   );
//   expect( toJSON ).toMatchSnapshot( );
// } );

beforeEach( ( ) => {
  fetch.resetMocks( );
} );

test( "calls the observations search endpoint", ( ) => {
  inatjs.observations.search( );

  expect( fetch.mock.calls.length ).toEqual( 1 );
  expect( fetch.mock.calls[0][0] ).toEqual( "https://api.inaturalist.org/v1/observations" );
} );

test( "searches using the passed in parameters", async ( ) => {
  const identifications = {
    identifications: [
      {
        body: "12345"
      }
    ]
  };
  fetch.mockResponse( JSON.stringify( identifications ) );
  const response = await inatjs.observations.search( { user_login: "albulltest" } );

  expect( fetch.mock.calls.length ).toEqual( 1 );
  expect( fetch.mock.calls[0][0] ).toEqual(
    "https://api.inaturalist.org/v1/observations?user_login=albulltest"
  );
  expect( response ).toEqual( identifications );
} );

// test( "should not have accessibility errors", ( ) => {
//   const obsList = (
//     <NavigationContainer>
//       <ObsList />
//     </NavigationContainer>
//   );
//   expect( ( ) => AccessibilityEngine.check( obsList ) ).not.toThrow();
// } );
