import { useTranslation } from "react-i18next";

// Wrap react-i18next's useTranslation to catch a mysterious exception that
// often gets thrown on initialization. https://github.com/inaturalist/iNaturalistReactNative/pull/515
const useCustomTranslation = ( ) => {
  const original = useTranslation( );
  return {
    ...original,
    t: ( key: string, options = {} ) => {
      try {
        return original.t( key, options );
      } catch ( translationError ) {
        if ( !translationError.message.match( /NoClassDefFoundError/ ) ) {
          throw translationError;
        }
      }
      return "";
    }
  };
};

export default useCustomTranslation;
