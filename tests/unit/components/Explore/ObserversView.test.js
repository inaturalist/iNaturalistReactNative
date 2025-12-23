import { screen } from "@testing-library/react-native";
import ExploreFlashList from "components/Explore/ExploreFlashList";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockObservers = [{
  ...factory( "RemoteUser" ),
  observation_count: 7,
}, {
  ...factory( "RemoteUser" ),
  observation_count: 44,
}];

jest.mock( "sharedHooks/useInfiniteScroll", () => ( {
  __esModule: true,
  default: () => ( {
    data: mockObservers,
    isFetchingNextPage: true,
  } ),
} ) );

describe( "ObserversView", () => {
  it( "should show number of observations a user has", async ( ) => {
    renderComponent(
      <ExploreFlashList
        hideLoadingWheel
        isConnected
        data={mockObservers}
        layout="user"
      />,
    );

    const identificationCount = await screen.findByText( "7 Observations" );
    expect( identificationCount ).toBeVisible( );
  } );
} );
