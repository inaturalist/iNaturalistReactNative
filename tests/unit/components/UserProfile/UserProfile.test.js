import { screen } from "@testing-library/react-native";
import UserProfile from "components/UserProfile/UserProfile";
import initI18next from "i18n/initI18next";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockUser = factory( "RemoteUser" );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockUser
  } )
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        userId: mockUser.id
      }
    } ),
    useNavigation: ( ) => ( {
      setOptions: ( ) => ( {
        headerTitle: `@${mockUser.login}`
      } )
    } )
  };
} );

jest.mock(
  "components/SharedComponents/ViewWithFooter",
  () => function MockContainer( props ) {
    const MockName = "mock-view-with-footer";
    // No testID here because the component needs the correct one to work
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MockName {...props}>{props.children}</MockName>;
  }
);

describe( "UserProfile", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "should render inside mocked container for testing", () => {
    renderComponent( <UserProfile /> );
    expect( screen.getByTestId( "UserProfile" ) ).toBeTruthy();
  } );

  test( "should not have accessibility errors", async () => {
    renderComponent( <UserProfile /> );
    const userProfile = await screen.findByTestId( "UserProfile" );
    expect( userProfile ).toBeAccessible();
  } );

  test( "renders user profile from API call", async () => {
    renderComponent( <UserProfile /> );

    expect( screen.getByTestId( `UserProfile.${mockUser.id}` ) ).toBeTruthy();
    expect( screen.getByText( `iNaturalist ${mockUser.roles[0]}` ) ).toBeTruthy();
    expect( screen.getByTestId( "UserIcon.photo" ).props.source ).toStrictEqual( {
      uri: mockUser.icon_url
    } );
  } );
} );
