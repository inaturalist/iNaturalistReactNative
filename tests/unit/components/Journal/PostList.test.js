import { screen } from "@testing-library/react-native";
import PostList from "components/Journal/PostList";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockPost = factory( "RemotePost" );
const renderPostList = ( ) => renderComponent(
  <PostList
    posts={[mockPost]}
    fetchNextPage={jest.fn( )}
    isFetchingNextPage={false}
  />,
);

describe( "PostList", ( ) => {
  it( "displays a post", async ( ) => {
    renderPostList( );

    expect( await screen.findByText( mockPost.title ) ).toBeTruthy( );
  } );
} );
