// @flow

import { Text, TouchableOpacity, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { ProgressBar } from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useLocalObservations from "sharedHooks/useLocalObservations";
import useNumUnuploadedObservations from "sharedHooks/useNumUnuploadedObservations";
import useUploadObservations from "sharedHooks/useUploadObservations";
import colors from "styles/tailwindColors";

type Props = {
  setView: Function,
  view: string,
};

const Toolbar = ( { setView, view }: Props ): Node => {
  const currentUser = useCurrentUser( );
  const obsEditContext = useContext( ObsEditContext );
  const { allObsToUpload } = useLocalObservations( );
  const numUnuploadedObs = useNumUnuploadedObservations( );
  const {
    stopUpload,
    uploadInProgress,
    startUpload,
    error: uploadError
  } = useUploadObservations( allObsToUpload );

  const loading = obsEditContext?.loading;
  const syncObservations = obsEditContext?.syncObservations;

  const totalObsToUpload = Math.max( allObsToUpload.length, numUnuploadedObs );
  const progress = ( totalObsToUpload - numUnuploadedObs + 1 ) / ( totalObsToUpload + 1 );

  const getSyncClick = ( ) => {
    if ( numUnuploadedObs > 0 ) {
      return startUpload;
    }
    return syncObservations;
  };

  const cleanProgress = ( progressToClean: number ) => {
    if ( Number.isNaN( progressToClean ) || progressToClean < 0 ) {
      return 0;
    }

    return progressToClean;
  };

  const getStatusText = ( ) => {
    if ( !uploadInProgress && totalObsToUpload > 0 ) {
      return t( "UPLOAD-X-OBSERVATIONS", { count: numUnuploadedObs } );
    }
    if ( totalObsToUpload > 0 ) {
      return t( "Uploading-X-Observations", { count: numUnuploadedObs } );
    }
    return null;
  };

  const getSyncIconColor = ( ) => {
    if ( uploadInProgress || totalObsToUpload > 0 ) {
      return colors.inatGreen;
    }
    return colors.darkGray;
  };

  const statusText = getStatusText( );

  /* eslint-disable react-native/no-inline-styles */
  return (
    <View className="bg-white border-b border-[#e8e8e8]">
      <View className="py-5 flex flex-row px-[15px]">
        <View className="flex justify-between items-center flex-row grow">
          <View className="flex items-center flex-row">
            {currentUser && (
              <TouchableOpacity className="mr-3" accessibilityRole="button">
                <IconMaterial name="language" size={30} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={getSyncClick( )}
              accessibilityRole="button"
              disabled={loading || uploadInProgress}
              accessibilityState={{ disabled: loading || uploadInProgress }}
            >
              <IconMaterial name="sync" size={26} color={getSyncIconColor( )} />
            </TouchableOpacity>

            {statusText && (
              <View>
                <Text className="ml-1">{statusText}</Text>
                {uploadError && (
                  <Text className="ml-1 mt-[3px]" style={{ color: colors.warningRed }}>
                    {uploadError}
                  </Text>
                )}
              </View>
            )}
          </View>
          {uploadInProgress && (
            <TouchableOpacity onPress={stopUpload} accessibilityRole="button">
              <IconMaterial name="close" size={20} color={colors.darkGray} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          className="ml-2"
          testID={
            view === "list"
              ? "ObsList.toggleGridView"
              : "ObsList.toggleListView"
          }
          onPress={( ) => setView( currentView => {
            if ( currentView === "list" ) {
              return "grid";
            }
            return "list";
          } )}
          accessibilityRole="button"
        >
          <IconMaterial
            name={view === "grid" ? "format-list-bulleted" : "grid-view"}
            size={30}
          />
        </TouchableOpacity>
      </View>
      <ProgressBar
        progress={uploadInProgress ? cleanProgress( progress ) : 0}
        color={colors.primary}
        style={{ backgroundColor: "transparent" }}
      />
    </View>
  );
};

export default Toolbar;
