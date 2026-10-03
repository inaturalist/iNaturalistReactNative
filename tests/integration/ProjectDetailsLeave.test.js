import {
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import ProjectDetailsContainer from "components/ProjectDetails/ProjectDetailsContainer";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import React from "react";
import Project from "realmModels/Project";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderAppWithComponent } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier,
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  const { makeRealmHooks } = jest.requireActual( "tests/helpers/uniqueRealm" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      ...makeRealmHooks( __filename ),
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const realm = ( ) => global.mockRealms[__filename];

const mockUser = factory( "LocalUser", {
  login: faker.internet.username( ),
  iconUrl: faker.image.url( ),
  locale: "en",
} );

const mockRemoteProject = factory( "RemoteProject", {
  title: faker.lorem.sentence( ),
  icon: faker.image.url( ),
  header_image_url: faker.image.url( ),
  description: faker.lorem.paragraph( ),
  project_type: "",
  membership_model: "open",
  user_ids: [faker.number.int( )],
} );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    addEventListener: () => undefined,
    useNavigation: () => ( {
      navigate: jest.fn( ),
      setOptions: jest.fn( ),
      canGoBack: jest.fn( ( ) => true ),
    } ),
    useRoute: () => ( {
      params: {
        id: mockRemoteProject.id,
      },
    } ),
  };
} );

const actor = userEvent.setup( );

beforeAll( async ( ) => {
  await initI18next( );
  jest.useFakeTimers( );
  inatjs.projects.fetch.mockResolvedValue( makeResponse( [mockRemoteProject] ) );
  inatjs.projects.membership.mockResolvedValue( { total_results: 1 } );
  inatjs.projects.posts.mockResolvedValue( makeResponse( ) );
  inatjs.projects.leave.mockResolvedValue( { } );
  inatjs.observations.search.mockResolvedValue( makeResponse( ) );
  inatjs.observations.speciesCounts.mockResolvedValue( makeResponse( ) );
} );

describe( "ProjectDetails leave", ( ) => {
  beforeEach( async ( ) => {
    await signIn( mockUser, { realm: realm( ) } );
    Project.upsertRemoteProjects( [mockRemoteProject], realm( ) );
    expect(
      realm( ).objectForPrimaryKey( "Project", mockRemoteProject.id ),
    ).not.toBeNull( );
    inatjs.projects.leave.mockClear( );
  } );

  afterEach( ( ) => {
    signOut( { realm: realm( ) } );
  } );

  it( "removes the joined Project from Realm after a successful leave", async ( ) => {
    renderAppWithComponent( <ProjectDetailsContainer /> );

    expect( await screen.findByText( mockRemoteProject.title ) ).toBeVisible( );
    expect( await screen.findByText( "LEAVE" ) ).toBeVisible( );

    await actor.press( screen.getByText( "LEAVE" ) );

    const leaveSheet = await screen.findByTestId( "LeaveSheet" );
    await actor.press( within( leaveSheet ).getByText( "LEAVE" ) );

    await waitFor( ( ) => {
      expect( inatjs.projects.leave ).toHaveBeenCalledWith(
        expect.objectContaining( {
          id: mockRemoteProject.id,
          keep: "true",
        } ),
        expect.anything( ),
      );
    } );

    await waitFor( ( ) => {
      expect(
        realm( ).objectForPrimaryKey( "Project", mockRemoteProject.id ),
      ).toBeNull( );
      expect( realm( ).objects( "Project" ) ).toHaveLength( 0 );
    } );
  } );
} );
