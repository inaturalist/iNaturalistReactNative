// @flow

import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { TouchableOpacity } from "react-native";
import { ProgressBar } from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useLocalObservations from "sharedHooks/useLocalObservations";
import useNumUnuploadedObservations from "sharedHooks/useNumUnuploadedObservations";
import useUploadObservations from "sharedHooks/useUploadObservations";
import colors from "styles/tailwindColors";

type Props = {
  setView: Function;
  view: string
}

const Toolbar = ( { setView, view }: Props ): Node => {
  const currentUser = useCurrentUser( );
  const obsEditContext = useContext( ObsEditContext );
  const { allObsToUpload } = useLocalObservations( );
  const numUnuploadedObs = useNumUnuploadedObservations( );
  const {
    // stopUpload,
    uploadInProgress,
    startUpload
  } = useUploadObservations( allObsToUpload );

  const loading = obsEditContext?.loading;
  const syncObservations = obsEditContext?.syncObservations;

  const totalObsToUpload = Math.max( allObsToUpload.length, numUnuploadedObs );
  const progress = ( totalObsToUpload - numUnuploadedObs + 1 ) / ( totalObsToUpload + 1 );

  const getSyncClick = () => {
    if ( numUnuploadedObs > 0 ) {
      return startUpload;
    }
    return syncObservations;
  };

  const cleanProgress = ( progressToClean: number ) => {
    if ( Number.isNaN( progressToClean ) || ( progressToClean < 0 ) ) {
      return 0;
    }

    return progressToClean;
  };

  const getStatusText = ( ) => {
    if ( !uploadInProgress && totalObsToUpload > 0 ) {
      return t( "UPLOAD-X-OBSERVATIONS", { count: numUnuploadedObs } );
    } if ( totalObsToUpload > 0 ) {
      return t( "Uploading-X-Observations", { count: numUnuploadedObs } );
    }
    return null;
  };

  const statusText = getStatusText();

  /* eslint-disable react-native/no-inline-styles */
  return (
    <View className="bg-white border-b" style={{ borderColor: "#E8e8e8" }}>
      <View className="py-5 flex-row justify-between px-3">
        <View className="flex justify-center items-center flex-row">
          { currentUser && <IconMaterial name="language" size={30} /> }
          <TouchableOpacity
            onPress={getSyncClick()}
            accessibilityRole="button"
            disabled={loading}
          >
            <IconMaterial name="sync" size={30} />
          </TouchableOpacity>

          { statusText && <Text>{statusText}</Text> }
        </View>

        <View className="flex-row mx-3">
          <TouchableOpacity
            onPress={( ) => setView( currentView => {
              if ( currentView === "list" ) {
                return "grid";
              }
              return "list";
            } )}
            accessibilityRole="button"
          >
            <IconMaterial name={view === "grid" ? "format-list-bulleted" : "grid-view"} size={30} />
          </TouchableOpacity>
        </View>
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
