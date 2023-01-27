import { fireEvent } from "@testing-library/react-native";
import ActivityItem from "components/ObsDetails/ActivityItem";
import FlagItemModal from "components/ObsDetails/FlagItemModal";
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { inspect } from "sharedHelpers/logging";

// import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

jest.useFakeTimers( );
const mockCallback = jest.fn();
const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30"
} );

const mockIdentification = factory( "RemoteIdentification" );

const mockUser = factory( "LocalUser" );

jest.mock( "sharedHooks/useIsConnected" );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => mockUser
} ) );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: jest.fn( ( ) => ( {
    data: mockObservation
  } ) )
} ) );

jest.mock( "sharedHelpers/dateAndTime", ( ) => ( {
  __esModule: true,
  formatIdDate: jest.fn()
} ) );

// TODO if/when we test mutation behavior, the mutation will need to be mocked
// so it actually does something, or we need to take a different approach
jest.mock( "sharedHooks/useAuthenticatedMutation", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    mutate: jest.fn()
  } )
} ) );

jest.mock( "../../../../src/components/LoginSignUp/AuthenticationService", ( ) => ( {
  getUserId: ( ) => mockObservation.user.id,
  isCurrentUser: ( ) => false
} ) );

jest.mock( "react-native-keyboard-aware-scroll-view", ( ) => ( {
  KeyboardAwareScrollView: jest.fn().mockImplementation( ( { children } ) => children )
} ) );

test( "renders activity item with Flag Button", async ( ) => {
  const {
    findByTestId, findByText, queryByTestId
  } = renderComponent(
    <PaperProvider>
      <ActivityItem item={mockIdentification} />
    </PaperProvider>
  );

  expect( await queryByTestId( "KebabMenu.Button" ) ).toBeTruthy( );
  expect( await queryByTestId( "FlagItemModal" ) ).toBeTruthy();
  expect( await queryByTestId( "FlagItemModal" ) ).toHaveProperty( "props.visible", false );

  fireEvent.press( await findByTestId( "KebabMenu.Button" ) );
  expect( await findByTestId( "MenuItem.Flag" ) ).toBeTruthy( );
  expect( await findByText( "Flag" ) ).toBeTruthy( );
} );

test( "renders Flag Modal when Flag button pressed", async ( ) => {
  const {
    findByTestId, getByText, queryByTestId
  } = renderComponent(
    <PaperProvider>
      <ActivityItem item={mockIdentification} />
    </PaperProvider>
  );

  expect( await queryByTestId( "KebabMenu.Button" ) ).toBeTruthy( );
  expect( await queryByTestId( "FlagItemModal" ) ).toBeTruthy();
  expect( await queryByTestId( "FlagItemModal" ) ).toHaveProperty( "props.visible", false );

  fireEvent.press( await findByTestId( "KebabMenu.Button" ) );
  expect( await findByTestId( "MenuItem.Flag" ) ).toBeTruthy( );
  fireEvent.press( await findByTestId( "MenuItem.Flag" ) );
  expect( await queryByTestId( "FlagItemModal" ) ).toHaveProperty( "props.visible", true );
  expect( await getByText( "Flag An Item" ) ).toBeTruthy( );
} );

test( "renders Flag Modal content", async ( ) => {
  const {
    getByText, toJSON
  } = renderComponent(
    <FlagItemModal
      id="000"
      itemType="foo"
      showFlagItemModal
      closeFlagItemModal={mockCallback}
      onItemFlagged={mockCallback}
    />
  );
  console.log( inspect( toJSON() ) );
  expect( await getByText( "Flag An Item" ) ).toBeTruthy( );
  expect( await getByText( "Spam" ) ).toBeTruthy( );
} );

// test( "creates flag when submit pressed", async ( ) => {
//   const {
//     getByText
//   } = renderComponent(
//     <FlagItemModal
//       id="123"
//       itemType="Identification"
//       showFlagItemModal
//       closeFlagItemModal={mockCallback}
//       onItemFlagged={mockCallback}
//     />
//   );

//   expect( await getByText( "Flag An Item" ) ).toBeTruthy( );
//   expect( await getByText( "Spam" ) ).toBeTruthy( );
//   expect( await getByText( "Spam" ) ).toBeTruthy( );
// } );
