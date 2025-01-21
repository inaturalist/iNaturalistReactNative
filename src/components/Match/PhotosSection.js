import classnames from "classnames";
import {
  Image, Pressable, View
} from "components/styledComponents";
import _, { compact } from "lodash";
import React, { useEffect, useState } from "react";
import Photo from "realmModels/Photo";
import getImageDimensions from "sharedHelpers/getImageDimensions";
import { useTaxon } from "sharedHooks";

type Props = {
  taxon: Object,
  observationPhoto: string,
  navToTaxonDetails: ( ) => void
}

const PhotosSection = ( { taxon, observationPhoto, navToTaxonDetails }: Props ) => {
  const [displayPortraitLayout, setDisplayPortraitLayout] = useState( null );

  const { taxon: localTaxon } = useTaxon( taxon );
  const localTaxonPhotos = localTaxon?.taxonPhotos;

  const photos = compact(
    localTaxonPhotos
      ? localTaxonPhotos.map( taxonPhoto => taxonPhoto.photo )
      : [taxon?.defaultPhoto]
  );

  // don't show the iconic taxon photo which is a mashup of 9 photos
  const taxonPhotos = localTaxon?.isIconic
    ? photos.slice( 1, 4 )
    : photos.slice( 0, 3 );

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
      onPress={() => console.log( "open obs details?" )}
      accessibilityState={{ disabled: false }}
      className={classnames(
        "relative",
        {
          // Landscape layout: full width on top
          "w-full h-2/3": !displayPortraitLayout,
          // Portrait layout: 2/3 width on left
          "w-2/3 h-full": displayPortraitLayout
        }
      )}
    >
      <Image
        testID="MatchScreen.ObsPhoto"
        source={{ uri: Photo.displayLargePhoto( observationPhoto ) }}
        className="w-full h-full"
        accessibilityIgnoresInvertColors
      />
    </Pressable>
  );

  const renderTaxonPhotos = ( ) => (
    <View className={classnames(
      "flex",
      {
        // Landscape layout: row of photos at bottom
        "flex-row w-full h-1/3": !displayPortraitLayout,
        // Portrait layout: column of photos on right
        "flex-col w-1/3 h-full": displayPortraitLayout
      }
    )}
    >
      {taxonPhotos.map( photo => (
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
    </View>
  );
};

export default PhotosSection;
