import { Image } from "react-native";

type ImageDimensions = {
  width: number;
  height: number;
};

// A helper function to get the image dimensions
const getImageDimensions = async ( uri: string ) => new Promise<ImageDimensions>( resolve => {
  Image.getSize( uri, ( width, height ) => {
    resolve( { width, height } );
  } );
} );

export default getImageDimensions;
