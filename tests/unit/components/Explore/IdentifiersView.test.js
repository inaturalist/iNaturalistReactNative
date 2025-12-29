import { screen } from "@testing-library/react-native";
import ExploreFlashList from "components/Explore/ExploreFlashList";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockIdentifiers = [{
  ...factory( "RemoteUser" ),
  count: 3,
}, {
  ...factory( "RemoteUser" ),
  count: 1,
}];

jest.mock( "sharedHooks/useInfiniteScroll", () => ( {
  __esModule: true,
  default: () => ( {
    data: mockIdentifiers,
    isFetchingNextPage: true,
  } ),
} ) );

describe( "IdentifiersView", () => {
  it( "should show a footer loading wheel when new identifiers are fetched", ( ) => {
    renderComponent(
      <ExploreFlashList
        hideLoadingWheel={false}
        isConnected
      />,
    );

    const loadingWheel = screen.getByTestId( "InfiniteScrollLoadingWheel.loading" );
    expect( loadingWheel ).toBeVisible( );
  } );

  it( "should show no internet text when user is offline", ( ) => {
    renderComponent(
      <ExploreFlashList
        hideLoadingWheel={false}
        isConnected={false}
      />,
    );

    const noInternet = screen.getByText( /An Internet connection is required/ );
    expect( noInternet ).toBeVisible( );
  } );

  it( "should show a footer view when loading wheel is hidden", ( ) => {
    renderComponent(
      <ExploreFlashList
        hideLoadingWheel
        isConnected
      />,
    );

    const footerView = screen.getByTestId( "InfiniteScrollLoadingWheel.footerView" );
    expect( footerView ).toBeVisible( );
  } );

  it( "should show loading wheel before initial data loads", ( ) => {
    renderComponent(
      <ExploreFlashList
        hideLoadingWheel
        isConnected
        data={[]}
        canFetch
      />,
    );

    const initialLoading = screen.getByTestId( "ExploreFlashList.loading" );
    expect( initialLoading ).toBeVisible( );
  } );

  it( "should show no results text when no data is found", ( ) => {
    renderComponent(
      <ExploreFlashList
        hideLoadingWheel
        isConnected
        data={[]}
      />,
    );

    const noResultsText = screen.getByText( /No results found/ );
    expect( noResultsText ).toBeVisible( );
  } );

  it( "should show number of identifications a user has", async ( ) => {
    renderComponent(
      <ExploreFlashList
        hideLoadingWheel
        isConnected
        data={mockIdentifiers}
        layout="user"
      />,
    );

    const identificationCount = await screen.findByText( "3 Identifications" );
    expect( identificationCount ).toBeVisible( );
  } );
} );
