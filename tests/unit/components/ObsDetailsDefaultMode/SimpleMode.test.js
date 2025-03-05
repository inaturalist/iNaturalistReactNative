// Unit test for simple mode
import { screen } from "@testing-library/react-native";
import ObsDetailsDefaultMode from "components/ObsDetailsDefaultMode/ObsDetailsDefaultMode";
import React from "react";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

// Mock observation with a user and synced
const mockSyncedObservation = factory( "LocalObservation", {
  _created_at: faker.date.past(),
  _synced_at: faker.date.past(),
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  user: factory( "LocalUser", {
    login: faker.internet.userName(),
    iconUrl: faker.image.url(),
    id: "1234"
  } ),
  observationPhotos: [
    factory( "LocalObservationPhoto", {
      photo: {
        id: faker.number.int(),
        attribution: faker.lorem.sentence(),
        licenseCode: "cc-by-nc",
        url: faker.image.url()
      }
    } )
  ],
  taxon: factory( "LocalTaxon", {
    name: faker.person.firstName(),
    rank: "species",
    rank_level: 10,
    preferred_common_name: faker.person.fullName(),
    defaultPhoto: {
      id: faker.number.int(),
      attribution: faker.lorem.sentence(),
      licenseCode: "cc-by-nc",
      url: faker.image.url()
    }
  } )
} );

// Mock unsynchronized observation with a user
const mockUnsyncedObservation = factory( "LocalObservation", {
  _created_at: faker.date.past(),
  _synced_at: null,
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  user: factory( "LocalUser", {
    login: faker.internet.userName(),
    iconUrl: faker.image.url(),
    id: "1234"
  } ),
  observationPhotos: [
    factory( "LocalObservationPhoto", {
      photo: {
        id: faker.number.int(),
        attribution: faker.lorem.sentence(),
        licenseCode: "cc-by-nc",
        url: faker.image.url()
      }
    } )
  ],
  taxon: factory( "LocalTaxon", {
    name: faker.person.firstName(),
    rank: "species",
    rank_level: 10,
    preferred_common_name: faker.person.fullName(),
    defaultPhoto: {
      id: faker.number.int(),
      attribution: faker.lorem.sentence(),
      licenseCode: "cc-by-nc",
      url: faker.image.url()
    }
  } )
} );

// Mock observation from a different user
const mockOtherUserObservation = factory( "LocalObservation", {
  _created_at: faker.date.past(),
  _synced_at: faker.date.past(),
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  user: factory( "LocalUser", {
    login: faker.internet.userName(),
    iconUrl: faker.image.url(),
    id: "5678" // Different ID than the current user
  } ),
  observationPhotos: [
    factory( "LocalObservationPhoto", {
      photo: {
        id: faker.number.int(),
        attribution: faker.lorem.sentence(),
        licenseCode: "cc-by-nc",
        url: faker.image.url()
      }
    } )
  ],
  taxon: factory( "LocalTaxon", {
    name: faker.person.firstName(),
    rank: "species",
    rank_level: 10,
    preferred_common_name: faker.person.fullName(),
    defaultPhoto: {
      id: faker.number.int(),
      attribution: faker.lorem.sentence(),
      licenseCode: "cc-by-nc",
      url: faker.image.url()
    }
  } )
} );

// Mock current user
const mockCurrentUser = factory( "LocalUser", {
  login: faker.internet.userName(),
  iconUrl: faker.image.url(),
  id: "1234"
} );

// Mocked versions of hooks for different test scenarios
// Mock the useCurrentUser hook
// Use relative path to avoid import resolution issues
jest.mock( "../../../../src/sharedHooks/useCurrentUser.ts", () => ( {
  __esModule: true,
  default: jest.fn( () => null ) // Default to logged out
} ) );

describe( "ObsDetailsDefaultMode SimpleMode", () => {
  beforeEach( () => {
    jest.clearAllMocks();
  } );

  it( "shows all sections when user is logged in", () => {
    // Mock current user to be logged in
    const useCurrentUser = require( "sharedHooks/useCurrentUser.ts" ).default;
    useCurrentUser.mockReturnValue( mockCurrentUser );

    renderComponent(
      <ObsDetailsDefaultMode
        activityItems={[]}
        belongsToCurrentUser
        currentUser={mockCurrentUser}
        isConnected
        isSimpleMode={false}
        observation={mockSyncedObservation}
        refetchRemoteObservation={jest.fn()}
        uuid={mockSyncedObservation.uuid}
      />
    );

    // Should show ObserverDetails
    expect( screen.getByText( mockSyncedObservation.user.login ) ).toBeTruthy();

    // Should show CommunitySection
    expect( screen.getByText( "Community-Discussion" ) ).toBeTruthy();

    // Should show DetailsSection
    expect( screen.getByText( "Details" ) ).toBeTruthy();
  } );

  it( "hides sections when in simple mode (unsynced observation and user not logged in)", () => {
    // Mock current user to be logged out
    const useCurrentUser = require( "sharedHooks/useCurrentUser.ts" ).default;
    useCurrentUser.mockReturnValue( null );

    renderComponent(
      <ObsDetailsDefaultMode
        activityItems={[]}
        belongsToCurrentUser
        currentUser={null}
        isConnected
        isSimpleMode
        observation={mockUnsyncedObservation}
        refetchRemoteObservation={jest.fn()}
        uuid={mockUnsyncedObservation.uuid}
      />
    );

    // Should not show ObserverDetails
    expect( screen.queryByText( mockUnsyncedObservation.user.login ) ).toBeFalsy();

    // Should not show CommunitySection
    expect( screen.queryByText( "Community-Discussion" ) ).toBeFalsy();

    // Should not show DetailsSection
    expect( screen.queryByText( "Details" ) ).toBeFalsy();
  } );

  it( "shows all sections for other users' observations even when not logged in", () => {
    // Mock current user to be logged out
    const useCurrentUser = require( "sharedHooks/useCurrentUser.ts" ).default;
    useCurrentUser.mockReturnValue( null );

    renderComponent(
      <ObsDetailsDefaultMode
        activityItems={[]}
        belongsToCurrentUser={false}
        currentUser={null}
        isConnected
        isSimpleMode={false}
        observation={mockOtherUserObservation}
        refetchRemoteObservation={jest.fn()}
        uuid={mockOtherUserObservation.uuid}
      />
    );

    // Should show ObserverDetails
    expect( screen.getByText( mockOtherUserObservation.user.login ) ).toBeTruthy();

    // Should show CommunitySection
    expect( screen.getByText( "Community-Discussion" ) ).toBeTruthy();

    // Should show DetailsSection
    expect( screen.getByText( "Details" ) ).toBeTruthy();
  } );
} );
