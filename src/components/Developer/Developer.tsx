/* eslint-disable arrow-body-style */
/* eslint-disable i18next/no-literal-string */
import {
  CachesDirectoryPath,
  DocumentDirectoryPath,
} from "@dr.pogodin/react-native-fs";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { INatApiError, INatApiTooManyRequestsError } from "api/error";
import { getUserAgent } from "api/userAgent";
import classnames from "classnames";
import { GOOD_OBSERVATION_SHEET_KEY } from "components/Camera/AICamera/GoodObservationSheet";
import {
  Body2,
  Button,
  ScrollViewWrapper,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { TabStackScreenProps } from "navigation/types";
import React, { useState } from "react";
import {
  I18nManager, Platform, Text,
} from "react-native";
import Config from "react-native-config";
import { Switch } from "react-native-paper";
import RNRestart from "react-native-restart";
import { EnvConfig } from "sharedHelpers/envConfig";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

import {
  CODE, H1, H2, P,
} from "./DeveloperSharedComponents";
import EnvironmentSwitcher from "./EnvironmentSwitcher";
import FeatureFlags from "./FeatureFlags";
import type { DirectoryEntrySize } from "./hooks/useAppSize";
import useAppSize, {
  formatAppSizeString, formatSizeUnits, getTotalDirectorySize,
} from "./hooks/useAppSize";
import {
  emailRecentLogs,
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

const LogOptions = ( ) => {
  // sharing our rolling logs involves writing a temp aggregate file, so
  // we need to make sure we enforce one "share" at a time
  const [isSharing, setIsSharing] = useState( false );

  const navigation = useNavigation();
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
  const navigation = useNavigation<TabStackScreenProps<"Debug">["navigation"]>();
  const toggleDebugMode = useStore( state => state.layout.toggleDebugMode );

  const toggleRTLandLTR = async () => {
    const { isRTL, forceRTL } = I18nManager;
    await forceRTL( !isRTL );
    RNRestart.restart();
  };
  return (
    <>
      <H1>Debug tools</H1>
      <Button
        onPress={() => {
          toggleDebugMode();
          navigation.dispatch(
            // reset to Menu at least so we don't awkwardly send you back to About
            CommonActions.reset( {
              index: 0,
              routes: [{ name: "Menu" }],
            } ),
          );
        }}
        text="DISABLE DEBUG MODE"
        className="mb-5"
      />
      <Button
        onPress={() => navigation.navigate( "LoginStackNavigator" )}
        text="LOG IN AGAIN"
        className="mb-5"
      />
      {__DEV__ && (
        <>
          <Button
            onPress={() => navigation.navigate( "SuggestionsHarness" )}
            text="SUGGESTIONS HARNESS"
            className="mb-5"
          />
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
      )}
    </>
  );
};

const ONE_TIME_TIPS = [
  { key: GOOD_OBSERVATION_SHEET_KEY, label: "AI camera good-observation sheet" },
];

const OneTimeTips = () => {
  const shownOnce = useStore( state => state.layout.shownOnce );
  const setShownOnce = useStore( state => state.layout.setShownOnce );
  const unsetShownOnce = useStore( state => state.layout.unsetShownOnce );
  return (
    <>
      <H1>One-time tips</H1>
      <P>Switch off to show a tip again. Signing out also resets these.</P>
      {ONE_TIME_TIPS.map( ( { key, label } ) => (
        <View key={key} className="flex-row items-center border-b border-lightGray py-3 mb-5">
          <Body2 className="flex-1 mr-3">{`${label} shown`}</Body2>
          <Switch
            value={!!shownOnce[key]}
            onValueChange={shown => ( shown
              ? setShownOnce( key )
              : unsetShownOnce( key ) )}
            color={colors.inatGreen}
            accessibilityLabel={`${label} shown`}
            testID={`OneTimeTips.${key}.switch`}
          />
        </View>
      ) )}
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
      <H2>EnvConfig.API_URL (active)</H2>
      <P>
        <CODE>{EnvConfig.API_URL}</CODE>
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
        <EnvironmentSwitcher />
        <ComputerVisionStats />
        <FeatureFlags />
        <OneTimeTips />
        <PathStats />
        <AppFileSizes />
      </View>

    </ScrollViewWrapper>
  );
};

export default Developer;
