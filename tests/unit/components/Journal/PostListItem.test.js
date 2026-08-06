import { fireEvent, screen } from "@testing-library/react-native";
import PostListItem from "components/Journal/PostListItem";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockPost = factory( "RemotePost", {
  published_at: "2024-03-15T00:00:00.000Z",
} );

describe( "PostListItem", ( ) => {
  it( "displays the post title and published date", ( ) => {
    renderComponent( <PostListItem item={mockPost} onPress={jest.fn( )} /> );

    expect( screen.getByText( mockPost.title ) ).toBeVisible( );
    expect( screen.getByText( "Mar 15, 2024" ) ).toBeVisible( );
  } );

  it( "calls onPress with the post when pressed", ( ) => {
    const onPress = jest.fn( );
    renderComponent( <PostListItem item={mockPost} onPress={onPress} /> );

    fireEvent.press( screen.getByTestId( `PostListItem.${mockPost.id}` ) );

    expect( onPress ).toHaveBeenCalledWith( mockPost );
  } );
} );
