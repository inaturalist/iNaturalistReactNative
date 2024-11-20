import {
  Body2,
  UploadProgressBar
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

const MultipleObservationsUploadStatus = ( ): Node => {
  const { t } = useTranslation( );

  const totalToolbarProgress = useStore( state => state.totalToolbarProgress );
  const uploadErrorsByUuid = useStore( state => state.errorsByUuid );
  const totalUploadErrors = Object.keys( uploadErrorsByUuid ).length;
  const numUploadsAttempted = useStore( state => state.numUploadsAttempted );
  const initialNumObservationsInQueue = useStore( state => state.initialNumObservationsInQueue );
  const totalSavedObservations = useStore( state => state.totalSavedObservations );

  const totalUploading = Math.min( numUploadsAttempted, initialNumObservationsInQueue );

  const statusOptions = [
    {
      text: t( "x-uploaded", { count: numUploadsAttempted } ),
      count: numUploadsAttempted
    },
    {
      text: t( "x-failed", { count: totalUploadErrors } ),
      count: totalUploadErrors
    },
    {
      text: t( "x-saved", { count: totalSavedObservations } ),
      count: totalSavedObservations
    }, {
      text: t( "x-uploading", { count: totalUploading } ),
      count: totalUploading
    }
  ];

  const totalCounts = statusOptions.reduce( ( acc, currentValue ) => acc + currentValue.count, 0 );

  if ( totalCounts === 0 ) {
    return null;
  }

  const filteredStatusOptions = statusOptions.filter( opt => opt.count > 0 ).map( opt => opt );

  return (
    <>
      <View className="border-b border-lightGray" />
      <View className="py-4 ">
        <Body2 className="self-center">
          {filteredStatusOptions.map( ( opt, i ) => {
            const separator = " • ";
            return (
              <View key={opt.text}>
                <Body2>
                  {opt.text}
                  {i !== filteredStatusOptions.length - 1 && separator}
                </Body2>
              </View>
            );
          } )}
        </Body2>
      </View>
      <UploadProgressBar progress={totalToolbarProgress} />
    </>
  );
};

export default MultipleObservationsUploadStatus;
