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

const renderLogin = ( ) => render(
  <NavigationContainer>
    <Login />
  </NavigationContainer>
);

test( "renders login screen (not signed in)", async ( ) => {
  await waitFor( ( ) => {
    const {getByTestId} = renderLogin();
    expect( getByTestId( "Login.loginButton" ) ).toBeTruthy();
  } );
} );

test( "renders login screen and logins", ( ) => {
  const {getByTestId, findByText, getByText } = renderLogin();
  fireEvent.changeText( getByTestId( "Login.email" ), testUser.email );
  fireEvent.changeText( getByTestId( "Login.password" ), EXPECTED_PASSWORD );
  fireEvent.press( getByTestId( "Login.loginButton" ) );
  /*
  await waitFor( () => {
    expect( getByTestId( "Login.loggedInAs" ) ).toBeInTheDOM();
    //expect( getByText( `Logged in as: ${testUser.login}` ) ).toBeInTheDOM();
  } );
   */
} );
