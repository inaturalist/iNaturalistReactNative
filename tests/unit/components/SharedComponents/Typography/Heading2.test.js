import { render, screen } from "@testing-library/react-native";
import { Heading2 } from "components/SharedComponents";
import React from "react";

import * as mockReactI18next from "../../../../mocks/react-i18next";

jest.mock( "react-i18next", ( ) => mockReactI18next );

const text = "Heading2";

describe( "Heading2", () => {
  it( "renders correctly", () => {
    render( <Heading2>{text}</Heading2> );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
