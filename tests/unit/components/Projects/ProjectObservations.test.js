import ProjectDetails from "components/Projects/ProjectDetails";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockProject = factory( "RemoteProject" );
const mockObservation = factory( "RemoteObservation" );

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

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: [mockObservation]
  } )
} ) );

test( "displays project observations", ( ) => {
  const { getByTestId, getByText } = renderComponent( <ProjectDetails /> );

  expect( getByText( mockObservation.taxon.preferred_common_name ) ).toBeTruthy( );
  expect( getByTestId( "ObsList.photo" ).props.source )
    .toStrictEqual( { uri: mockObservation.observation_photos[0].photo.url } );
} );
