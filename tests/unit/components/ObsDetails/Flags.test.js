import { fireEvent } from "@testing-library/react-native";
import ActivityItem from "components/ObsDetails/ActivityItem";
import FlagItemModal from "components/ObsDetails/FlagItemModal";
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

jest.useFakeTimers( );
const mockCallback = jest.fn();
const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30"
} );

const mockIdentification = factory( "RemoteIdentification" );

jest.mock( "sharedHooks/useIsConnected" );

jest.mock( "sharedHelpers/dateAndTime", ( ) => ( {
  __esModule: true,
  formatIdDate: jest.fn()
} ) );

jest.mock( "providers/contexts", ( ) => ( {
  __esModule: true,
  RealmContext: {
    useRealm: jest.fn()
  }
} ) );

// TODO if/when we test mutation behavior, the mutation will need to be mocked
// so it actually does something, or we need to take a different approach
const mockMutate = jest.fn();
jest.mock( "sharedHooks/useAuthenticatedMutation", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    mutate: mockMutate
  } )
} ) );

jest.mock( "../../../../src/components/LoginSignUp/AuthenticationService", ( ) => ( {
  getUserId: ( ) => mockObservation.user.id,
  isCurrentUser: ( ) => false
} ) );

jest.mock( "react-native-keyboard-aware-scroll-view", () => {
  const KeyboardAwareScrollView = require( "react-native" ).ScrollView;
  return { KeyboardAwareScrollView };
} );

test( "renders activity item with Flag Button", async ( ) => {
  const {
    findByTestId, queryByTestId, queryByText
  } = renderComponent(
    <PaperProvider>
      <ActivityItem item={mockIdentification} />
    </PaperProvider>
  );

  expect( await findByTestId( "KebabMenu.Button" ) ).toBeTruthy( );
  expect( await findByTestId( "FlagItemModal" ) ).toBeTruthy();
  expect( await findByTestId( "FlagItemModal" ) ).toHaveProperty( "props.visible", false );

  fireEvent.press( await findByTestId( "KebabMenu.Button" ) );
  expect( queryByTestId( "MenuItem.Flag" ) ).toBeTruthy( );
  expect( queryByText( "Flag" ) ).toBeTruthy( );
} );

test( "renders Flag Modal when Flag button pressed", async ( ) => {
  const {
    findByTestId, queryByText, queryByTestId
  } = renderComponent(
    <PaperProvider>
      <ActivityItem item={mockIdentification} />
    </PaperProvider>
  );

  expect( await findByTestId( "KebabMenu.Button" ) ).toBeTruthy( );
  expect( await findByTestId( "FlagItemModal" ) ).toBeTruthy();
  expect( await findByTestId( "FlagItemModal" ) ).toHaveProperty( "props.visible", false );

  fireEvent.press( await findByTestId( "KebabMenu.Button" ) );
  expect( await findByTestId( "MenuItem.Flag" ) ).toBeTruthy( );
  fireEvent.press( await findByTestId( "MenuItem.Flag" ) );
  expect( await queryByTestId( "FlagItemModal" ) ).toHaveProperty( "props.visible", true );
  expect( await queryByText( "Flag An Item" ) ).toBeTruthy( );
} );

test( "renders Flag Modal content", async ( ) => {
  const {
    getByText, getAllByRole
  } = renderComponent(
    <FlagItemModal
      id="000"
      itemType="foo"
      showFlagItemModal
      closeFlagItemModal={mockCallback}
      onItemFlagged={mockCallback}
    />
  );
  expect( getByText( "Flag An Item" ) ).toBeTruthy( );
  expect( getByText( "Spam" ) ).toBeTruthy( );
  expect( getByText( "Offensive/Inappropriate" ) ).toBeTruthy( );
  expect( getByText( "Other" ) ).toBeTruthy( );
  expect( getAllByRole( "checkbox" ) ).toHaveLength( 3 );
} );

test( "calls flag api when save button pressed", async ( ) => {
  const {
    queryByText, queryAllByRole
  } = renderComponent(
    <FlagItemModal
      id="000"
      itemType="foo"
      showFlagItemModal
      closeFlagItemModal={mockCallback}
      onItemFlagged={mockCallback}
    />
  );
  expect( queryByText( "Flag An Item" ) ).toBeTruthy( );
  expect( queryByText( "Spam" ) ).toBeTruthy( );
  expect( queryAllByRole( "checkbox" ) ).toHaveLength( 3 );
  fireEvent.press( queryByText( "Spam" ) );
  expect( queryByText( "Save" ) ).toBeTruthy( );
  fireEvent.press( queryByText( "Save" ) );
  expect( await mockMutate ).toHaveBeenCalled();
} );
