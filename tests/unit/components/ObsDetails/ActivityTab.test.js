import { screen } from "@testing-library/react-native";
import ActivityTab from "components/ObsDetails/ActivityTab/ActivityTab";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  comments: [
    factory( "LocalComment" ),
    factory( "LocalComment" ),
    factory( "LocalComment" ),
  ],
  identifications: [
    factory( "LocalIdentification" ),
  ],
} );

const mockUser = factory( "LocalUser" );
jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: () => mockUser,
} ) );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: () => ( {
      params: {
        uuid: mockObservation.uuid,
      },
    } ),
    useNavigation: () => ( {
      navigate: jest.fn(),
      addListener: jest.fn(),
      setOptions: jest.fn(),
    } ),
  };
} );

jest.mock( "sharedHooks/useAuthenticatedMutation", () => ( {
  __esModule: true,
  default: () => ( {
    mutate: () => null,
  } ),
} ) );

describe( "ActivityTab", () => {
  it( "renders", async ( ) => {
    renderComponent(
      <ActivityTab
        observation={mockObservation}
        activityItems={[]}
        refetchRemoteObservation={jest.fn()}
        openAgreeWithIdSheet={jest.fn()}
      />,
    );
    expect( await screen.findByTestId( "ActivityTab" ) ).toBeTruthy( );
  } );
} );
