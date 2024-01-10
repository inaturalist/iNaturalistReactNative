import { screen } from "@testing-library/react-native";
import ObservationsFlashList
  from "components/SharedComponents/ObservationsFlashList/ObservationsFlashList";
import initI18next from "i18n/initI18next";
import React from "react";
import { renderComponent } from "tests/helpers/render";

const mockOnEndReached = jest.fn( );

jest.mock( "sharedHooks/useInfiniteObservationsScroll", () => ( {
  __esModule: true,
  default: () => ( {
    data: [],
    isFetchingNextPage: true,
    fetchNextPage: mockOnEndReached
  } )
} ) );

describe( "ObservationsView", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "should show a footer loading wheel when new observations are fetched", ( ) => {
    renderComponent(
      <ObservationsFlashList
        hideLoadingWheel={false}
        isOnline
      />
    );

    const loadingWheel = screen.getByTestId( "InfiniteScrollLoadingWheel.loading" );
    expect( loadingWheel ).toBeVisible( );
  } );

  it( "should show no internet text when user is offline", ( ) => {
    renderComponent(
      <ObservationsFlashList
        hideLoadingWheel={false}
        isOnline={false}
      />
    );

    const noInternet = screen.getByText( /An Internet connection is required/ );
    expect( noInternet ).toBeVisible( );
  } );

  it( "should show a footer view when loading wheel is hidden", ( ) => {
    renderComponent(
      <ObservationsFlashList
        hideLoadingWheel
        isOnline
      />
    );

    const footerView = screen.getByTestId( "InfiniteScrollLoadingWheel.footerView" );
    expect( footerView ).toBeVisible( );
  } );

  it( "should show loading wheel before initial data loads", ( ) => {
    renderComponent(
      <ObservationsFlashList
        dataCanBeFetched
        hideLoadingWheel
        isOnline
        data={[]}
        status="loading"
      />
    );

    const initialLoading = screen.getByTestId( "ObservationsFlashList.loading" );
    expect( initialLoading ).toBeVisible( );
  } );

  it( "should show no results text when no data is found", ( ) => {
    renderComponent(
      <ObservationsFlashList
        hideLoadingWheel
        isOnline
        data={[]}
      />
    );

    const noResultsText = screen.getByText( /No results found/ );
    expect( noResultsText ).toBeVisible( );
  } );
} );
