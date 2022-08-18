// @flow

import { useEffect, useState } from "react";

const useGalleryPermissions = ( ): Object => {
  // Whether or not usePhotos can fetch photos now, e.g. if permissions have
  // been granted (Android), or if it's ok to request permissions (iOS). This
  // should be used by whatever component is using this context so that
  // photos are requested (and permissions are potentially requested) when
  // they are needed and not just when this provider initializes
  const [canRequestPhotos, setCanRequestPhotos] = useState( false );

  // If this component is being rendered we have either already asked for
  // permissions in Android via a PermissionGate parent component, or the
  // user is expecting us to ask for permissions via CameraRoll in iOS.
  // Either way, we need to inform the context that it is now ok to request
  // photos from the operating system.
  useEffect( ( ) => {
    if ( !canRequestPhotos ) {
      setCanRequestPhotos( true );
    }
  }, [canRequestPhotos] );

  return canRequestPhotos;
};

export default useGalleryPermissions;
