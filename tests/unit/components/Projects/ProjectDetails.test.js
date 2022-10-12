import { NavigationContainer } from "@react-navigation/native";
import { render } from "@testing-library/react-native";
import ProjectDetails from "components/Projects/ProjectDetails";
import React from "react";

import factory from "../../../factory";

const mockProject = factory( "RemoteProject" );
const mockObservation = factory( "RemoteObservation" );

jest.mock( "../../../../src/components/Projects/hooks/useProjectObservations", ( ) => ( {
  __esModule: true,
  default: ( ) => [mockObservation]
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        id: mockProject.id
      }
    } )
  };
} );

const renderProjectDetails = ( ) => render(
  <NavigationContainer>
    <ProjectDetails />
  </NavigationContainer>
);

test( "displays project details", ( ) => {
  const { getByTestId, getByText } = renderProjectDetails( );

  expect( getByText( mockProject.title ) ).toBeTruthy( );
  expect( getByText( mockProject.description ) ).toBeTruthy( );
  expect(
    getByTestId( "ProjectDetails.headerImage" ).props.source
  ).toStrictEqual( { uri: mockProject.header_image_url } );
  expect(
    getByTestId( "ProjectDetails.projectIcon" ).props.source
  ).toStrictEqual( { uri: mockProject.icon } );
} );

test( "displays project observations", ( ) => {
  const { getByTestId, getByText } = renderProjectDetails( );

  expect( getByText( mockObservation.taxon.preferred_common_name ) ).toBeTruthy( );
  expect( getByTestId( "ObsList.photo" ).props.source )
    .toStrictEqual( { uri: mockObservation.observation_photos[0].photo.url } );
} );
