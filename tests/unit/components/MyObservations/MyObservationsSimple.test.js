import { screen } from "@testing-library/react-native";
import MyObservationsSimple, { OBSERVATIONS_TAB }
  from "components/MyObservations/MyObservationsSimple";
import { MyObservationsProvider } from "providers/MyObservationsContext";
import React from "react";
// import DeviceInfo from "react-native-device-info";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockObservations = [
  factory( "LocalObservation", {
    comments: [
      factory( "LocalComment" ),
      factory( "LocalComment" ),
      factory( "LocalComment" ),
    ],
    observationPhotos: [factory( "LocalObservationPhoto" )],
  } ),
  factory( "LocalObservation", {
    observationPhotos: [factory( "LocalObservationPhoto" )],
  } ),
];
const mockObsIds = mockObservations.map( ( { uuid } ) => ( { uuid } ) );

let mockObsByUuid = {};

jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.realm,
      useObject: ( _type, uuid ) => mockObsByUuid[uuid] ?? null,
    },
  };
} );

const DEVICE_ORIENTATION_PHONE_PORTRAIT = {
  deviceOrientation: "portrait",
  isTablet: false,
  isLandscapeMode: false,
  screenWidth: 393,
  screenHeight: 852,
};

const DEVICE_ORIENTATION_PHONE_LANDSCAPE = {
  deviceOrientation: "landscapeLeft",
  isTablet: false,
  isLandscapeMode: true,
  screenWidth: 852,
  screenHeight: 393,
};

// const DEVICE_ORIENTATION_TABLET_PORTRAIT = {
//   deviceOrientation: "portrait",
//   isTablet: true,
//   isLandscapeMode: false,
//   screenWidth: 820,
//   screenHeight: 1180
// };

// const DEVICE_ORIENTATION_TABLET_LANDSCAPE = {
//   deviceOrientation: "landscapeLeft",
//   isTablet: true,
//   isLandscapeMode: true,
//   screenWidth: 1180,
//   screenHeight: 820
// };

jest.mock( "sharedHooks/useDeviceOrientation", ( ) => ( {
  __esModule: true,
  default: jest.fn( () => ( DEVICE_ORIENTATION_PHONE_PORTRAIT ) ),
} ) );

const renderMyObservations = ( layout, showSearchEmptyState = false ) => renderComponent(
  <MyObservationsProvider>
    <MyObservationsSimple
      layout={layout}
      observationIds={mockObsIds}
      onEndReached={jest.fn( )}
      updateObservationsView={jest.fn( )}
      setShowLoginSheet={jest.fn( )}
      activeTab={OBSERVATIONS_TAB}
      showSearchEmptyState={showSearchEmptyState}
    />
  </MyObservationsProvider>,
);

describe( "MyObservationsSimple", () => {
  beforeAll( async () => {
    jest.useFakeTimers( );
  } );

  beforeEach( () => {
    mockObsByUuid = {};
    mockObservations.forEach( obs => {
      mockObsByUuid[obs.uuid] = obs;
    } );
  } );

  it( "renders an observation", async () => {
    renderMyObservations( "list" );
    const obs = mockObservations[0];

    // Test that a card got rendered for the test obs
    const card = await screen.findByTestId( `MyObservations.obsListItem.${obs.uuid}` );
    expect( card ).toBeTruthy();
  } );

  it( "renders multiple observations", async () => {
    renderMyObservations( "list" );
    // Awaiting the first observation because using await in the forEach errors out
    const firstObs = mockObservations[0];
    await screen.findByTestId( `MyObservations.obsListItem.${firstObs.uuid}` );
    mockObservations.forEach( obs => {
      expect(
        screen.getByTestId( `MyObservations.obsListItem.${obs.uuid}` ),
      ).toBeTruthy();
    } );
    // TODO: some things are still happening in the background so I unmount here,
    // better probably to mock away those things happening in the background for this test
    screen.unmount();
  } );

  it( "render grid view", ( ) => {
    renderMyObservations( "grid" );
    mockObservations.forEach( obs => {
      expect( screen.getByTestId( `MyObservations.obsGridItem.${obs.uuid}` ) ).toBeTruthy();
    } );
  } );

  it( "renders SearchEmptyState instead of the observations list when a search has no "
    + "results", ( ) => {
    renderMyObservations( "list", true );

    expect( screen.getByTestId( "MyObservationsSearchEmptyState.reset" ) ).toBeTruthy( );
    expect( screen.queryByTestId( "MyObservationsAnimatedList" ) ).toBeNull( );
  } );

  describe( "grid view", ( ) => {
    describe( "portrait orientation", ( ) => {
      describe( "on a phone", ( ) => {
        it( "should have 2 columns", async ( ) => {
          renderMyObservations( "grid" );
          const list = screen.getByTestId( "MyObservationsAnimatedList" );
          expect( list.props.numColumns ).toEqual( 2 );
        } );
      } );
      // describe( "on a tablet", ( ) => {
      //   beforeEach( ( ) => {
      //     DeviceInfo.isTablet.mockReturnValue( true );
      //   } );
      //   it( "should have 4 columns", async ( ) => {
      //     useDeviceOrientation.mockImplementation( ( ) => DEVICE_ORIENTATION_TABLET_PORTRAIT );
      //     renderMyObservations( "grid" );
      //     const list = screen.getByTestId( "MyObservationsAnimatedList" );
      //     expect( list.props.numColumns ).toEqual( 4 );
      //   } );
      // } );
    } );
    describe( "landscape orientation", ( ) => {
      describe( "on a phone", ( ) => {
        it( "should have 2 columns", async ( ) => {
          useDeviceOrientation.mockImplementation( ( ) => DEVICE_ORIENTATION_PHONE_LANDSCAPE );
          renderMyObservations( "grid" );
          const list = screen.getByTestId( "MyObservationsAnimatedList" );
          expect( list.props.numColumns ).toEqual( 2 );
        } );
      } );
      // describe( "on a tablet", ( ) => {
      //   beforeEach( ( ) => {
      //     DeviceInfo.isTablet.mockReturnValue( true );
      //   } );
      //   it( "should have 6 columns", async ( ) => {
      //     useDeviceOrientation.mockImplementation( ( ) => DEVICE_ORIENTATION_TABLET_LANDSCAPE );
      //     renderMyObservations( "grid" );
      //     const list = screen.getByTestId( "MyObservationsAnimatedList" );
      //     expect( list.props.numColumns ).toEqual( 6 );
      //   } );
      // } );
    } );
  } );
} );
