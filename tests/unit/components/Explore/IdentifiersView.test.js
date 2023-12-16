import { screen } from "@testing-library/react-native";
import ExploreFlashList from "components/Explore/ExploreFlashList";
import initI18next from "i18n/initI18next";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockIdentifiers = [factory( "RemoteUser" ), factory( "RemoteUser" )];

jest.mock( "sharedHooks/useInfiniteScroll", () => ( {
  __esModule: true,
  default: () => ( {
    data: mockIdentifiers,
    isFetchingNextPage: true
  } )
} ) );

describe( "IdentifiersView", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "should show a footer loading wheel when new identifiers are fetched", ( ) => {
    renderComponent(
      <ExploreFlashList
        hideLoadingWheel={false}
        isOnline
      />
    );

    const loadingWheel = screen.getByTestId( "InfiniteScrollLoadingWheel.loading" );
    expect( loadingWheel ).toBeVisible( );
  } );

  it( "should show no internet text when user is offline", ( ) => {
    renderComponent(
      <ExploreFlashList
        hideLoadingWheel={false}
        isOnline={false}
      />
    );

    const noInternet = screen.getByText( /An Internet connection is required/ );
    expect( noInternet ).toBeVisible( );
  } );

  it( "should show a footer view when loading wheel is hidden", ( ) => {
    renderComponent(
      <ExploreFlashList
        hideLoadingWheel
        isOnline
      />
    );

    const footerView = screen.getByTestId( "InfiniteScrollLoadingWheel.footerView" );
    expect( footerView ).toBeVisible( );
  } );

  it( "should show loading wheel before initial data loads", ( ) => {
    renderComponent(
      <ExploreFlashList
        hideLoadingWheel
        isOnline
        data={[]}
        status="loading"
      />
    );

    const initialLoading = screen.getByTestId( "ExploreFlashList.loading" );
    expect( initialLoading ).toBeVisible( );
  } );

  it( "should show no results text when no data is found", ( ) => {
    renderComponent(
      <ExploreFlashList
        hideLoadingWheel
        isOnline
        data={[]}
      />
    );

    const noResultsText = screen.getByText( /No results found/ );
    expect( noResultsText ).toBeVisible( );
  } );
} );
