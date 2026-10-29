import { fireEvent, screen } from "@testing-library/react-native";
import StatusSection from "components/ObsDetailsDefaultMode/StatusSection/StatusSection";
import React from "react";
import * as useCurrentUser from "sharedHooks/useCurrentUser";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockNavigate = jest.fn();

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( {
      navigate: mockNavigate,
    } ),
  };
} );

jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: ( ) => null,
} ) );

const mockUser = factory( "LocalUser" );
const mockObservation = factory( "LocalObservation", { quality_grade: "needs_id" } );

describe( "StatusSection", ( ) => {
  test( "should navigate to DQA with observation UUID if current user is logged in", ( ) => {
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( ( ) => mockUser );
    renderComponent( <StatusSection observation={mockObservation} /> );
    const dqaButton = screen.getByTestId( "StatusSection.DQA" );
    expect( dqaButton ).toBeVisible( );
    fireEvent.press( dqaButton );
    expect( mockNavigate ).toHaveBeenCalledWith( "DataQualityAssessment", {
      observationUUID: mockObservation.uuid,
    } );
  } );

  test( "should not display DQA button if current user is logged out", ( ) => {
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( ( ) => null );
    renderComponent( <StatusSection observation={mockObservation} /> );
    expect( screen.queryByTestId( "StatusSection.DQA" ) ).not.toBeOnTheScreen( );
  } );
} );
