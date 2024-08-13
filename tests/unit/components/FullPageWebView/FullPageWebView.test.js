// import { useRoute } from "@react-navigation/native";
// import { render } from "@testing-library/react-native";
import {
  ALLOWED_DOMAINS,
  onShouldStartLoadWithRequest
} from "components/FullPageWebView/FullPageWebView.tsx";
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
      it( "should try to open for any domain not on the allowlist", ( ) => {
        const url = "https://www.inaturalist.org";
        const request = { url: "https://www.ebird.org" };
        expect( ALLOWED_DOMAINS ).not.toContain( "ebird.org" );
        const source = { uri: url };
        const routeParams = { initialUrl: url };
        expect( onShouldStartLoadWithRequest( request, source, routeParams ) ).toBeFalsy();
        expect( Linking.openURL ).toHaveBeenCalledWith( request.url );
      } );
      it( "should not try to open for any domain on the allowlist if requested", ( ) => {
        const url = "https://www.inaturalist.org";
        const request = { url: "https://www.inaturalist.org/users/edit" };
        expect( ALLOWED_DOMAINS ).toContain( "inaturalist.org" );
        const source = { uri: url };
        const routeParams = { initialUrl: url, handleLinksForAllowedDomains: true };
        expect( onShouldStartLoadWithRequest( request, source, routeParams ) ).toBeTruthy();
        expect( Linking.openURL ).not.toHaveBeenCalled( );
      } );
      it( "should try to open for any domain on the allowlist for clicks", ( ) => {
        const url = "https://www.inaturalist.org";
        const request = { url: "https://www.inaturalist.org/users/edit", navigationType: "click" };
        const source = { uri: url };
        const routeParams = { initialUrl: url };
        expect( onShouldStartLoadWithRequest( request, source, routeParams ) ).toBeFalsy();
        expect( Linking.openURL ).toHaveBeenCalledWith( request.url );
      } );
    } );
  } );
} );
