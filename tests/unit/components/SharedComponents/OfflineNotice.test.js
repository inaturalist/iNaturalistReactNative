import { fireEvent, render, screen } from "@testing-library/react-native";
import OfflineNotice from "components/SharedComponents/OfflineNotice";
import i18next from "i18next";
import React from "react";

describe( "OfflineNotice", ( ) => {
  it( "should throw without an onPress prop", ( ) => {
    expect( ( ) => render( <OfflineNotice /> ) ).toThrow( );
  } );

  it( "should be pressable", ( ) => {
    const onPress = jest.fn( );
    render( <OfflineNotice onPress={onPress} /> );
    const notice = screen.getByLabelText( i18next.t( "Internet-Connection-Required" ) );
    fireEvent.press( notice );
    expect( onPress ).toHaveBeenCalled( );
  } );
} );
