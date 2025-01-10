import { Image } from "react-native";

// A helper function to get the image dimensions
const getImageDimensions = async uri => new Promise( resolve => {
  Image.getSize( uri, ( width, height ) => {
    resolve( { width, height } );
  } );
} );

export default getImageDimensions;
