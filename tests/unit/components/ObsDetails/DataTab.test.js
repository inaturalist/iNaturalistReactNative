import { screen } from "@testing-library/react-native";
import DataTab from "components/ObsDetails/DataTab";
import React from "react";
import { View } from "react-native";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

jest.mock( "react-i18next", () => ( {
  useTranslation: () => ( {
    t: str => {
      if ( str === "datetime-format-short" ) {
        return "M/d/yy h:mm a";
      }
      return str;
    }
  } )
} ) );

jest.mock( "sharedHooks/useIsConnected", ( ) => ( {
  __esModule: true,
  default: ( ) => true
} ) );

// Before migrating to Jest 27 this line was:
// jest.useFakeTimers();
// TODO: replace with modern usage of jest.useFakeTimers
jest.useFakeTimers( "legacy" );

const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30"
} );

const mockAttribution = <View testID="mock-attribution" />;
jest.mock( "components/ObsDetails/Attribution", () => ( {
  __esModule: true,
  default: () => mockAttribution
} ) );

const mockMap = <View testID="mock-map" />;
jest.mock( "components/SharedComponents/Map", () => ( {
  __esModule: true,
  default: () => mockMap
} ) );

describe( "DataTab", ( ) => {
  test( "should show description of observation", async ( ) => {
    renderComponent( <DataTab observation={mockObservation} /> );

    const description = await screen.findByText( mockObservation.description );
    expect( description ).toBeTruthy( );
  } );

  test( "should display map if user is online", ( ) => {
    renderComponent( <DataTab observation={mockObservation} /> );

    const map = screen.queryByTestId( "mock-map" );
    expect( map ).toBeTruthy( );

    const noInternet = screen.queryByRole( "image", { name: "wifi-off" } );
    expect( noInternet ).toBeNull( );
  } );
} );
