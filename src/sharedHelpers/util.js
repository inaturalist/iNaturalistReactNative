import RNFS from "react-native-fs";

// eslint-disable-next-line import/prefer-default-export
export const sleep = ms => new Promise( resolve => {
  setTimeout( resolve, ms );
} );

// Unlink file at path. Tries to catch some common exceptions when we try to
// unlink something that was already unlinked
export const unlink = async path => {
  const pathExists = await RNFS.exists( path );
  if ( !pathExists ) return;
  try {
    await RNFS.unlink( path );
  } catch ( unlinkError ) {
    if (
      !unlinkError.message.match( /no such file/ )
      && !unlinkError.message.match( /does not exist/ )
    ) throw unlinkError;
    // If we catch the no such file error, that's fine. We just want it gone.
  }
};
