import { render, screen } from "@testing-library/react-native";
import PermissionGate from "components/SharedComponents/PermissionGate";
import React from "react";
import { RESULTS } from "react-native-permissions";

describe( "PermissionGate", ( ) => {
  it( "should show the GRANT PERMISSION button when permission unknown", ( ) => {
    render(
      <PermissionGate
        requestPermission={jest.fn( )}
        grantStatus={null}
        onClose={jest.fn( )}
      />
    );
    expect( screen.getByText( "GRANT PERMISSION" ) ).toBeTruthy( );
  } );

  it( "should show the GRANT PERMISSION button when permission blocked", ( ) => {
    render(
      <PermissionGate
        requestPermission={jest.fn( )}
        grantStatus={RESULTS.DENIED}
        onClose={jest.fn( )}
      />
    );
    expect( screen.getByText( "GRANT PERMISSION" ) ).toBeTruthy( );
  } );

  it( "should show the OPEN SETTINGS button when permission blocked", ( ) => {
    render(
      <PermissionGate
        requestPermission={jest.fn( )}
        grantStatus={RESULTS.BLOCKED}
        onClose={jest.fn( )}
      />
    );
    expect( screen.getByText( "OPEN SETTINGS" ) ).toBeTruthy( );
  } );

  it( "should show the blockedPrompt when permission blocked", ( ) => {
    render(
      <PermissionGate
        requestPermission={jest.fn( )}
        grantStatus={RESULTS.BLOCKED}
        onClose={jest.fn( )}
      />
    );
    expect( screen.getByText( /You’ve denied permission/ ) ).toBeTruthy( );
  } );

  it( "should be accessible", ( ) => {
    // Disabled during the update to RN 0.78
    // expect(
    //   <PermissionGate
    //     requestPermission={jest.fn( )}
    //     grantStatus={null}
    //     onClose={jest.fn( )}
    //   />
    // ).toBeAccessible( );
  } );
} );
