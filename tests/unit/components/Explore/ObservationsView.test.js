import { screen } from "@testing-library/react-native";
import ObservationsFlashList from "components/ObservationsFlashList/ObservationsFlashList";
import React from "react";
import { renderComponent } from "tests/helpers/render";

const mockOnEndReached = jest.fn( );

jest.mock( "sharedHooks/useInfiniteObservationsScroll", () => ( {
  __esModule: true,
  default: () => ( {
    data: [],
    isFetchingNextPage: true,
    fetchNextPage: mockOnEndReached,
  } ),
} ) );

describe( "ObservationsView", () => {
  it( "should show a footer loading wheel when new observations are fetched", ( ) => {
    renderComponent(
      <ObservationsFlashList
        hideLoadingWheel={false}
        isConnected
      />,
    );

    const loadingWheel = screen.getByTestId( "InfiniteScrollLoadingWheel.loading" );
    expect( loadingWheel ).toBeVisible( );
  } );

  it( "should show no internet text when user is offline", ( ) => {
    renderComponent(
      <ObservationsFlashList
        hideLoadingWheel={false}
        isConnected={false}
      />,
    );

    const noInternet = screen.getByText( /An Internet connection is required/ );
    expect( noInternet ).toBeVisible( );
  } );

  it( "should show a footer view when loading wheel is hidden", ( ) => {
    renderComponent(
      <ObservationsFlashList
        hideLoadingWheel
        isConnected
      />,
    );

    const footerView = screen.getByTestId( "InfiniteScrollLoadingWheel.footerView" );
    expect( footerView ).toBeVisible( );
  } );

  it( "should show loading wheel before initial data loads", ( ) => {
    renderComponent(
      <ObservationsFlashList
        dataCanBeFetched
        hideLoadingWheel
        isConnected
        data={[]}
        status="loading"
      />,
    );

    const initialLoading = screen.getByTestId( "ObservationsFlashList.loading" );
    expect( initialLoading ).toBeVisible( );
  } );

  it( "should show no results text when no data is found", ( ) => {
    renderComponent(
      <ObservationsFlashList
        hideLoadingWheel
        isConnected
        data={[]}
        showNoResults
      />,
    );

    const noResultsText = screen.getByText( /No results found/ );
    expect( noResultsText ).toBeVisible( );
  } );
} );
