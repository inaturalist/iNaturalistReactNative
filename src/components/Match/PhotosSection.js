import classnames from "classnames";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import {
  PhotoCount
} from "components/SharedComponents";
import {
  Image, Pressable, View
} from "components/styledComponents";
import _, { compact } from "lodash";
import React, { useEffect, useState } from "react";
import Photo from "realmModels/Photo.ts";
import getImageDimensions from "sharedHelpers/getImageDimensions";

type Props = {
  representativePhoto: Object,
  taxon: Object,
  obsPhotos: Array<Object>,
  navToTaxonDetails: ( photo: Object ) => void
}

const PhotosSection = ( {
  representativePhoto,
  taxon,
  obsPhotos,
  navToTaxonDetails
}: Props ) => {
  const [displayPortraitLayout, setDisplayPortraitLayout] = useState( null );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );

  const localTaxonPhotos = taxon?.taxonPhotos;
  const observationPhoto = obsPhotos?.[0]?.photo?.url
  || obsPhotos?.[0]?.photo?.localFilePath;

  const taxonPhotos = compact(
    localTaxonPhotos
      ? localTaxonPhotos.map( taxonPhoto => ( { ...taxonPhoto.photo } ) )
      : [taxon?.defaultPhoto]
  );
  // don't show the iconic taxon photo which is a mashup of 9 bestTaxonPhotos
  if ( taxon?.isIconic ) {
    taxonPhotos.splice( 0 );
  }

  // If the representative photo is already included in taxonPhotos, don't add it but move
  // it to the start of the list.
  let firstPhoto;
  if ( representativePhoto && taxonPhotos.some( photo => photo.id === representativePhoto.id ) ) {
    const repPhotoIndex = taxonPhotos.findIndex( photo => photo.id === representativePhoto.id );
    // The first photo to show is the realm version of the representative photo
    firstPhoto = taxonPhotos.splice( repPhotoIndex, 1 )[0];
  } else if ( representativePhoto ) {
    // This is possible because a representative photo can be from a different taxon, e.g. children
    // of common ancestors. In this case, the representative photo is not included in taxonPhotos.
    firstPhoto = { ...representativePhoto, isRepresentativeButOtherTaxon: true };
  }
  // Add the representative photo at the start of the list of taxon bestTaxonPhotos.
  const taxonPhotosWithRepPhoto = compact( [
    firstPhoto,
    ...taxonPhotos
  ] );
  const bestTaxonPhotos = taxonPhotosWithRepPhoto.slice( 0, 3 );

  const observationPhotos = compact(
    obsPhotos
      ? obsPhotos.map( obsPhoto => obsPhoto.photo )
      : []
  );

  useEffect( ( ) => {
    const checkImageOrientation = async ( ) => {
      if ( observationPhoto ) {
        const imageDimensions = await getImageDimensions( observationPhoto );
        if ( imageDimensions.width < imageDimensions.height ) {
          setDisplayPortraitLayout( true );
        } else {
          setDisplayPortraitLayout( false );
        }
      }
    };
    checkImageOrientation( );
  }, [observationPhoto] );

  const getLayoutClasses = ( ) => {
    // Basic layout: no taxon bestTaxonPhotos + obs photo a square
    let containerClass = "flex-row";
    let observationPhotoClass = "w-full h-full";
    let taxonPhotosContainerClass;
    let taxonPhotoClass;
    // If there is only one taxon photo: obs photo a square,
    // taxon photo a square in the lower right corner of the obs photo
    if ( bestTaxonPhotos.length === 1 ) {
      containerClass = "flex-row relative";
      observationPhotoClass = "w-full h-full";
      taxonPhotosContainerClass = "absolute bottom-0 right-0 w-1/3 h-1/3";
      taxonPhotoClass = "w-full h-full border-l-[3px] border-t-[3px] border-white";
    }
    if ( bestTaxonPhotos.length > 1 ) {
      if ( displayPortraitLayout ) {
        containerClass = "flex-row";
        observationPhotoClass = "w-2/3 h-full pr-[3px]";
        if ( bestTaxonPhotos.length === 2 ) {
          taxonPhotosContainerClass = "flex-col w-1/3 h-full space-y-[3px]";
          taxonPhotoClass = "w-full h-1/2";
        } else {
          taxonPhotosContainerClass = "flex-col w-1/3 h-full space-y-[3px]";
          taxonPhotoClass = "w-full h-1/3";
        }
      } else {
        containerClass = "flex-col";
        observationPhotoClass = "w-full h-2/3 pb-[3px]";
        if ( bestTaxonPhotos.length === 2 ) {
          taxonPhotosContainerClass = "flex-row w-full h-1/3 space-x-[3px]";
          taxonPhotoClass = "w-1/2 h-full";
        } else {
          taxonPhotosContainerClass = "flex-row w-full h-1/3 space-x-[3px]";
          taxonPhotoClass = "w-1/3 h-full";
        }
      }
    }
    return {
      containerClass,
      observationPhotoClass,
      taxonPhotosContainerClass,
      taxonPhotoClass
    };
  };

  const layoutClasses = getLayoutClasses();

  const renderObservationPhoto = ( ) => (
    <Pressable
      accessibilityRole="button"
      onPress={() => setMediaViewerVisible( true )}
      accessibilityState={{ disabled: false }}
      className={classnames(
        "relative",
        layoutClasses?.observationPhotoClass
      )}
    >
      <Image
        testID="MatchScreen.ObsPhoto"
        source={{ uri: Photo.displayLargePhoto( observationPhoto ) }}
        className="w-full h-full"
        accessibilityIgnoresInvertColors
      />
      {observationPhotos.length > 1 && (
        <View className="absolute bottom-5 left-5">
          <PhotoCount count={observationPhotos.length} />
        </View>
      )}

    </Pressable>
  );

  const renderTaxonPhotos = ( ) => (
    <View className={classnames(
      "flex",
      layoutClasses?.taxonPhotosContainerClass
    )}
    >
      {bestTaxonPhotos.map( photo => (
        <Pressable
          accessibilityRole="button"
          onPress={() => navToTaxonDetails( photo )}
          accessibilityState={{ disabled: false }}
          key={photo.id}
          className={classnames(
            "relative",
            layoutClasses?.taxonPhotoClass
          )}
        >
          <Image
            testID={`TaxonDetails.photo.${photo.id}`}
            className="w-full h-full"
            source={{
              uri: Photo.displayMediumPhoto( photo.url )
            }}
            accessibilityIgnoresInvertColors
          />
        </Pressable>
      ) )}
    </View>
  );

  if ( displayPortraitLayout === null ) {
    return (
      <View className="h-[390px]" />
    );
  }

  return (
    <View className={classnames( "h-[390px]", layoutClasses.containerClass )}>
      {renderObservationPhoto( )}
      {bestTaxonPhotos.length > 0 && renderTaxonPhotos( )}
      <MediaViewerModal
        showModal={mediaViewerVisible}
        onClose={( ) => setMediaViewerVisible( false )}
        uri={observationPhoto}
        photos={observationPhotos}
      />
    </View>
  );
};

export default PhotosSection;
