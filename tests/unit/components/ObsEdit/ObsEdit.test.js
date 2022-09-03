import { NavigationContainer } from "@react-navigation/native";
import {
  render, renderHook, waitFor
} from "@testing-library/react-native";
import { parse } from "date-fns";
import React, { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import usePhotoExif, {
  parseExifCoordinates,
  parseExifDateTime
} from "../../../../src/components/ObsEdit/hooks/usePhotoExif";
import ObsEdit from "../../../../src/components/ObsEdit/ObsEdit";
import { ObsEditContext } from "../../../../src/providers/contexts";
import ObsEditProvider from "../../../../src/providers/ObsEditProvider";
import factory from "../../../factory";

// Base64-encoded contents of an image file with EXIF data
// eslint-disable-next-line max-len
const TEST_IMAGE_CONTENTS_BASE64 = "/9j/4AAQSkZJRgABAQAASABIAAD/4Qe8RXhpZgAATU0AKgAAAAgACgEPAAIAAAAGAAAAhgEQAAIAAAAKAAAAjAESAAMAAAABAAEAAAEaAAUAAAABAAAAlgEbAAUAAAABAAAAngEoAAMAAAABAAIAAAExAAIAAAAHAAAApgEyAAIAAAAUAAAArodpAAQAAAABAAAAwoglAAQAAAABAAAGogAAAABBcHBsZQBpUGhvbmUgNnMAAAAASAAAAAEAAABIAAAAATExLjIuNgAAMjAxODowMzowNyAwODoxOTo0OQAAIYKaAAUAAAABAAACVIKdAAUAAAABAAACXIgiAAMAAAABAAIAAIgnAAMAAAABACAAAJAAAAcAAAAEMDIyMZADAAIAAAAUAAACZJAEAAIAAAAUAAACeJEBAAcAAAAEAQIDAJIBAAoAAAABAAACjJICAAUAAAABAAAClJIDAAoAAAABAAACnJIEAAoAAAABAAACpJIHAAMAAAABAAMAAJIJAAMAAAABABAAAJIKAAUAAAABAAACrJIUAAMAAAAEAAACtJJ8AAcAAAOcAAACvJKRAAIAAAAENzE4AJKSAAIAAAAENzE4AKAAAAcAAAAEMDEwMKABAAMAAAABAAEAAKACAAQAAAABAAAAMqADAAQAAAABAAAAMqIXAAMAAAABAAIAAKMBAAcAAAABAQAAAKQBAAMAAAABAAQAAKQCAAMAAAABAAAAAKQDAAMAAAABAAAAAKQFAAMAAAABAB0AAKQGAAMAAAABAAAAAKQyAAUAAAAEAAAGWKQzAAIAAAAGAAAGeKQ0AAIAAAAjAAAGfgAAAAAAAAABAAAAeAAAAAsAAAAFMjAxODowMzowNyAwODoxOTo0OQAyMDE4OjAzOjA3IDA4OjE5OjQ5AAAAbCEAAA+nAAAfLwAADbUAAKXxAAAYfwAAAAAAAAABAAAAUwAAABQIxgNsAvEC9EFwcGxlIGlPUwAAAU1NAA8AAQAJAAAAAQAAAAkAAgAHAAACLgAAAMgAAwAHAAAAaAAAAvYABAAJAAAAAQAAAAEABQAJAAAAAQAAAQUABgAJAAAAAQAAAQ8ABwAJAAAAAQAAAAEACAAKAAAAAwAAA14ACgAJAAAAAQAAAAQADgAJAAAAAQAAAAAAFAAJAAAAAQAAAAMAFQACAAAAJQAAA3YAFwAJAAAAAQAAAAAAGQAJAAAAAQAAAAEAHwAJAAAAAQAAAAAAAAAAYnBsaXN0MDBPEQIALwMwAyIDDwPyAscCzgKkAokChgKFAoUChgKPAosCnwIhAx8DIAPKAnQCpgEqAsEBUQJeAl8CbQJxAnUChAKfAh8DCwP+AtMCiAEOAdkAqAAyAZkB/gE5AmMCrALSAvICLAMWA/0C0QJWAroATQBNAHIAsAB8AWQB+QFpAqoCzQJfA1UDRAPhAswByABjAEUAQgBhAGoAoQAAASYChAK6AoMDewNvA1YDKQOfAYgAOQA5AD4AOACeAJoAPQKMAscChAOCA4EDfQNuA9gC0gBSADgAFAE6AJMAhABnAoYCqgKAA3wDfAN6A28DXAMpAWsAXABeAJEAlQCsAMoC3ALxAmcDXQNQA04DQAMzA4oCQgB8AGYAnwBkAFAB/gL9AgcDQAM4AzADLwMkAyEDEAOpAD4AmwCrAJ8AiAIFAwIDEgMmAxQDDwMEAwgDAgMAA18BLgBlAE0AzwHyAvoCAAMGA/AC4gLcAssCxAK1AqoC6wFCAFYAawAnAs8C4QLsAgED0AK0ArECqwKwAqcCoAJwAokASAB3ABwClgKpArgC0ALcAsUCsAKYAosCgQJ/AnwCZAFMAGUA3AFoAoECjgKbAvUC2gLJAr0CuQKlApUCewJDArwArgACAlYCXQJuAnACWwM0AxID9ALfAt8C0ALGAq8CaALaAXkCdAJwAnUCgAIACAAAAAAAAAIBAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAIMYnBsaXN0MDDUAQIDBAUGBwhVZmxhZ3NVdmFsdWVZdGltZXNjYWxlVWVwb2NoEAETAAAel8DspzYSO5rKABAACBEXHSctLzg9AAAAAAAAAQEAAAAAAAAACQAAAAAAAAAAAAAAAAAAAD///+iGAAn4Qf/9r14AAlwt//9zVwACn0Q1Q0I3NDM0Qy05RDcyLTQ1OUYtOTk3Ni0yNDFGNUEzRDJBRUYAAAAhMvUAB//xACEy9QAH//EAAAALAAAABQAAAAsAAAAFQXBwbGUAaVBob25lIDZzIGJhY2sgY2FtZXJhIDQuMTVtbSBmLzIuMgAAAA4AAQACAAAAAk4AAAAAAgAFAAAAAwAAB1AAAwACAAAAAlcAAAAABAAFAAAAAwAAB2gABQABAAAAAQAAAAAABgAFAAAAAQAAB4AADAACAAAAAksAAAAADQAFAAAAAQAAB4gAEAACAAAAAlQAAAAAEQAFAAAAAQAAB5AAFwACAAAAAlQAAAAAGAAFAAAAAQAAB5gAHQACAAAACwAAB6AAHwAFAAAAAQAAB6wAAAAAAAAAJgAAAAEAAAAEAAAAAQAAC3IAAABkAAAAegAAAAEAAAAzAAAAAQAAAZYAAABkAABuVgAAAFkAAAAAAAAAAQAAZbEAAAE1AABlsQAAATUyMDE4OjAzOjA3AAAAAAAFAAAAAf/tAHhQaG90b3Nob3AgMy4wADhCSU0EBAAAAAAAPxwBWgADGyVHHAIAAAIAAhwCPwAGMDgxOTQ5HAI+AAgyMDE4MDMwNxwCNwAIMjAxODAzMDccAjwABjA4MTk0OQA4QklNBCUAAAAAABAft+XhWh0wml1yIx11fVAX/8AAEQgAMgAyAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwQCAwMEBQQEBAQFBgUFBQUFBgcGBgYGBgYHBwcHBwcHBwkJCQkJCQoKCgoKDAwMDAwMDAwMDP/bAEMBAgICAwMDBQMDBQwIBwgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/dAAQABP/aAAwDAQACEQMRAD8A/ZnxPcZuZh12SGsjTZlN7C39/HNO8Qvm/vF+8Sd4/nWfpcgMlpKf4WIP4V0nJc9Y011PnbW6HB/GusU7UGeMCuLsflMxHHTNbup6paaTplxqWp3EWnWttF5ks87rHGg7l3YhVH1NZSd0XTepg61fwh3iDqXTBZAfmUNnaSOozg4z6VSs7y3cGNZFaQAEoCNwBzgkZzgkHBxg4NfBni/9qPw7YeIvGmr+HpYfFVxFdaZoel6akvktdXzoqwM7Ou6G2klncvNsZUiiZxngV3vwN+JFvrWrXtpc6xb+OfEF3dMt0+mqot7aGHlgSGdYoYd22KNnaVgQxyWZqzhWi17rOyphKkY88l/X/APrJpF3Hk9ab5i+rVS8xzz6+4o3v6/+PCug4z//0P111abdqG88+bH/APWrOt72x0zT/t2p3EOnW9vJulnnkWKNAOpZ3IUfnXgX7SHx80j4J6ZbzNCmr63dtKLOyLhVWOM4aeY9fLQkAKOXc4GAGYfjJ8WPiFqfxj1CS81bx3qZkmlYiw1WES6ZADlzHbpZeVHEqcYkeGSQDguxxUYnFKnolqa4PAOs7ydl95+zfxA/b6/Zz8DrfWGna1deP7to2QL4diE8QcAhh9umMdmrqexkODX5p/E79oOHxhp5S50bWL7Rb3yp/wDiqNdn1LUPJV/MjFvbxFNPs5OhV41kkKYDOua+WvCHw88QRXkup6u/hfxPoPlr/aDM6390to+RGIobmCNoDcybY965YDPOFroNa8MeLviD4f8AFfjnTH07TtG8MMsd1Le3a20l5ePH9p/s7TY2B865W2/e7CVBXaoJLHZ4eKxMqj5JtW/zPfw+EoUreyun3b1+VrHB6vcWGq2OoyWGkM0U93aPbX13IrT2sLsy3UIVCVmWfKjyuVQfvCcqor9of2KNV8M23hhLLTLO4069a3CyQrp729vBGoJA3qvlAMRx825iRX5AeBPDGma5eztdThjCghgtg4HnK+5pGRM7iQdpJQA46npX7sfArRF8P+AdNt1jWGV7aEykDGXwASfWuzLOpnntSyVO9/n/AFc+m1mBUHI6D0/xp3nL6j9P8ay1U7R8q9B3/wDrU7af7q/n/wDWr2z5c//R95/aj+B3i34i+LNU1rQIIdbW6tLaCJJnUfZDDvbd5ZeLzFdnyQXI9hyT8pxfsD+OH0QuukXt3ciMO5hv7YT4PdYCxjwW5K5PXj0r9bLpv+JkqMch2kt3+oztz+Fd94bV2EQPOYJY2+qVy1MvU5N+0kr+a/y/A6KWYzhFRUVpp1/zPwbtvADfBvSNb8EfEu3uJTr81uLyG8RtPureCIF7JomD71dZVnkimRjGWDKeMg+XeJfhtr1/4U0XwZ4V1/QNU0fTdQ1PVZZ9SvTp97c32omBEmubc2rwo1lZxLAGjmcNGWKAcJX9Anxu/Z58BfHrS0tfFEcmn6lao0Flqdrt8+GKePEkLo+Umgf+KNxweVKtzX5reIv+CefiTRpHl0/xlYLbSeciJFBfwHEhUZ2m5lUFQuBg1xvC1YSs48y7q34rT8DuhjqU1zOXK+2v4bnjf7Mnhi68N+LD4Q8V3OgXy63A09vBZ3n224gurVR8yt9njQCWBiG2O2Ai56nH6/eHrJdPsLeBThBsUfhXyB8E/wBmXTPhr4tttWubt/EWptEkLTtH5UcSj5T5alncswABZ3JxnGMnP2nJbNZ3P2I4Xy5SQe23tXo4Sm4wtJWODHV1Uqc0Xc7RW+Ucjp6Uu4eo/IUyPTpXRX2/eAPX1p/9mS/3T+ddpxan/9L9NL7i/mI4P2qE59yBmvTvDgw3/bS4/wDQa8xvv+P6b/r5g/kK9P8ADn3v+2lx/wCgVsznO5i6r/vR/wDouvLvF4H2a1/3/wCteoxdV/3o/wD0XXl/i7/j3tP98fzp9QRz+mIv9s2+AO3b/bNaesgDU1xxlWz/AN9VnaZ/yGbf8P8A0M1pa1/yE1/3W/8AQqTL6nYwMRDGASPlX+VS7m9T+dQw/wCpj/3R/KpKkZ//2Q==";
// Expected EXIF metadata of the above file
const EXPECTED_EXIF_DATE = parse(
  "2018-03-07 07:19:49+00:00",
  "yyyy-MM-dd HH:mm:ssXXX",
  new Date()
);
const EXPECTED_EXIF_LATITUDE = 38.07480555555556;
const EXPECTED_EXIF_LONGITUDE = -122.85112777777778;
const EXPECTED_EXIF_POSITIONAL_ACCURACY = 5;

// this resolves a test failure with the Animated library:
// Animated: `useNativeDriver` is not supported because the native animated module is missing.
jest.useFakeTimers( );

const mockLocationName = "San Francisco, CA";

jest.mock( "../../../../src/providers/ObsEditProvider" );

// mock Portal with a Modal component inside of it (MediaViewer)
jest.mock( "react-native-paper", () => {
  const RealModule = jest.requireActual( "react-native-paper" );
  const MockedModule = {
    ...RealModule,
    // eslint-disable-next-line react/jsx-no-useless-fragment
    Portal: ( { children } ) => <>{children}</>
  };
  return MockedModule;
} );

jest.mock( "../../../../src/sharedHooks/useLocationName", ( ) => ( {
  __esModule: true,
  default: ( ) => mockLocationName
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
    } )
  };
} );

jest.mock( "../../../../src/sharedHooks/useLoggedIn", ( ) => ( {
  __esModule: true,
  default: ( ) => true
} ) );

const mockCurrentUser = factory( "LocalUser" );

jest.mock( "../../../../src/components/LoginSignUp/AuthenticationService", ( ) => ( {
  getUserId: ( ) => mockCurrentUser.id
} ) );

jest.mock( "react-native-fs", ( ) => {
  const RNFS = {
    // Used for testing reading EXIF data
    read: async ( ) => TEST_IMAGE_CONTENTS_BASE64
  };

  return RNFS;
} );

// Mock ObservationProvider so it provides a specific array of observations
// without any current observation or ability to update or fetch
// observations
const mockObsEditProviderWithObs = obs => ObsEditProvider.mockImplementation( ( { children } ) => (
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  <ObsEditContext.Provider value={{
    observations: obs,
    currentObsIndex: 0
  }}
  >
    {children}
  </ObsEditContext.Provider>
) );

const renderObsEdit = ( ) => render(
  <SafeAreaProvider>
    <NavigationContainer>
      <ObsEditProvider>
        <ObsEdit />
      </ObsEditProvider>
    </NavigationContainer>
  </SafeAreaProvider>
);

test( "renders observation photo from photo gallery", ( ) => {
  const observations = [factory( "RemoteObservation", {
    latitude: 37.99,
    longitude: -142.88,
    user: mockCurrentUser
  } )];
  mockObsEditProviderWithObs( observations );

  const { getByText } = renderObsEdit( );

  const obs = observations[0];
  const { longitude } = obs;

  expect( getByText( new RegExp( longitude ) ) ).toBeTruthy( );
} );

const usePhotoExifWrapper = () => {
  const [uri, setUri] = useState( null );
  const exif = usePhotoExif( uri );

  return { setUri, exif };
};

test( "reads and parses EXIF data from photo", async ( ) => {
  const { result } = renderHook( () => usePhotoExifWrapper( ) );

  await waitFor( () => {
    // This triggers the usePhotoExif hook
    result.current.setUri( "someuri" );
  } );

  if ( result.current.exif ) {
    const { exif } = result.current;
    const observedOnDate = parseExifDateTime( exif );
    const locationData = parseExifCoordinates( exif );
    expect( observedOnDate ).toEqual( EXPECTED_EXIF_DATE );
    expect( locationData ).toBeTruthy();
    expect( locationData.latitude ).toEqual( EXPECTED_EXIF_LATITUDE );
    expect( locationData.longitude ).toEqual( EXPECTED_EXIF_LONGITUDE );
    expect( locationData.positionalAccuracy ).toEqual( EXPECTED_EXIF_POSITIONAL_ACCURACY );
  }
} );

// right now this is failing on react-native-modal, since there's a TouchableWithFeedback
// that allows the user to tap the backdrop and exit the modal
test.todo( "should not have accessibility errors" );
