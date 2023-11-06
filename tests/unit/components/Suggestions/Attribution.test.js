import { faker } from "@faker-js/faker";
import { screen, waitFor } from "@testing-library/react-native";
import Attribution from "components/Suggestions/Attribution";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import React from "react";

import factory, { makeResponse } from "../../../factory";
import { renderComponent } from "../../../helpers/render";

// Mock api call to observations
jest.mock( "inaturalistjs" );

const mockUsers = [
  factory( "RemoteObservation", {
    user: {
      login: faker.name.fullName( )
    }
  } ),
  factory( "RemoteObservation", {
    user: {
      login: faker.name.fullName( )
    }
  } )
];

const renderAttribution = ( ) => renderComponent(
  <Attribution
    taxonIds={[23456, 35235, 64672]}
  />
);

describe( "Attribution", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "should show attributions", async ( ) => {
    expect( inatjs.observations.observers ).not.toHaveBeenCalled( );
    renderAttribution( );
    expect( screen.getByTestId( "Attribution.empty" ) ).toBeVisible( );

    await waitFor( ( ) => {
      inatjs.observations.observers.mockResolvedValue( makeResponse( mockUsers ) );
      expect( inatjs.observations.observers ).toHaveBeenCalled( );
    } );
  } );
} );
