import { screen, waitFor } from "@testing-library/react-native";
import Announcements, {
  handleShouldStartLoadWithRequest,
} from "components/MyObservations/Announcements";
import inaturalistjs from "inaturalistjs";
import React from "react";
import { Linking } from "react-native";
import { renderComponent } from "tests/helpers/render";

const mockAnnouncement = {
  id: 1,
  body: "<p>This is a mobile announcement</p>",
  dismissible: false,
  start: "1971-01-01T00:00:00.000Z",
  end: "3021-01-31T00:00:00.000Z",
  placement: "mobile/home",
};

const mockDismissibleAnnouncement = {
  id: 2,
  body: "<p>This is a dismissible announcement</p>",
  dismissible: true,
  start: "1971-01-02T00:00:00.000Z",
  end: "3021-01-31T00:00:00.000Z",
  placement: "mobile/home",
};

jest.mock( "inaturalistjs", () => ( {
  __esModule: true,
  default: {
    announcements: {
      search: jest.fn( () => Promise.resolve( {} ) ),
      dismiss: jest.fn( () => Promise.resolve( {} ) ),
    },
  },
} ) );

const mockUser = {
  id: 1,
  login: "user",
  locale: "en",
};

const wrappedAnnouncementHtml = body => `
  <html>
    <body style="margin: 0; padding: 0;">
      ${body}
    </body>
  </html>
`;

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => mockUser,
} ) );

const containerID = "announcements-container";

beforeAll( ( ) => {
  jest.useFakeTimers( );
} );

describe( "Announcements", () => {
  beforeEach( ( ) => {
    inaturalistjs.announcements.search.mockReturnValue( Promise.resolve( {
      total_results: 0,
      results: [],
    } ) );
  } );

  test( "should call inaturalistjs with locale as param", async () => {
    renderComponent( <Announcements isConnected /> );
    await waitFor( () => expect( inaturalistjs.announcements.search ).toHaveBeenCalledWith(
      expect.objectContaining( { locale: "en" } ),
      expect.anything(),
    ) );
  } );

  test( "should not render without announcements", async () => {
    renderComponent( <Announcements isConnected /> );

    await waitFor( () => expect( inaturalistjs.announcements.search ).toHaveBeenCalled() );

    const container = screen.queryByTestId( containerID );
    expect( container ).toBeNull();
  } );

  describe( "with announcement", () => {
    beforeEach( ( ) => {
      inaturalistjs.announcements.search.mockReturnValue( Promise.resolve( {
        total_results: 1,
        results: [mockAnnouncement],
      } ) );
    } );

    test( "should render correctly", async () => {
      renderComponent( <Announcements isConnected /> );

      await waitFor( () => expect( inaturalistjs.announcements.search ).toHaveBeenCalled() );

      const container = await screen.findByTestId( containerID );
      expect( container ).toBeTruthy();
    } );

    test( "should show body text", async () => {
      renderComponent( <Announcements isConnected /> );

      await waitFor( () => expect( inaturalistjs.announcements.search ).toHaveBeenCalled() );

      const webview = await screen.findByTestId( "announcements-webview" );
      expect( webview ).toBeTruthy();
      expect( webview.props.source ).toStrictEqual( {
        html: wrappedAnnouncementHtml( mockAnnouncement.body ),
      } );
    } );

    test( "should wire navigation interception onto the webview", async () => {
      renderComponent( <Announcements isConnected /> );

      await waitFor( () => expect( inaturalistjs.announcements.search ).toHaveBeenCalled() );

      const webview = await screen.findByTestId( "announcements-webview" );
      expect( webview.props.onShouldStartLoadWithRequest ).toBe(
        handleShouldStartLoadWithRequest,
      );
      expect( webview.props.setSupportMultipleWindows ).toBe( false );
    } );

    test( "should not show dismiss button", async () => {
      renderComponent( <Announcements isConnected /> );

      await waitFor( () => expect( inaturalistjs.announcements.search ).toHaveBeenCalled() );

      const button = screen.queryByLabelText( "Dismiss announcement" );
      expect( button ).toBeNull();
    } );
  } );

  describe( "with dismissible announcement", () => {
    beforeEach( ( ) => {
      inaturalistjs.announcements.search.mockReturnValue( Promise.resolve( {
        total_results: 1,
        results: [mockDismissibleAnnouncement],
      } ) );
    } );

    test( "should show dismiss button", async () => {
      renderComponent( <Announcements isConnected /> );

      await waitFor( () => expect( inaturalistjs.announcements.search ).toHaveBeenCalled() );

      const button = await screen.findByLabelText( "Dismiss announcement" );
      expect( button ).toBeTruthy();
    } );
  } );

  describe( "with multiple announcements", () => {
    beforeEach( ( ) => {
      inaturalistjs.announcements.search.mockReturnValue( Promise.resolve( {
        total_results: 2,
        // Oldest last here
        results: [mockDismissibleAnnouncement, mockAnnouncement],
      } ) );
    } );

    test( "show announcement with oldest start date", async () => {
      renderComponent( <Announcements isConnected /> );

      await waitFor( () => expect( inaturalistjs.announcements.search ).toHaveBeenCalled() );

      // Test for oldest announcement
      const webview = await screen.findByTestId( "announcements-webview" );
      expect( webview ).toBeTruthy();
      expect( webview.props.source ).toStrictEqual( {
        html: wrappedAnnouncementHtml( mockAnnouncement.body ),
      } );
    } );
  } );

  describe( "handleShouldStartLoadWithRequest", ( ) => {
    beforeEach( ( ) => {
      Linking.openURL.mockImplementation( jest.fn( _url => Promise.resolve() ) );
    } );

    afterEach( ( ) => Linking.openURL.mockReset( ) );

    it( "allows the initial inline-HTML load (empty url)", ( ) => {
      expect( handleShouldStartLoadWithRequest( { url: "" } ) ).toBe( true );
      expect( Linking.openURL ).not.toHaveBeenCalled();
    } );

    it( "allows about:blank", ( ) => {
      expect( handleShouldStartLoadWithRequest( { url: "about:blank" } ) ).toBe( true );
      expect( Linking.openURL ).not.toHaveBeenCalled();
    } );

    it( "allows data: URLs", ( ) => {
      expect(
        handleShouldStartLoadWithRequest( { url: "data:text/html;base64,PGgxPmhpPC9oMT4=" } ),
      ).toBe( true );
      expect( Linking.openURL ).not.toHaveBeenCalled();
    } );

    it( "blocks http(s) navigations and opens them externally", ( ) => {
      const url = "https://www.inaturalist.org/observations";
      expect( handleShouldStartLoadWithRequest( { url } ) ).toBe( false );
      expect( Linking.openURL ).toHaveBeenCalledWith( url );
    } );

    it( "blocks non-click JS-driven navigations the same way", ( ) => {
      // Simulates a window.location.href / form submit / window.open path
      // where navigationType is not "click".
      const url = "https://example.com/page";
      expect(
        handleShouldStartLoadWithRequest( { url, navigationType: "other" } ),
      ).toBe( false );
      expect( Linking.openURL ).toHaveBeenCalledWith( url );
    } );
  } );
} );
