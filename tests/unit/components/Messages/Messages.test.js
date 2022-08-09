import { NavigationContainer } from "@react-navigation/native";
import { render } from "@testing-library/react-native";
import React from "react";

import * as useMessages from "../../../../src/components/Messages/hooks/useMessages";
import Messages from "../../../../src/components/Messages/Messages";
import factory from "../../../factory";

const mockedNavigate = jest.fn( );
const mockMessage = factory( "RemoteMessage" );

jest.mock( "../../../../src/components/Messages/hooks/useMessages", ( ) => ( {
  __esModule: true,
  default: null
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      navigate: mockedNavigate
    } )
  };
} );

jest.useFakeTimers();

const renderMessages = ( ) => render(
  <NavigationContainer>
    <Messages />
  </NavigationContainer>
);

it( "displays activity indicator when loading", ( ) => {
  // eslint-disable-next-line no-import-assign
  useMessages.default = ( ) => ( {
    messages: [],
    loading: true
  } );
  const { getByTestId } = renderMessages( );
  expect( getByTestId( "Messages.activityIndicator" ) ).toBeTruthy( );
} );

it( "displays message subject and not activity indicator when loading complete", ( ) => {
  // eslint-disable-next-line no-import-assign
  useMessages.default = ( ) => ( {
    messages: [mockMessage],
    loading: false
  } );
  const { getByText, queryByTestId } = renderMessages( );
  expect( getByText( mockMessage.subject ) ).toBeTruthy( );
  expect( queryByTestId( "Messages.activityIndicator" ) ).toBeNull( );
} );
