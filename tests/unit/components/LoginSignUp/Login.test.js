import React from "react";
import {fireEvent, render, waitFor} from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import factory from "../../../factory";
import Login from "../../../../src/components/LoginSignUp/Login";

const testUser = factory( "RemoteUser" );
const mockExpected = testUser;
const EXPECTED_PASSWORD = "123456";

jest.mock( "../../../../src/components/LoginSignUp/AuthenticationService", ( ) => ( {
  authenticateUser: async ( username, password ) => {
    console.log( "Authenticate ", username, "==>", password );
    this.loggedIn = true;
    return true;
  },
  signOut: async () => {
    this.loggedIn = false;
  },
  getUsername: async () => {
    console.log( "getUsername", mockExpected.login );
    return mockExpected.login;
  },
  isLoggedIn: async () => {
    return this.loggedIn;
  }
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
    } )
  };
} );

const renderLogin = async ( ) => render(
  <NavigationContainer>
    <Login />
  </NavigationContainer>
);

test.todo( "renders login screen (not signed in)" );
// test( "renders login screen (not signed in)", async ( ) => {
//   const {getByTestId} = renderLogin();
//   expect( getByTestId( "Login.loginButton" ) ).toBeTruthy();
// } );

test.todo( "renders login screen and logins" );
// test( "renders login screen and logins", async ( ) => {
//   const {getByTestId, getByText} = renderLogin();
//   await waitFor( () => {
//     fireEvent.changeText( getByTestId( "Login.email" ), testUser.email );
//     fireEvent.changeText( getByTestId( "Login.password" ), EXPECTED_PASSWORD );
//     fireEvent.press( getByTestId( "Login.loginButton" ) );
//     expect( getByTestId( "Login.loggedInAs" ) ).toBeInTheDOM();
//     expect( getByText( `Logged in as: ${testUser.login}` ) ).toBeInTheDOM();
//   } );
// } );
