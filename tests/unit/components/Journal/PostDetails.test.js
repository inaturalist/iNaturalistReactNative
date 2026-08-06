import { screen } from "@testing-library/react-native";
import PostDetails from "components/Journal/PostDetails";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockPost = factory( "RemotePost", {
  body: "<p>Many birds are on the move.</p>",
} );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: () => ( {
      params: {
        body: mockPost.body,
        published_at: mockPost.published_at,
        title: mockPost.title,
      },
    } ),
  };
} );

describe( "PostDetails", ( ) => {
  it( "displays the post body", ( ) => {
    renderComponent( <PostDetails /> );

    expect( screen.getByText( "Many birds are on the move." ) ).toBeVisible( );
  } );
} );
