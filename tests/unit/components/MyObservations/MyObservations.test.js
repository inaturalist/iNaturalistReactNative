import { screen } from "@testing-library/react-native";
import MyObservations from "components/MyObservations/MyObservations";
import { INITIAL_STATE } from "components/MyObservations/MyObservationsContainer";
import React from "react";
import DeviceInfo from "react-native-device-info";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockObservations = [
  factory( "LocalObservation", {
    comments: [
      factory( "LocalComment" ),
      factory( "LocalComment" ),
      factory( "LocalComment" )
    ],
    observationPhotos: [factory( "LocalObservationPhoto" )]
  } ),
  factory( "LocalObservation", {
    observationPhotos: [factory( "LocalObservationPhoto" )]
  } )
];

const DEVICE_ORIENTATION_PHONE_PORTRAIT = {
  deviceOrientation: "portrait",
  isTablet: false,
  isLandscapeMode: false,
  screenWidth: 393,
  screenHeight: 852
};

const DEVICE_ORIENTATION_PHONE_LANDSCAPE = {
  deviceOrientation: "landscapeLeft",
  isTablet: false,
  isLandscapeMode: true,
  screenWidth: 852,
  screenHeight: 393
};

const DEVICE_ORIENTATION_TABLET_PORTRAIT = {
  deviceOrientation: "portrait",
  isTablet: true,
  isLandscapeMode: false,
  screenWidth: 820,
  screenHeight: 1180
};

const DEVICE_ORIENTATION_TABLET_LANDSCAPE = {
  deviceOrientation: "landscapeLeft",
  isTablet: true,
  isLandscapeMode: true,
  screenWidth: 1180,
  screenHeight: 820
};

jest.mock( "sharedHooks/useDeviceOrientation", ( ) => ( {
  __esModule: true,
  default: jest.fn( () => ( DEVICE_ORIENTATION_PHONE_PORTRAIT ) )
} ) );

describe( "MyObservations", () => {
  beforeAll( async () => {
    jest.useFakeTimers( );
  } );

  it( "renders an observation", async () => {
    renderComponent(
      <MyObservations
        layout="list"
        observations={mockObservations}
        onEndReached={jest.fn( )}
        toggleLayout={jest.fn( )}
        setShowLoginSheet={jest.fn( )}
        uploadState={INITIAL_STATE}
      />
    );
    const obs = mockObservations[0];

    const list = await screen.findByTestId( "MyObservationsAnimatedList" );
    // Test that there isn't other data lingering
    expect( list.props.data.length ).toEqual( mockObservations.length );
    // Test that a card got rendered for the our test obs
    const card = await screen.findByTestId( `MyObservations.obsListItem.${obs.uuid}` );
    expect( card ).toBeTruthy();
  } );

  it( "renders multiple observations", async () => {
    renderComponent(
      <MyObservations
        layout="list"
        observations={mockObservations}
        onEndReached={jest.fn( )}
        toggleLayout={jest.fn( )}
        uploadStatus={{}}
        setShowLoginSheet={jest.fn( )}
        uploadState={INITIAL_STATE}
      />
    );
    // Awaiting the first observation because using await in the forEach errors out
    const firstObs = mockObservations[0];
    await screen.findByTestId( `MyObservations.obsListItem.${firstObs.uuid}` );
    mockObservations.forEach( obs => {
      expect(
        screen.getByTestId( `MyObservations.obsListItem.${obs.uuid}` )
      ).toBeTruthy();
    } );
    // TODO: some things are still happening in the background so I unmount here,
    // better probably to mock away those things happening in the background for this test
    screen.unmount();
  } );

  it( "render grid view", ( ) => {
    renderComponent(
      <MyObservations
        layout="grid"
        observations={mockObservations}
        onEndReached={jest.fn( )}
        toggleLayout={jest.fn( )}
        setShowLoginSheet={jest.fn( )}
        uploadState={INITIAL_STATE}
      />
    );
    mockObservations.forEach( obs => {
      expect( screen.getByTestId( `MyObservations.gridItem.${obs.uuid}` ) ).toBeTruthy();
    } );
  } );

  describe( "grid view", ( ) => {
    const component = (
      <MyObservations
        layout="grid"
        observations={mockObservations}
        onEndReached={jest.fn( )}
        toggleLayout={jest.fn( )}
        setShowLoginSheet={jest.fn( )}
        uploadState={INITIAL_STATE}
      />
    );
    describe( "portrait orientation", ( ) => {
      describe( "on a phone", ( ) => {
        it( "should have 2 columns", async ( ) => {
          renderComponent( component );
          const list = screen.getByTestId( "MyObservationsAnimatedList" );
          expect( list.props.numColumns ).toEqual( 2 );
        } );
      } );
      describe( "on a tablet", ( ) => {
        beforeEach( ( ) => {
          DeviceInfo.isTablet.mockReturnValue( true );
        } );
        it( "should have 4 columns", async ( ) => {
          useDeviceOrientation.mockImplementation( ( ) => DEVICE_ORIENTATION_TABLET_PORTRAIT );
          renderComponent( component );
          const list = screen.getByTestId( "MyObservationsAnimatedList" );
          expect( list.props.numColumns ).toEqual( 4 );
        } );
      } );
    } );
    describe( "landscape orientation", ( ) => {
      describe( "on a phone", ( ) => {
        it( "should have 2 columns", async ( ) => {
          useDeviceOrientation.mockImplementation( ( ) => DEVICE_ORIENTATION_PHONE_LANDSCAPE );
          renderComponent( component );
          const list = screen.getByTestId( "MyObservationsAnimatedList" );
          expect( list.props.numColumns ).toEqual( 2 );
        } );
      } );
      describe( "on a tablet", ( ) => {
        beforeEach( ( ) => {
          DeviceInfo.isTablet.mockReturnValue( true );
        } );
        it( "should have 6 columns", async ( ) => {
          useDeviceOrientation.mockImplementation( ( ) => DEVICE_ORIENTATION_TABLET_LANDSCAPE );
          renderComponent( component );
          const list = screen.getByTestId( "MyObservationsAnimatedList" );
          expect( list.props.numColumns ).toEqual( 6 );
        } );
      } );
    } );
  } );
} );
