/* eslint-disable max-len */
/* eslint-disable i18next/no-literal-string */
import {
  CachesDirectoryPath,
  DocumentDirectoryPath,
} from "@dr.pogodin/react-native-fs";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { INatApiError, INatApiTooManyRequestsError } from "api/error";
import { getUserAgent } from "api/userAgent";
import classnames from "classnames";
import {
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
import RNRestart from "react-native-restart";
import { EnvConfig } from "sharedHelpers/envConfig";
import useStore from "stores/useStore";

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

// Plain list of the camera tips strings, rendered unstyled for review
const getCameraTips = (): [string, [string, string][]][] => [
  [t( "Plants" ), [
    [t( "Whole-plant" ), t( "Step-back-and-get-the-whole-plant-plus-a-bit-of-whats-around-it" )],
    [t( "Leaves" ), t( "Photograph-the-top-and-underside-of-a-leaf-and-where-the-leaves-attach-to-the-stem" )],
    [t( "Flowers-fruit-or-seeds" ), t( "If-the-plant-has-any-get-a-close-up-Identifiers-often-need-these-to-name-the-species" )],
  ]],
  [t( "Birds" ), [
    [t( "Head-beak-and-body" ), t( "Try-to-get-the-head-beak-and-body-in-focus-Their-shapes-say-a-lot-about-what-kind-of-bird-it-is" )],
    [t( "Colors-and-markings" ), t( "Look-for-wing-bars-eye-rings-and-patterns-on-the-breast-Similar-species-often-differ-in-just-these" )],
    [t( "Keep-it-sharp" ), t( "Zoom-in-as-far-as-you-can-without-the-photo-getting-blurry-A-clear-photo-from-farther-away-is-more" )],
  ]],
  [t( "Mammals" ), [
    [t( "Whole-body-from-the-side--mammals" ), t( "Size-shape-and-tail-length-can-tell-identifiers-a-lot-especially-for-larger-mammals" )],
    [t( "Face-ears-and-markings" ), t( "Get-images-of-any-markings-or-patterns-and-the-ear-shape-if-you-can-Keep-your-distance" )],
    [t( "Tracks-and-scat" ), t( "These-count-too-Put-something-near-them-for-scale-like-a-coin-or-your-shoe" )],
  ]],
  [t( "Reptiles" ), [
    [t( "Back-and-full-body" ), t( "Photograph-the-whole-animal-from-above-so-its-colors-and-pattern-show" )],
    [t( "Head-from-top-and-side--reptiles" ), t( "This-matters-most-for-snakes-since-the-scales-on-the-head-are-often-what-identifiers-use-to-name" )],
    [t( "Stay-safe" ), t( "Dont-handle-or-corner-the-animal-A-photo-from-a-safe-distance-is-still-useful-even-if-its-not" )],
  ]],
  [t( "Amphibians" ), [
    [t( "Back-of-the-animal" ), t( "Photograph-it-from-above-to-show-its-pattern-and-skin-texture" )],
    [t( "Head-from-top-and-side--amphibians" ), t( "Get-the-eyes-snout-and-any-markings-in-the-shot" )],
    [t( "If-you-can-the-feet" ), t( "Identifiers-sometimes-count-toes-so-try-to-show-the-feet-If-that-would-disturb-the-animal-skip-it" )],
  ]],
  [t( "Arachnids" ), [
    [t( "Top-view--arachnids" ), t( "Photograph-the-body-from-above-showing-the-abdomen-and-leg-markings" )],
    [t( "Eyes-and-face" ), t( "For-spiders-try-a-head-on-shot-The-way-the-eyes-are-arranged-can-help-identify-the-family" )],
    [t( "Web-burrow-or-surroundings" ), t( "Include-photos-of-the-web-burrow-or-where-you-found-it" )],
  ]],
  [t( "Insects" ), [
    [t( "Top-and-side-views" ), t( "Show-the-body-shape-and-wing-patterns-For-butterflies-try-to-get-the-underside-of-the-wings-too" )],
    [t( "Antennae-legs-and-wings" ), t( "Close-ups-of-these-including-the-veins-on-clear-wings-help-identifiers-sort-out-similar-groups" )],
    [t( "Host-plant" ), t( "For-caterpillars-and-other-plant-feeders-include-a-photo-of-the-plant-theyre-on" )],
  ]],
  [t( "Mollusks" ), [
    [t( "Shell-from-several-angles" ), t( "Photograph-the-top-the-side-and-the-opening-or-hinge-For-chitons-show-the-plates-and-the-band" )],
    [t( "No-shell-Show-the-body" ), t( "For-slugs-photograph-the-right-side-where-the-breathing-hole-is" )],
    [t( "Body-parts-and-colors" ), t( "Photograph-tentacles-gills-and-the-foot-Their-colors-matter-for-sea-slugs-squid-and-more" )],
  ]],
  [t( "Crustaceans" ), [
    [t( "Top-view--crustaceans" ), t( "Photograph-the-whole-body-from-above" )],
    [t( "Claws-and-legs" ), t( "Show-their-size-color-and-shape-Similar-crabs-often-differ-here" )],
    [t( "Leave-it-where-you-found-it" ), t( "Dont-pry-crabs-off-rocks-If-you-lift-a-rock-to-look-underneath-put-it-back-gently" )],
  ]],
  [t( "Fungi" ), [
    [t( "Top-of-the-cap" ), t( "Show-the-color-and-texture-of-the-cap-and-its-shape" )],
    [t( "Underside" ), t( "Photograph-the-gills-pores-or-teeth-under-the-cap-Most-mushrooms-cant-be-identified-without-this" )],
    [t( "Stem-and-what-it-grows-on" ), t( "Show-the-very-base-even-if-its-partly-buried-and-whether-its-growing-on-wood-soil-or-leaves" )],
  ]],
  [t( "Fishes" ), [
    [t( "Whole-body-from-the-side--fishes" ), t( "Include-every-fin-and-the-tail-spread-if-you-can-For-flat-fish-like-rays-shoot-from-above-instead" )],
    [t( "Head-close-up" ), t( "Get-the-mouth-eyes-and-any-markings-on-the-head" )],
    [t( "Colors-and-patterns" ), t( "Spots-stripes-and-bars-are-often-what-tells-similar-species-apart" )],
  ]],
  [t( "Echinoderms" ), [
    [t( "Top-view--echinoderms" ), t( "Show-the-full-shape-and-colors-For-sea-stars-include-every-arm" )],
    [t( "Spines-and-texture" ), t( "Get-close-ups-of-the-surface-Small-details-can-separate-similar-sea-stars-and-urchins" )],
    [t( "Keep-it-underwater" ), t( "Photograph-it-in-place-Dont-lift-it-out-of-the-water-or-pry-it-off-rocks" )],
  ]],
];

const CameraTipsStrings = ( ) => (
  <>
    <H1>Camera tips strings</H1>
    {getCameraTips( ).map( ( [heading, tips] ) => (
      <View key={heading} className="mb-5">
        <Text>{heading}</Text>
        {tips.map( ( [title, body] ) => (
          <View key={title}>
            <Text>{title}</Text>
            <Text>{body}</Text>
          </View>
        ) )}
      </View>
    ) )}
  </>
);

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
        <CameraTipsStrings />
        <FeatureFlags />
        <PathStats />
        <AppFileSizes />
      </View>

    </ScrollViewWrapper>
  );
};

export default Developer;
