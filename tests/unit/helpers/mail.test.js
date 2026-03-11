import {
  Alert, Linking, NativeModules, Platform
} from "react-native";

import { openInbox } from "../../../src/sharedHelpers/mail";

// Mock i18next t function
jest.mock( "i18next", () => ( {
  t: jest.fn( key => {
    switch ( key ) {
      case "No-email-app-installed":
        return "No email app installed";
      case "No-email-app-installed-body-check-other":
        return "Please check your device settings for other email options.";
      case "Something-went-wrong":
        return "Something went wrong";
      default:
        return key;
    }
  } )
} ) );

jest.mock( "react-native", () => ( {
  Linking: {
    canOpenURL: jest.fn(),
    openURL: jest.fn()
  },
  Alert: {
    alert: jest.fn()
  },
  Platform: {
    OS: "android"
  },
  NativeModules: {
    EmailIntentModule: {
      openEmailClient: jest.fn()
    }
  }
} ) );

describe( "openInbox", () => {
  beforeEach( () => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  } );

  it( "should call EmailIntentModule.openEmailClient on Android", async () => {
    Platform.OS = "android";
    await openInbox();
    expect( NativeModules.EmailIntentModule.openEmailClient ).toHaveBeenCalledTimes( 1 );
    expect( Linking.canOpenURL ).not.toHaveBeenCalled();
    expect( Linking.openURL ).not.toHaveBeenCalled();
  } );

  it(
    "should show an alert if EmailIntentModule.openEmailClient throws an error on Android",
    async () => {
      Platform.OS = "android";
      NativeModules.EmailIntentModule.openEmailClient.mockImplementationOnce( () => {
        throw new Error( "Test error" );
      } );
      await openInbox();
      expect( Alert.alert ).toHaveBeenCalledTimes( 1 );
      expect( Alert.alert ).toHaveBeenCalledWith(
        "No email app installed",
        "Please check your device settings for other email options."
      );
    }
  );

  it( "should call Linking.openURL on iOS if canOpenURL returns true", async () => {
    Platform.OS = "ios";
    Linking.canOpenURL.mockResolvedValue( true );
    await openInbox();
    expect( Linking.canOpenURL ).toHaveBeenCalledWith( "message:0" );
    expect( Linking.openURL ).toHaveBeenCalledWith( "message:0" );
    expect( NativeModules.EmailIntentModule.openEmailClient ).not.toHaveBeenCalled();
  } );

  it( "should show an alert on iOS if canOpenURL returns false", async () => {
    Platform.OS = "ios";
    Linking.canOpenURL.mockResolvedValue( false );
    await openInbox();
    expect( Linking.canOpenURL ).toHaveBeenCalledWith( "message:0" );
    expect( Linking.openURL ).not.toHaveBeenCalled();
    expect( Alert.alert ).toHaveBeenCalledTimes( 1 );
    expect( Alert.alert ).toHaveBeenCalledWith(
      "No email app installed",
      "Please check your device settings for other email options."
    );
  } );

  it( "should show an alert on iOS if openURL throws an error", async () => {
    Platform.OS = "ios";
    Linking.canOpenURL.mockResolvedValue( true );
    Linking.openURL.mockImplementationOnce( () => {
      throw new Error( "Test error" );
    } );
    await openInbox();
    expect( Linking.canOpenURL ).toHaveBeenCalledWith( "message:0" );
    expect( Linking.openURL ).toHaveBeenCalledWith( "message:0" );
    expect( Alert.alert ).toHaveBeenCalledTimes( 1 );
    expect( Alert.alert ).toHaveBeenCalledWith( "Something went wrong", "Test error" );
  } );
} );
