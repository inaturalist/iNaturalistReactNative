import type { QueryClient } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  computerVisionPath,
  photoLibraryPhotosPath,
  photoUploadPath,
  rotatedOriginalPhotosPath,
  soundUploadPath,
} from "appConstants/paths";
import { clearRealm } from "components/LoginSignUp/AuthenticationService";
import { Button, ScrollViewWrapper, WarningSheet } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import React, { useState } from "react";
import { unlink } from "react-native-fs";
import type Realm from "realm";
import { logFilePath } from "sharedHelpers/logger";
import removeAllFilesFromDirectory from "sharedHelpers/removeAllFilesFromDirectory";
import zustandMMKVBackingStorage from "stores/zustandMMKVBackingStorage";

const { useRealm } = RealmContext;

enum DIAGNOSTIC_OPERATION {
  DELETE_REACT_QUERY_CACHE = "DELETE_REACT_QUERY_CACHE",
  DELETE_LOG = "DELETE_LOG",
  DELETE_CV_SUGGESTIONS = "DELETE_CV_SUGGESTIONS",
  DELETE_PHOTO_LIBRARY_PHOTOS = "DELETE_PHOTO_LIBRARY_PHOTOS",
  DELETE_PHOTO_UPLOADS = "DELETE_PHOTO_UPLOADS",
  DELETE_ROTATED_ORIGINAL_PHOTOS = "DELETE_ROTATED_ORIGINAL_PHOTOS",
  DELETE_SOUND_UPLOADS = "DELETE_SOUND_UPLOADS",
  DELETE_ZUSTAND_MMKV = "DELETE_ZUSTAND_MMKV",
  DELETE_REALM = "DELETE_REALM",
}

const syncWarning = [
  "Careful! Observations that haven’t been uploaded to",
  "iNaturalist will be deleted or end up in a broken state.",
].join( " " );

const operations = {
  [DIAGNOSTIC_OPERATION.DELETE_REACT_QUERY_CACHE]: {
    label: "Delete RQ Cache",
    confirmDescription: "Bloop",
    operation: ( queryClient?: QueryClient ) => {
      queryClient?.getQueryCache( ).clear( );
    },
  },
  [DIAGNOSTIC_OPERATION.DELETE_LOG]: {
    label: "Delete Log",
    confirmDescription: [
      "Are you sure you want to delete your log file?",
      "You may lose helpful debugging context.",
      "Consider saving your logs through the 'Share' button on the Log screen before deleting.",
    ].join( " " ),
    operation: ( ) => {
      unlink( logFilePath );
    },
  },
  [DIAGNOSTIC_OPERATION.DELETE_CV_SUGGESTIONS]: {
    label: "Delete CV Suggestions",
    confirmDescription: "",
    operation: ( ) => {
      removeAllFilesFromDirectory( computerVisionPath );
    },
  },
  [DIAGNOSTIC_OPERATION.DELETE_PHOTO_LIBRARY_PHOTOS]: {
    label: "Delete Photo Library Photos",
    confirmDescription: syncWarning,
    operation: ( ) => {
      removeAllFilesFromDirectory( photoLibraryPhotosPath );
    },
  },
  [DIAGNOSTIC_OPERATION.DELETE_PHOTO_UPLOADS]: {
    label: "Delete Photo Uploads",
    confirmDescription: syncWarning,
    operation: ( ) => {
      removeAllFilesFromDirectory( photoUploadPath );
    },
  },
  [DIAGNOSTIC_OPERATION.DELETE_ROTATED_ORIGINAL_PHOTOS]: {
    label: "Delete Rotated photos",
    confirmDescription: syncWarning,
    operation: ( ) => {
      removeAllFilesFromDirectory( rotatedOriginalPhotosPath );
    },
  },
  [DIAGNOSTIC_OPERATION.DELETE_SOUND_UPLOADS]: {
    label: "Delete Sounds",
    confirmDescription: syncWarning,
    operation: ( ) => {
      removeAllFilesFromDirectory( soundUploadPath );
    },
  },
  [DIAGNOSTIC_OPERATION.DELETE_ZUSTAND_MMKV]: {
    label: "Delete Zustand MMKV",
    confirmDescription: syncWarning,
    operation: ( ) => {
      zustandMMKVBackingStorage.clearAll( );
    },
  },
  [DIAGNOSTIC_OPERATION.DELETE_REALM]: {
    label: "Delete Realm",
    confirmDescription: syncWarning,
    operation: ( _queryClient?: QueryClient, realm?: Realm ) => {
      if ( realm ) {
        clearRealm( realm );
      }
    },
  },
};

const DiagnosticDeletionScreen = () => {
  const [modalState, setModalState] = useState<DIAGNOSTIC_OPERATION | null>( null );
  const realm = useRealm( );
  const queryClient = useQueryClient( );
  const closeModal = () => setModalState( null );
  return (
    <ScrollViewWrapper>
      <View className="p-5">
        {Object.entries( operations ).map( ( [operation, { label }] ) => (
          <Button
            key={operation}
            onPress={() => setModalState( operation as DIAGNOSTIC_OPERATION )}
            text={label}
            className="mb-5"
          />
        ) )}
        {modalState && (
          <WarningSheet
            onPressClose={() => setModalState( null )}
            headerText={`${operations[modalState].label}?`}
            text={operations[modalState].confirmDescription}
            handleSecondButtonPress={() => setModalState( null )}
            secondButtonText="Cancel"
            confirm={() => {
              operations[modalState].operation( queryClient, realm );
              closeModal();
            }}
            buttonText="Delete"
            loading={false}
          />
        )}
      </View>
    </ScrollViewWrapper>
  );
};

export default DiagnosticDeletionScreen;
