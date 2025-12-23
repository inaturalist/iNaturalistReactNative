import { fireEvent, screen } from "@testing-library/react-native";
import Developer from "components/Developer/Developer";
import React from "react";
import Mailer from "react-native-mail";
import { renderComponent } from "tests/helpers/render";

jest.mock( "react-native-mail", ( ) => ( {
  mail: jest.fn( ),
} ) );

describe( "email logs button", ( ) => {
  it( "should open the native email client", async ( ) => {
    renderComponent( <Developer /> );
    const debugLogButton = await screen.findByText( /EMAIL DEBUG LOGS/ );
    expect( debugLogButton ).toBeTruthy( );
    fireEvent.press( debugLogButton );
    expect( Mailer.mail ).toHaveBeenCalled( );
  } );
} );
