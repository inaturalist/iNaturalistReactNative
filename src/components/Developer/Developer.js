import { useNavigation } from "@react-navigation/native";
import { INatApiError, INatApiTooManyRequestsError } from "api/error";
import { getUserAgent } from "api/userAgent.ts";
import classnames from "classnames";
import {
  Button,
  Heading1,
  Heading2,
  ScrollViewWrapper
} from "components/SharedComponents";
import { fontMonoClass, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useCallback } from "react";
import { I18nManager, Platform, Text } from "react-native";
import Config from "react-native-config";
import RNFS from "react-native-fs";
import RNRestart from "react-native-restart";
import useLogs from "sharedHooks/useLogs";

import useAppSize, {
  formatAppSizeString, formatSizeUnits, getTotalDirectorySize
} from "./hooks/useAppSize";

const H1 = ( { children } ) => <Heading1 className="mt-3 mb-2">{children}</Heading1>;
const H2 = ( { children } ) => <Heading2 className="mt-3 mb-2">{children}</Heading2>;
const P = ( { children } ) => <Text selectable className="mb-2">{children}</Text>;
const CODE = ( { children, optionalClassName } ) => (
  <Text
    selectable
    className={classnames(
      fontMonoClass,
      optionalClassName
    )}
  >
    {children}
  </Text>
);

const modelFileName: string = Platform.select( {
  ios: Config.IOS_MODEL_FILE_NAME,
  android: Config.ANDROID_MODEL_FILE_NAME
} );
const taxonomyFileName = Platform.select( {
  ios: Config.IOS_TAXONOMY_FILE_NAME,
  android: Config.ANDROID_TAXONOMY_FILE_NAME
} );
const geomodelFileName = Platform.select( {
  ios: Config.IOS_GEOMODEL_FILE_NAME,
  android: Config.ANDROID_GEOMODEL_FILE_NAME
} );

/* eslint-disable i18next/no-literal-string */
const Developer = (): Node => {
  const fileSizes = useAppSize( );

  const boldClassname = ( line, isDirectory = false ) => classnames(
    {
      "text-red font-bold": line.includes( "MB" ),
      "text-blue": isDirectory
    }
  );

  const displayFileSizes = useCallback( ( ) => Object.keys( fileSizes ).map( directory => {
    const contents = fileSizes[directory];
    if ( !directory || !contents ) { return null; }
    const totalDirectorySize = formatSizeUnits( getTotalDirectorySize( contents ) );
    return (
      <View key={directory}>
        <H2>
          File Sizes:
          {" "}
          {directory}
        </H2>
        <P>
          <CODE optionalClassName={boldClassname( totalDirectorySize, true )}>
            {`Total Directory Size: ${totalDirectorySize}`}
          </CODE>
        </P>
        {contents.map( ( { name, size } ) => {
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
  } ), [fileSizes] );

  const toggleRTLandLTR = async ( ) => {
    const { isRTL, forceRTL } = I18nManager;
    await forceRTL( !isRTL );
    RNRestart.restart( );
  };

  const navigation = useNavigation( );
  const { shareLogFile, emailLogFile } = useLogs();
  return (
    <ScrollViewWrapper>
      <View className="p-5">
        <Button
          onPress={() => navigation.navigate( "log" )}
          text="LOG"
          className="mb-5"
        />
        {/* TODO: this needs to be restricted to log in the current user and none other */}
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
                      timestamp: new Date().toISOString()
                    }
                  } );
                }}
                text="TEST INATAPIERROR"
                className="mb-5"
              />
              <Button
                onPress={() => {
                  throw new INatApiTooManyRequestsError( {
                    routeName: "TaxonDetails",
                    timestamp: new Date().toISOString()
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
        <H1>Paths</H1>
        <H2>Documents</H2>
        <P>
          <CODE>{RNFS.DocumentDirectoryPath}</CODE>
        </P>
        <H2>Caches</H2>
        <P>
          <CODE>{RNFS.CachesDirectoryPath}</CODE>
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
        {displayFileSizes( )}
        <H1>Log file contents</H1>
        <Button
          level="focus"
          onPress={emailLogFile}
          text={t( "EMAIL-DEBUG-LOGS" )}
          className="mb-5"
        />
        <Button
          onPress={shareLogFile}
          text={t( "SHARE-DEBUG-LOGS" )}
          className="mb-5"
        />
      </View>
    </ScrollViewWrapper>
  );
};

export default Developer;
