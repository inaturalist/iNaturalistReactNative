import { QueryClient } from "@tanstack/react-query";
import {
  adjustIconicTaxaObservationCount,
  QUERY_KEY,
} from "components/MyObservations/hooks/useIconicTaxaObservationCounts";
import { ICONIC_TAXA_GROUP } from "sharedHelpers/iconicTaxaGroupOrder";

const USER_ID = 1;

const counts = [
  { category: ICONIC_TAXA_GROUP.PLANTAE, count: 5 },
  { category: ICONIC_TAXA_GROUP.AVES, count: 1 },
];

describe( "adjustIconicTaxaObservationCount", ( ) => {
  // useAuthenticatedQuery appends its auth state to the key, so the cached entry has a longer
  // key than the one the helper is given
  const cachedKey = [QUERY_KEY, USER_ID, undefined, true];

  const queryClientWithCounts = ( ) => {
    const queryClient = new QueryClient( );
    queryClient.setQueryData( cachedKey, counts );
    return queryClient;
  };

  it( "changes only the given category's count, keeping the section order", ( ) => {
    const queryClient = queryClientWithCounts( );

    adjustIconicTaxaObservationCount( queryClient, USER_ID, ICONIC_TAXA_GROUP.PLANTAE, -1 );

    expect( queryClient.getQueryData( cachedKey ) ).toEqual( [
      { category: ICONIC_TAXA_GROUP.PLANTAE, count: 4 },
      { category: ICONIC_TAXA_GROUP.AVES, count: 1 },
    ] );
  } );

  it( "never takes a count below zero", ( ) => {
    const queryClient = queryClientWithCounts( );

    adjustIconicTaxaObservationCount( queryClient, USER_ID, ICONIC_TAXA_GROUP.AVES, -2 );

    expect( queryClient.getQueryData( cachedKey )[1] ).toEqual(
      { category: ICONIC_TAXA_GROUP.AVES, count: 0 },
    );
  } );

  it( "leaves another user's counts alone", ( ) => {
    const queryClient = queryClientWithCounts( );

    adjustIconicTaxaObservationCount( queryClient, USER_ID + 1, ICONIC_TAXA_GROUP.PLANTAE, -1 );

    expect( queryClient.getQueryData( cachedKey ) ).toEqual( counts );
  } );
} );
