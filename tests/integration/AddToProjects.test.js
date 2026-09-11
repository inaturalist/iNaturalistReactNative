import AddToProjects from "components/AddToProjects/AddToProjects";
import inatjs from "inaturalistjs";
import React from "react";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderAppWithComponent } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";

const mockProject = factory( "RemoteProject", {
  title: faker.lorem.sentence(),
  icon: faker.image.url(),
  header_image_url: faker.image.url(),
  description: faker.lorem.paragraph(),
  project_type: "",
  user_ids: [faker.number.int()],
} );

beforeAll( async () => {
  inatjs.users.projects.mockResolvedValue( makeResponse( [mockProject] ) );
} );

beforeEach( () => {
  setStoreStateLayout( {
    isDefaultMode: false,
  } );
  useStore.setState( {
    featureFlagConfig: {
      [FeatureFlag.TraditionalProjectsEnabled]: true,
    },
  } );
} );

describe( "AddToProjects", ( ) => {
  global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

  it( "should persist PO and OFV on save", async ( ) => {
    renderAppWithComponent( <AddToProjects /> );
  } );
} );
