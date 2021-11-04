import React from "react";
import AccessibilityEngine from "react-native-accessibility-engine";

import UserProfile from "../UserProfile";

test( "should not have accessibility errors", ( ) => {
  // need to mock inatjs fetch
  // right now this throws Cannot read property 'then' of undefined error
  // because promise / results from iNatAPI are undefined
  const userProfile = <UserProfile />;
  expect( ( ) => AccessibilityEngine.check( userProfile ) ).not.toThrow();
} );
