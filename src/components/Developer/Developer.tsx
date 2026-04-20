/* eslint-disable arrow-body-style */
/* eslint-disable i18next/no-literal-string */
import {
  CachesDirectoryPath,
  DocumentDirectoryPath,
} from "@dr.pogodin/react-native-fs";
import { useNavigation } from "@react-navigation/native";
import { INatApiError, INatApiTooManyRequestsError } from "api/error";
import { getUserAgent } from "api/userAgent";
import classnames from "classnames";
import {
  Button,
  ScrollViewWrapper,
  WarningSheet,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React, { useEffect, useState } from "react";
import { I18nManager, Platform, Text } from "react-native";
import Config from "react-native-config";
import RNRestart from "react-native-restart";

import {
  CODE, H1, H2, P,
} from "./DeveloperSharedComponents";
import FeatureFlags from "./FeatureFlags";
import type { DirectoryEntrySize } from "./hooks/useAppSize";
import useAppSize, {
  formatAppSizeString, formatSizeUnits, getTotalDirectorySize,
} from "./hooks/useAppSize";
import {
  deleteLegacyLogFile,
  emailLegacyLogFile,
  emailRecentLogs,
  getLegacyLogfileExists,
  shareLegacyLogFile,
  shareRecentLogs,
} from "./logManagementHelpers";

const modelFileName = Platform.select( {
  ios: Config.IOS_MODEL_FILE_NAME,
  android: Config.ANDROID_MODEL_FILE_NAME,
} );
const taxonomyFileName = Platform.select( {
  ios: Config.IOS_TAXONOMY_FILE_NAME,
  android: Config.ANDROID_TAXONOMY_FILE_NAME,
} );
const geomodelFileName = Platform.select( {
  ios: Config.IOS_GEOMODEL_FILE_NAME,
  android: Config.ANDROID_GEOMODEL_FILE_NAME,
} );
const boldClassname = ( line: string, isDirectory = false ) => classnames(
  {
    "text-red font-bold": line.includes( "MB" ),
    "text-blue": isDirectory,
  },
);

interface DirectorySizesProps {
  directoryName: string;
  directoryEntrySizes: DirectoryEntrySize[];
}

const DirectoryFileSizes = ( { directoryName, directoryEntrySizes }: DirectorySizesProps ) => {
  const totalDirectorySize = formatSizeUnits( getTotalDirectorySize( directoryEntrySizes ) );
  return (
    <View key={directoryName}>
      <H2>
        File Sizes:
        {" "}
        {directoryName}
      </H2>
      <P>
        <CODE optionalClassName={boldClassname( totalDirectorySize, true )}>
          {`Total Directory Size: ${totalDirectorySize}`}
        </CODE>
      </P>
      {directoryEntrySizes.map( ( { name, size } ) => {
        const line = formatAppSizeString( name, size );
        return (
          <P key={name}>
            <CODE optionalClassName={boldClassname( line )}>
              {line}
            </CODE>
          </P>
        );
      } )}
    </View>
  );
};

const AppFileSizes = () => {
  const appSize = useAppSize();
  if ( !appSize ) {
    return null;
  }
  return (
    <>
      {Object.entries( appSize ).map( ( [directoryName, directoryEntrySizes] ) => (
        <DirectoryFileSizes
          key={directoryName}
          directoryName={directoryName}
          directoryEntrySizes={directoryEntrySizes}
        />
      ) )}
    </>
  );
};

const deleteLogFileConfirmDescription = [
  "Are you sure you want to delete your log file?",
  "You may lose helpful debugging context.",
  "Consider saving your current logs through the 'Share' button. before deleting.",
].join( " " );
const legacyLogFileDescription = [
  "It looks like you have a log file from an older version of the app.",
  "App logs will no longer get added to this file, but you still may view and export this file.",
  "These files incidentally got a little too big sometimes, so you may want to use the button",
  "below to delete it and free up storage.",
].join( " " );
const LogOptions = ( ) => {
  const [hasLegacylogFile, setHasLegacylogFile] = useState<null | boolean>( null );
  useEffect( () => {
    getLegacyLogfileExists().then( exists => setHasLegacylogFile( exists ) );
  }, [] );

  // sharing our rolling logs involves writing a temp aggregate file, so
  // we need to make sure we enforce one "share" at a time
  const [isSharing, setIsSharing] = useState( false );

  const navigation = useNavigation();
  const [deleteLogFileModalOpen, setDeleteLogFileModalOpen] = useState( false );

  const closeModal = () => setDeleteLogFileModalOpen( false );
  return (
    <>
      <H1>Application Logs</H1>
      <Button
        onPress={() => navigation.navigate( "Log" )}
        text="LOG"
        className="mb-5"
      />
      <Button
        onPress={async () => {
          setIsSharing( true );
          await emailRecentLogs();
          setIsSharing( false );
        }}
        disabled={isSharing}
        text={t( "EMAIL-DEBUG-LOGS" )}
        className="mb-5"
      />
      <Button
        onPress={async () => {
          setIsSharing( true );
          await shareRecentLogs();
          setIsSharing( false );
        }}
        disabled={isSharing}
        text={t( "SHARE-DEBUG-LOGS" )}
        className="mb-5"
      />

      {hasLegacylogFile && (
        <>
          <H1>Application Logs (Legacy)</H1>
          <Text className="mb-5">{legacyLogFileDescription}</Text>
          <Button
            onPress={() => navigation.navigate( "Log", { isLegacyLogs: true } )}
            text="LOG"
            className="mb-5"
          />
          <Button
            onPress={emailLegacyLogFile}
            text={t( "EMAIL-DEBUG-LOGS" )}
            className="mb-5"
          />
          <Button
            onPress={shareLegacyLogFile}
            text={t( "SHARE-DEBUG-LOGS" )}
            className="mb-5"
          />
          <Button
            onPress={() => setDeleteLogFileModalOpen( true )}
            text="DELETE LOG FILE"
            className="mb-5"
          />
        </>
      )}
      {deleteLogFileModalOpen && (
        <WarningSheet
          onPressClose={() => closeModal()}
          headerText="Delete Log File?"
          text={deleteLogFileConfirmDescription}
          handleSecondButtonPress={() => closeModal()}
          secondButtonText="Cancel"
          confirm={() => {
            deleteLegacyLogFile();
            closeModal();
          }}
          buttonText="Delete Log File"
          loading={false}
        />
      )}
    </>
  );
};

const ComputerVisionStats = () => {
  return (
    <>
      <H1>Computer Vision</H1>
      <View className="flex-row">
        <Text className="font-bold">Model: </Text>
        <Text selectable>{modelFileName}</Text>
      </View>
      <View className="flex-row">
        <Text className="font-bold">Taxonomy: </Text>
        <Text selectable>{taxonomyFileName}</Text>
      </View>
      <View className="flex-row mb-5">
        <Text className="font-bold">Geomodel: </Text>
        <Text selectable>{geomodelFileName}</Text>
      </View>
    </>
  );
};

const DebugTools = () => {
  const navigation = useNavigation();

  const toggleRTLandLTR = async () => {
    const { isRTL, forceRTL } = I18nManager;
    await forceRTL( !isRTL );
    RNRestart.restart();
  };
  return (
    <>
      <H1>Debug tools</H1>
      <Button
        onPress={() => navigation.navigate( "LoginStackNavigator" )}
        text="LOG IN AGAIN"
        className="mb-5"
      />
      { // eslint-disable-next-line no-undef
        __DEV__ && (
          <>
            <Button
              onPress={() => navigation.navigate( "UILibrary" )}
              text="UI LIBRARY"
              className="mb-5"
            />
            <Button
              onPress={() => { throw new Error( "Test error" ); }}
              text="TEST ERROR"
              className="mb-5"
            />
            <Button
              onPress={() => {
                throw new INatApiError( {
                  error: "Test error",
                  status: 422,
                  context: {
                    routeName: "MyObservations",
                    timestamp: new Date().toISOString(),
                  },
                } );
              }}
              text="TEST INATAPIERROR"
              className="mb-5"
            />
            <Button
              onPress={() => {
                throw new INatApiTooManyRequestsError( {
                  routeName: "TaxonDetails",
                  timestamp: new Date().toISOString(),
                } );
              }}
              text="TEST API TOO MANY REQUESTS ERROR"
              className="mb-5"
            />
            <Button
              onPress={async () => { throw new Error( "Test error in promise" ); }}
              text="TEST UNHANDLED PROMISE REJECTION"
              className="mb-5"
            />
            <Button
              onPress={toggleRTLandLTR}
              text="TOGGLE RTL<>LTR"
              className="mb-5"
            />
          </>
        )
      }
    </>
  );
};

const PathStats = () => {
  return (
    <>
      <H1>Paths</H1>
      <H2>Documents</H2>
      <P>
        <CODE>{DocumentDirectoryPath}</CODE>
      </P>
      <H2>Caches</H2>
      <P>
        <CODE>{CachesDirectoryPath}</CODE>
      </P>
      <H2>Config.API_URL</H2>
      <P>
        <CODE>{Config.API_URL}</CODE>
      </P>
      <H2>Config.API_URL</H2>
      <P>
        <CODE>{Config.API_URL}</CODE>
      </P>
      <H2>getUserAgent()</H2>
      <P>
        <CODE>{getUserAgent()}</CODE>
      </P>
    </>
  );
};

const Developer = () => {
  return (
    <ScrollViewWrapper>
      <View className="p-5">
        <LogOptions />
        <DebugTools />
        <ComputerVisionStats />
        <FeatureFlags />
        <PathStats />
        <AppFileSizes />
      </View>

    </ScrollViewWrapper>
  );
};

export default Developer;
