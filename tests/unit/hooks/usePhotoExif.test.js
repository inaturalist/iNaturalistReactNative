// Base64-encoded contents of an image file with EXIF data
// eslint-disable-next-line max-len
import { renderHook, waitFor } from "@testing-library/react-native";
import { parse } from "date-fns";
import fs from "fs";
import { useState } from "react";
import { usePhotoExif } from "sharedHooks/usePhotoExif";

// Expected EXIF metadata of the above file
const EXPECTED_EXIF_DATE = parse(
  "2018-03-07 08:19:49",
  "yyyy-MM-dd HH:mm:ss",
  new Date()
);

const EXPECTED_EXIF_LATITUDE = 38.07480555555556;
const EXPECTED_EXIF_LONGITUDE = -122.85112777777778;
const EXPECTED_EXIF_POSITIONAL_ACCURACY = 5;

const readFileFS = filename => (
  fs.readFileSync(
    filename,
    { encoding: "base64" }
  )
);

jest.mock( "react-native-fs", ( ) => {
  const RNFS = {
    // Used for testing reading EXIF data
    read: readFileFS
  };

  return RNFS;
} );

const usePhotoExifWrapper = () => {
  const [uri, setUri] = useState( null );
  const exif = usePhotoExif( uri );

  return { setUri, exif };
};

test( "reads and parses EXIF data from photo", async ( ) => {
  const { result } = renderHook( () => usePhotoExifWrapper() );

  await waitFor( () => {
    // This triggers the usePhotoExif hook
    result.current.setUri( `${process.cwd()}/tests/resources/test_exif.jpg` );
  } );

  if ( result.current.exif ) {
    const { exif } = result.current;
    const observedOnDate = exif.date;
    expect( observedOnDate ).toEqual( EXPECTED_EXIF_DATE );
    expect( exif.latitude ).toEqual( EXPECTED_EXIF_LATITUDE );
    expect( exif.longitude ).toEqual( EXPECTED_EXIF_LONGITUDE );
    expect( exif.positionalAccuracy ).toEqual( EXPECTED_EXIF_POSITIONAL_ACCURACY );
  }
} );
