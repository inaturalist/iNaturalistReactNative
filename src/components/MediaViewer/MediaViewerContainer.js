// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { Heading4 } from "components/SharedComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useEffect,
  useState
} from "react";
import ObservationPhoto from "realmModels/ObservationPhoto";
import useTranslation from "sharedHooks/useTranslation";
import useStore from "stores/useStore";

import MediaViewer from "./MediaViewer";

const { useRealm } = RealmContext;

const MediaViewerContainer = ( ): Node => {
  const realm = useRealm( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState( params?.index );
  const { t } = useTranslation( );
  const photoEvidenceUris = useStore( state => state.photoEvidenceUris );
  const deletePhotoFromObservation = useStore( state => state.deletePhotoFromObservation );
  const currentObservation = useStore( state => state.currentObservation );

  const numOfPhotos = photoEvidenceUris.length;
  const editable = params?.editable;

  const deletePhoto = async ( ) => {
    const uriToDelete = photoEvidenceUris[selectedPhotoIndex];
    deletePhotoFromObservation( uriToDelete );
    await ObservationPhoto.deletePhoto( realm, uriToDelete, currentObservation );
    if ( photoEvidenceUris.length === 0 ) {
      navigation.goBack( );
    } else if ( selectedPhotoIndex !== 0 ) {
      setSelectedPhotoIndex( selectedPhotoIndex - 1 );
    }
  };

  useEffect( ( ) => {
    const renderHeaderTitle = ( ) => (
      <Heading4 className="color-white">{t( "X-PHOTOS", { photoCount: numOfPhotos } )}</Heading4>
    );

    const headerOptions = {
      headerTitle: renderHeaderTitle
    };

    navigation.setOptions( headerOptions );
  }, [navigation, t, numOfPhotos] );

  return (
    <MediaViewer
      onDelete={deletePhoto}
      uris={photoEvidenceUris}
      editable={editable}
    />
  );
};

export default MediaViewerContainer;
