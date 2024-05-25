// ComponentUnderTest.perf-test.tsx
import MyObservations from "components/MyObservations/MyObservations";
import React from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { measurePerformance } from "reassure";
import factory from "tests/factory";
import faker from "tests/helpers/faker";

jest.setTimeout( 60_000 );

const mockUser = factory( "LocalUser" );

const mockObservations = [
  factory( "LocalObservation", {
    _synced_at: null,
    observationPhotos: [
      factory( "LocalObservationPhoto", {
        photo: {
          id: faker.number.int( ),
          url: faker.image.url( ),
          position: 0
        }
      } )
    ]
  } ),
  factory( "LocalObservation", {
    _synced_at: null,
    observationPhotos: [
      factory( "LocalObservationPhoto", {
        photo: {
          id: faker.number.int( ),
          url: `${faker.image.url( )}/100`,
          position: 0
        }
      } ),
      factory( "LocalObservationPhoto", {
        photo: {
          id: faker.number.int( ),
          url: `${faker.image.url( )}/200`,
          position: 1
        }
      } )
    ]
  } )
];

const mockState = {
  uploads: mockObservations,
  error: null,
  numToUpload: 3,
  totalProgressIncrements: 4,
  uploadProgress: 1
};

const mockOnEndReached = jest.fn( );

jest.mock( "sharedHooks/useInfiniteObservationsScroll", () => ( {
  __esModule: true,
  default: () => ( {
    data: mockObservations,
    isFetchingNextPage: false,
    fetchNextPage: mockOnEndReached
  } )
} ) );

jest.mock( "sharedHooks/useObservationsUpdates", () => ( {
  __esModule: true,
  default: jest.fn( () => ( {
    refetch: jest.fn()
  } ) )
} ) );

describe( "MyObservations Performance", ( ) => {
  test( "Test list loading time in MyObservations", async () => {
    await measurePerformance( <MyObservations
      observations={mockObservations}
      layout="list"
      toggleLayout={jest.fn( )}
      allObsToUpload={[]}
      showLoginSheet={false}
      setShowLoginSheet={jest.fn( )}
      isFetchingNextPage={false}
      onEndReached={mockOnEndReached}
      currentUser={mockUser}
      isOnline
      uploadState={mockState}
    /> );
  } );
} );
