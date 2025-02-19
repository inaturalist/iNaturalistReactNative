import classnames from "classnames";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import {
  PhotoCount
} from "components/SharedComponents";
import {
  Image, Pressable, View
} from "components/styledComponents";
import _, { compact, uniqBy } from "lodash";
import React, { useEffect, useState } from "react";
import Photo from "realmModels/Photo";
import getImageDimensions from "sharedHelpers/getImageDimensions";
import { useTaxon } from "sharedHooks";

type Props = {
  representativePhoto: Object,
  taxon: Object,
  obsPhotos: Array<Object>,
  navToTaxonDetails: ( ) => void
}

const PhotosSection = ( {
  representativePhoto,
  taxon,
  obsPhotos,
  navToTaxonDetails
}: Props ) => {
  const [displayPortraitLayout, setDisplayPortraitLayout] = useState( null );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );

  const { taxon: localTaxon } = useTaxon( taxon );
  const localTaxonPhotos = localTaxon?.taxonPhotos;
  const observationPhoto = obsPhotos?.[0]?.photo?.url
  || obsPhotos?.[0]?.photo?.localFilePath;

  const taxonPhotos = compact(
    localTaxonPhotos
      ? localTaxonPhotos.map( taxonPhoto => taxonPhoto.photo )
      : [taxon?.defaultPhoto]
  );
  // don't show the iconic taxon photo which is a mashup of 9 photos
  const taxonPhotosNoIconic = localTaxon?.isIconic
    ? taxonPhotos.slice( 1, 4 )
    : taxonPhotos.slice( 0, 3 );

  // Add the representative photo at the start of the list of taxon photos.
  const taxonPhotosWithRepPhoto = compact( [representativePhoto, ...taxonPhotosNoIconic] );
  // The representative photo might be already included in taxonPhotosNoIconic
  const uniqueTaxonPhotos = uniqBy( taxonPhotosWithRepPhoto, "id" );

  const observationPhotos = compact(
    obsPhotos
      ? obsPhotos.map( obsPhoto => obsPhoto.photo )
      : []
  );

  useEffect( ( ) => {
    const checkImageOrientation = async ( ) => {
      const imageDimensions = await getImageDimensions( observationPhoto );
      if ( imageDimensions.width < imageDimensions.height ) {
        setDisplayPortraitLayout( true );
      } else {
        setDisplayPortraitLayout( false );
      }
    };
    checkImageOrientation( );
  }, [observationPhoto] );

  const renderObservationPhoto = ( ) => (
    <Pressable
      accessibilityRole="button"
      onPress={() => setMediaViewerVisible( true )}
      accessibilityState={{ disabled: false }}
      className={classnames(
        "relative",
        {
          // Landscape layout: full width on top
          "w-full h-2/3 pb-[3px]": !displayPortraitLayout,
          // Portrait layout: 2/3 width on left
          "w-2/3 h-full pr-[3px]": displayPortraitLayout
        }
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
      {
        // Landscape layout: row of photos at bottom
        "flex-row w-full h-1/3 space-x-[3px]": !displayPortraitLayout,
        // Portrait layout: column of photos on right
        "flex-col w-1/3 h-full space-y-[3px]": displayPortraitLayout
      }
    )}
    >
      {uniqueTaxonPhotos.map( photo => (
        <Pressable
          accessibilityRole="button"
          onPress={navToTaxonDetails}
          accessibilityState={{ disabled: false }}
          key={photo.id}
          className={classnames(
            "relative",
            {
              // Landscape layout: equal width photos in a row
              "w-1/3 h-full": !displayPortraitLayout,
              // Portrait layout: equal height photos in a column
              "w-full h-1/3": displayPortraitLayout
            }
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
    <View className={classnames( "h-[390px]", {
      // Landscape layout: stack vertically
      "flex-col": !displayPortraitLayout,
      // Portrait layout: align horizontally
      "flex-row": displayPortraitLayout
    } )}
    >
      {renderObservationPhoto( )}
      {renderTaxonPhotos( )}
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
