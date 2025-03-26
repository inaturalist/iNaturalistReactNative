import PermissionGateContainer, {
  WRITE_MEDIA_PERMISSIONS
} from "components/SharedComponents/PermissionGateContainer.tsx";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  onPhotoPermissionBlocked?: () => void;
  onPhotoPermissionGranted?: () => void;
  permissionNeeded?: boolean;
  onModalHide: () => void;
}

const SavePhotoPermissionGate = ( {
  onPhotoPermissionGranted,
  onPhotoPermissionBlocked,
  permissionNeeded,
  onModalHide
}: Props ) => {
  const { t } = useTranslation( );
  return (
    <PermissionGateContainer
      permissions={WRITE_MEDIA_PERMISSIONS}
      title={t( "Save-photos-to-your-library" )}
      titleDenied={t( "Save-photos-to-your-library" )}
      body={t( "iNaturalist-can-save-photos-you-take-in-the-app-to-your-devices-library" )}
      buttonText={t( "SAVE-PHOTOS" )}
      icon="photo-library"
      image={require( "images/background/birger-strahl-ksiGE4hMiso-unsplash.jpg" )}
      onModalHide={onModalHide}
      onPermissionGranted={onPhotoPermissionGranted}
      onPermissionBlocked={onPhotoPermissionBlocked}
      withoutNavigation
      permissionNeeded={permissionNeeded}
    />
  );
};

export default SavePhotoPermissionGate;
