// import { useRoute } from "@react-navigation/native";
// import { render } from "@testing-library/react-native";
import { onShouldStartLoadWithRequest } from "components/FullPageWebView/FullPageWebView.tsx";
// import React from "react";
import { Linking } from "react-native";

describe( "FullPageWebView", ( ) => {
  describe( "onShouldStartLoadWithRequest", ( ) => {
    it( "should approve a request for the source url", ( ) => {
      const url = "https://www.inaturalist.org";
      const request = { url };
      const source = { uri: url };
      const routeParams = { initialUrl: url };
      expect( onShouldStartLoadWithRequest( request, source, routeParams ) ).toBeTruthy();
    } );
    it( "should approve a request for an anchor on the source url", ( ) => {
      const url = "https://www.inaturalist.org";
      const request = { url: `${url}#something` };
      const source = { uri: url };
      const routeParams = { initialUrl: url };
      expect( onShouldStartLoadWithRequest( request, source, routeParams ) ).toBeTruthy();
    } );
    describe( "external browser", ( ) => {
      beforeEach( ( ) => {
        Linking.openURL.mockImplementation( jest.fn( _url => Promise.resolve() ) );
      } );
      afterEach( ( ) => Linking.openURL.mockReset( ) );
      it( "should try to open if requested", ( ) => {
        const url = "https://www.inaturalist.org";
        const request = { url: "https://www.ebird.org" };
        const source = { uri: url };
        const routeParams = { initialUrl: url, openLinksInBrowser: true };
        expect( onShouldStartLoadWithRequest( request, source, routeParams ) ).toBeFalsy();
        expect( Linking.openURL ).toHaveBeenCalledWith( request.url );
      } );
      it( "should not try to open if not requested", ( ) => {
        const url = "https://www.inaturalist.org";
        const request = { url: "https://www.ebird.org" };
        const source = { uri: url };
        const routeParams = { initialUrl: url };
        expect( onShouldStartLoadWithRequest( request, source, routeParams ) ).toBeTruthy();
        expect( Linking.openURL ).not.toHaveBeenCalled( );
      } );
    } );
  } );
} );
