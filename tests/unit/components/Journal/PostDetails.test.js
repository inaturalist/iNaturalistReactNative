import { useNetInfo } from "@react-native-community/netinfo";
import { screen } from "@testing-library/react-native";
import PostDetails from "components/Journal/PostDetails";
import i18next from "i18next";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockPost = factory( "RemotePost", {
  body: "<p>Many birds are on the move.</p>",
  published_at: "2024-03-15T00:00:00.000Z",
} );

const mockUseAuthenticatedQuery = jest.fn( );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: () => ( {
      params: {
        id: mockPost.id,
      },
    } ),
  };
} );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ...args ) => mockUseAuthenticatedQuery( ...args ),
} ) );

describe( "PostDetails", ( ) => {
  beforeEach( ( ) => {
    useNetInfo.mockReturnValue( { isConnected: true } );
    mockUseAuthenticatedQuery.mockReturnValue( {
      data: mockPost,
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    } );
  } );

  it( "displays the post title and published date from fetch", ( ) => {
    renderComponent( <PostDetails /> );

    expect( screen.getByText( mockPost.title ) ).toBeVisible( );
    expect( screen.getByText( "Mar 15, 2024" ) ).toBeVisible( );
  } );

  it( "displays the post body from fetch", ( ) => {
    renderComponent( <PostDetails /> );

    expect( screen.getByText( "Many birds are on the move." ) ).toBeVisible( );
  } );

  it( "shows loading while the post is pending", ( ) => {
    mockUseAuthenticatedQuery.mockReturnValue( {
      data: undefined,
      isError: false,
      isLoading: true,
      refetch: jest.fn(),
    } );

    renderComponent( <PostDetails /> );

    expect( screen.getByTestId( "PostDetails.loading" ) ).toBeVisible( );
  } );

  it( "shows offline notice instead of loading when the device is offline", ( ) => {
    useNetInfo.mockReturnValue( { isConnected: false } );
    mockUseAuthenticatedQuery.mockReturnValue( {
      data: undefined,
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    } );

    renderComponent( <PostDetails /> );

    expect( screen.queryByTestId( "PostDetails.loading" ) ).toBeNull();
    expect( screen.getByTestId( "PostDetails.offline" ) ).toBeVisible();
    expect(
      screen.getByText( i18next.t( "You-are-offline-Tap-to-try-again" ) ),
    ).toBeVisible();
  } );

  it( "shows an error message when fetch fails", ( ) => {
    mockUseAuthenticatedQuery.mockReturnValue( {
      data: undefined,
      isError: true,
      isLoading: false,
      refetch: jest.fn(),
    } );

    renderComponent( <PostDetails /> );

    expect( screen.getByTestId( "PostDetails.error" ) ).toBeVisible( );
    expect( screen.getByText( "Something went wrong." ) ).toBeVisible( );
  } );

  it( "shows an error when the response has no post", ( ) => {
    mockUseAuthenticatedQuery.mockReturnValue( {
      data: null,
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    } );

    renderComponent( <PostDetails /> );

    expect( screen.getByTestId( "PostDetails.error" ) ).toBeVisible( );
  } );
} );
