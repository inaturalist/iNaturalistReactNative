import { fireEvent, screen } from "@testing-library/react-native";
import About from "components/About";
import React from "react";
import Mailer from "react-native-mail";

import { renderComponent } from "../../helpers/render";

jest.mock( "react-native-mail", ( ) => ( {
  mail: jest.fn( )
} ) );

test( "native email client is opened on button press", ( ) => {
  renderComponent( <About /> );
  const debugLogButton = screen.getByText( /EMAIL-DEBUG-LOGS/ );
  expect( debugLogButton ).toBeTruthy( );
  fireEvent.press( debugLogButton );
  expect( Mailer.mail ).toHaveBeenCalled( );
} );
