import { useMemo } from "react";
import { useTranslation } from "react-i18next";

// Wrap react-i18next's useTranslation to catch a mysterious exception that
// often gets thrown on initialization. https://github.com/inaturalist/iNaturalistReactNative/pull/515
const useCustomTranslation = ( ) => {
  const original = useTranslation( );
  // const original = { t: () => "test" };
  const translation = useMemo( () => ( {
    ...original,
    t: ( key: string, options = {} ) => {
      try {
        return original.t( key, options );
      } catch ( translationError ) {
        if ( translationError instanceof Error && !translationError.message.match( /NoClassDefFoundError/ ) ) {
          throw translationError;
        }
      }
      return "";
    },
  } ), [original] );
  return translation;
};

export default useCustomTranslation;
