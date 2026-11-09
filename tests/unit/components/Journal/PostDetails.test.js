import { screen } from "@testing-library/react-native";
import PostDetails from "components/Journal/PostDetails";
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
    mockUseAuthenticatedQuery.mockReturnValue( {
      data: mockPost,
      isError: false,
      isPending: false,
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
      isPending: true,
    } );

    renderComponent( <PostDetails /> );

    expect( screen.getByTestId( "PostDetails.loading" ) ).toBeVisible( );
  } );

  it( "shows an error message when fetch fails", ( ) => {
    mockUseAuthenticatedQuery.mockReturnValue( {
      data: undefined,
      isError: true,
      isPending: false,
    } );

    renderComponent( <PostDetails /> );

    expect( screen.getByTestId( "PostDetails.error" ) ).toBeVisible( );
    expect( screen.getByText( "Something went wrong." ) ).toBeVisible( );
  } );

  it( "shows an error when the response has no post", ( ) => {
    mockUseAuthenticatedQuery.mockReturnValue( {
      data: null,
      isError: false,
      isPending: false,
    } );

    renderComponent( <PostDetails /> );

    expect( screen.getByTestId( "PostDetails.error" ) ).toBeVisible( );
  } );
} );
