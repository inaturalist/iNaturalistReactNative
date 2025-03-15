import { fireEvent, render, screen } from "@testing-library/react-native";
import TaxonNamesSetting from "components/Settings/TaxonNamesSetting.tsx";
import React from "react";
import factory from "tests/factory";
import faker from "tests/helpers/faker";

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  iconUrl: faker.image.url( ),
  locale: "en",
  prefers_common_names: true,
  prefers_scientific_name_first: false
} );

// Simplified mocks
jest.mock( "providers/contexts.ts", () => ( {
  RealmContext: {
    useRealm: () => ( {} )
  }
} ) );

jest.mock( "sharedHooks", () => ( {
  useTranslation: () => ( { t: key => key } ),
  useLayoutPrefs: () => ( { isDefaultMode: false } ),
  useCurrentUser: () => mockUser
} ) );

jest.mock( "sharedHelpers/safeRealmWrite", () => jest.fn( ( _, callback ) => callback() ) );

describe( "TaxonNamesSetting", () => {
  test( "toggles between the three name display options correctly", () => {
    const mockOnChange = jest.fn();

    // Render with default (Common Name First)
    render( <TaxonNamesSetting onChange={mockOnChange} /> );

    // Verify initial state (Common Name First)
    expect( mockUser.prefers_common_names ).toBe( true );
    expect( mockUser.prefers_scientific_name_first ).toBe( false );

    // Select Scientific Name First
    fireEvent.press( screen.getByText( "Scientific-Name-Common-Name" ) );

    // Verify Scientific Name First is selected
    expect( mockUser.prefers_common_names ).toBe( true );
    expect( mockUser.prefers_scientific_name_first ).toBe( true );
    expect( mockOnChange ).toHaveBeenCalledWith( {
      prefers_common_names: true,
      prefers_scientific_name_first: true
    } );

    // Select Scientific Name Only
    fireEvent.press( screen.getByText( "Scientific-Name" ) );

    // Verify Scientific Name Only is selected
    expect( mockUser.prefers_common_names ).toBe( false );
    expect( mockUser.prefers_scientific_name_first ).toBe( false );
    expect( mockOnChange ).toHaveBeenCalledWith( {
      prefers_common_names: false,
      prefers_scientific_name_first: false
    } );

    // Back to Common Name First
    fireEvent.press( screen.getByText( "Common-Name-Scientific-Name" ) );

    // Verify Common Name First is selected again
    expect( mockUser.prefers_common_names ).toBe( true );
    expect( mockUser.prefers_scientific_name_first ).toBe( false );
    expect( mockOnChange ).toHaveBeenCalledWith( {
      prefers_common_names: true,
      prefers_scientific_name_first: false
    } );
  } );
} );
