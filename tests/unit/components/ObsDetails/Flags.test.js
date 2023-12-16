import { screen } from "@testing-library/react-native";
import FlagItemModal from "components/ObsDetails/FlagItemModal";
import initI18next from "i18n/initI18next";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockCallback = jest.fn();
const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30"
} );

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

describe( "Flags", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  // it( "renders activity item with Flag Button", async ( ) => {
  //   renderComponent(
  //     <PaperProvider>
  //       <ActivityItem item={mockIdentification} />
  //     </PaperProvider>
  //   );

  //   expect( await screen.findByTestId( "KebabMenu.Button" ) ).toBeTruthy( );
  //   expect( await screen.findByTestId( "FlagItemModal" ) ).toBeTruthy();
  //   expect( await screen.findByTestId( "FlagItemModal" ) )
  // .toHaveProperty( "props.visible", false );

  //   fireEvent.press( await screen.findByTestId( "KebabMenu.Button" ) );
  //   expect( await screen.findByTestId( "MenuItem.Flag" ) ).toBeTruthy( );
  //   expect( screen.getByText( "Flag" ) ).toBeTruthy( );
  // } );

  // it( "renders Flag Modal when Flag button pressed", async ( ) => {
  //   renderComponent(
  //     <PaperProvider>
  //       <ActivityItem item={mockIdentification} />
  //     </PaperProvider>
  //   );

  //   expect( await screen.findByTestId( "KebabMenu.Button" ) ).toBeTruthy( );
  //   expect( await screen.findByTestId( "FlagItemModal" ) ).toBeTruthy();
  //   expect( await screen.findByTestId( "FlagItemModal" ) )
  // .toHaveProperty( "props.visible", false );

  //   fireEvent.press( await screen.findByTestId( "KebabMenu.Button" ) );
  //   expect( await screen.findByTestId( "MenuItem.Flag" ) ).toBeTruthy( );
  //   fireEvent.press( await screen.findByTestId( "MenuItem.Flag" ) );
  //   expect( await screen.findByTestId( "FlagItemModal" ) )
  //  .toHaveProperty( "props.visible", true );
  //   expect( screen.getByText( "Flag An Item" ) ).toBeTruthy( );
  // } );

  it( "renders Flag Modal content", async ( ) => {
    renderComponent(
      <FlagItemModal
        id="000"
        itemType="foo"
        showFlagItemModal
        closeFlagItemModal={mockCallback}
        onItemFlagged={mockCallback}
      />
    );
    expect( await screen.findByText( "Flag An Item" ) ).toBeTruthy( );
    expect( screen.getByText( "Spam" ) ).toBeTruthy( );
    expect( screen.getByText( "Offensive/Inappropriate" ) ).toBeTruthy( );
    expect( screen.getByText( "Other" ) ).toBeTruthy( );
    expect( screen.getAllByRole( "radio" ) ).toHaveLength( 3 );
  } );

  // it( "calls flag api when save button pressed", async ( ) => {
  //   renderComponent(
  //     <FlagItemModal
  //       id="000"
  //       itemType="foo"
  //       showFlagItemModal
  //       closeFlagItemModal={mockCallback}
  //       onItemFlagged={mockCallback}
  //     />
  //   );
  //   expect( await screen.findByText( "Flag An Item" ) ).toBeTruthy( );
  //   expect( screen.getByText( "Spam" ) ).toBeTruthy( );
  //   expect( screen.queryAllByRole( "checkbox" ) ).toHaveLength( 3 );
  //   fireEvent.press( screen.queryByText( "Spam" ) );
  //   expect( await screen.findByText( "Save" ) ).toBeTruthy( );
  //   fireEvent.press( screen.queryByText( "Save" ) );
  //   expect( await mockMutate ).toHaveBeenCalled();
  // } );
} );
