import { fireEvent, screen } from "@testing-library/react-native";
import PostListItem from "components/Journal/PostListItem";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockPost = factory( "RemotePost" );

describe( "PostListItem", ( ) => {
  it( "displays the post title", ( ) => {
    renderComponent( <PostListItem item={mockPost} onPress={jest.fn( )} /> );

    expect( screen.getByText( mockPost.title ) ).toBeTruthy( );
  } );

  it( "calls onPress with the post when pressed", ( ) => {
    const onPress = jest.fn( );
    renderComponent( <PostListItem item={mockPost} onPress={onPress} /> );

    fireEvent.press( screen.getByTestId( `PostListItem.${mockPost.id}` ) );

    expect( onPress ).toHaveBeenCalledWith( mockPost );
  } );
} );
