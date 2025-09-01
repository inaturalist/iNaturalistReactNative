// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import {
  Body1,
  Body2,
  BottomSheet,
  INatIconButton,
  List2,
  MediaNavButtons,
  P,
  ViewWrapper,
  WarningSheet
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState
} from "react";
import { StatusBar } from "react-native";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import Observation from "realmModels/Observation";
import ObservationSound from "realmModels/ObservationSound";
import Sound from "realmModels/Sound";
import useTranslation from "sharedHooks/useTranslation.ts";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

const INITIAL_SOUND = {
  // recording
  recordSecs: 0,
  recordTime: "00:00"
};

const NOT_STARTED = "notStarted";
const RECORDING = "recording";
const STOPPED = "stopped";

export const MAX_SOUNDS_ALLOWED = 20;

const SoundRecorder = (): Node => {
  const audioRecorderPlayerRef = useRef( new AudioRecorderPlayer( ) );
  const audioRecorderPlayer = audioRecorderPlayerRef.current;
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const setObservations = useStore( state => state.setObservations );
  const navigation = useNavigation( );
  const { params } = useRoute();
  const { t } = useTranslation();
  const [sound, setSound] = useState( INITIAL_SOUND );
  const [uri, setUri] = useState( null );
  const [helpShown, setHelpShown] = useState( false );
  const [exitWarningShown, setExitWarningShown] = useState( false );
  const [resetWarningShown, setResetWarningShown] = useState( false );
  const meteringHistory = useRef( [] );
  const currentObservation = useStore( state => state.currentObservation );
  const observations = useStore( state => state.observations );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const updateObservations = useStore( state => state.updateObservations );

  const [
    status,
    setStatus
  ]: [
    "notStarted" | "recording" | "stopped",
    Function
  ] = useState( NOT_STARTED );

  audioRecorderPlayer.setSubscriptionDuration( 0.09 ); // optional. Default is 0.1

  const addSound = async ( ) => {
    if ( !params.addEvidence ) {
      // New observation with sound
      const newObservation = await Observation.createObsWithSoundPath( uri );
      setObservations( [newObservation] );
    } else {
      // Add new sounds to existing observation
      let updatedCurrentObservation = currentObservation;

      const obsSound = await ObservationSound.new( {
        sound: await Sound.new( { file_url: uri } )
      } );
      updatedCurrentObservation = Observation
        .appendObsSounds( [obsSound], updatedCurrentObservation );

      const updatedObservations = [...observations];
      updatedObservations[currentObservationIndex] = updatedCurrentObservation;
      updateObservations( updatedObservations );
    }
  };

  const resetRecording = useCallback( ( ) => {
    setSound( INITIAL_SOUND );
    setUri( null );
    setStatus( NOT_STARTED );
    meteringHistory.current = [];
  }, [
  ] );

  const startRecording = useCallback( async () => {
    const cachedFile = await audioRecorderPlayer.startRecorder(
      null,
      null,
      true
    );
    setStatus( RECORDING );
    audioRecorderPlayer.addRecordBackListener( e => {
      setSound( {
        ...sound,
        recordSecs: e.currentPosition,
        recordTime: audioRecorderPlayer.mmss( Math.floor( e.currentPosition / 1000 ) )
      } );
      meteringHistory.current.push( [e.currentPosition, e.currentMetering] );
      if ( meteringHistory.current.length > 200 ) {
        meteringHistory.current = meteringHistory.current.slice(
          meteringHistory.current.length - 200,
          meteringHistory.current.length
        );
      }
    } );
    setUri( cachedFile );
  }, [audioRecorderPlayer, meteringHistory, sound] );

  const stopRecording = useCallback( async () => {
    try {
      await audioRecorderPlayer.stopRecorder();
      setStatus( STOPPED );
      audioRecorderPlayer.removeRecordBackListener();
      setSound( {
        ...sound,
        recordSecs: 0
      } );
    } catch ( e ) {
      console.warn( "couldn't stop sound recorder:", e );
    }
  }, [audioRecorderPlayer, sound] );

  const navToObsEdit = async ( ) => {
    await stopRecording( );
    await addSound( );
    navigation.navigate( "ObsEdit" );
  };

  const captureButton = useMemo( ( ) => {
    let onPress = startRecording;
    let icon = "microphone";
    let accessibilityLabel = t( "Record-verb" );
    let accessibilityHint = t( "Starts-recording-sound" );
    let backgroundColor = colors.warningRed;
    let size = 33;
    const style = {};
    if ( status === "recording" ) {
      onPress = stopRecording;
      icon = "stop";
      accessibilityLabel = t( "Stop-verb" );
      accessibilityHint = t( "Stops-recording-sound" );
    } else if ( status === STOPPED ) {
      onPress = ( ) => setMediaViewerVisible( true );
      icon = "play";
      size = 24;
      backgroundColor = colors.darkGray;
      style.paddingLeft = 5;
    }

    return (
      <INatIconButton
        onPress={onPress}
        backgroundColor={backgroundColor}
        color={colors.white}
        size={size}
        icon={icon}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        width={60}
        height={60}
        mode="contained"
        style={style}
      />
    );
  }, [
    startRecording,
    stopRecording,
    status,
    t
  ] );

  const sounds = uri
    ? [{ file_url: uri }]
    : [];

  const helpText = useMemo( ( ) => {
    if ( status === RECORDING ) return t( "Recording-sound" );
    if ( status === STOPPED ) return t( "Recording-stopped-Tap-to-play-the-current-recording" );
    return null;
  }, [status, t] );

  const onBack = () => {
    if ( params.addEvidence ) {
      navigation.navigate( "ObsEdit" );
    } else {
      navigation.navigate( "TabNavigator", {
        screen: "ObservationsTab",
        params: {
          screen: "ObsList"
        }
      } );
    }
  };

  return (
    <ViewWrapper wrapperClassName="bg-black justify-between">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View className="flex-1 items-center justify-center">
        <View className="justify-center items-center w-full h-full">
          { status !== NOT_STARTED && (
            <View className="w-full h-full flex-row items-center overflow-hidden justify-end">
              { meteringHistory.current?.map( item => {
                const [position, metering] = item;
                return (
                  <View
                    key={`metering-${position}`}
                    className="m-0.5 bg-warningRed b-1 w-1 h-full rounded-full"
                    style={{
                      height: `${-100 / metering}%`
                    }}
                  />
                );
              } )}
            </View>
          ) }
        </View>
        { status !== NOT_STARTED && (
          <View className="absolute bottom-5 h-[44px] justify-center">
            <Body2 className="text-white">
              {sound.recordTime}
            </Body2>
          </View>
        ) }
        { status !== RECORDING && (
          <View className="absolute left-5 bottom-5">
            <INatIconButton
              icon="help"
              onPress={( ) => setHelpShown( !helpShown )}
              accessibilityLabel={t( "Reset-verb" )}
              color="white"
            />
          </View>
        ) }
        { uri && status === STOPPED && (
          <View className="absolute right-5 bottom-5">
            <INatIconButton
              icon="rotate-right"
              onPress={( ) => setResetWarningShown( true )}
              accessibilityLabel={t( "Reset-verb" )}
              color="white"
            />
          </View>
        ) }
      </View>
      { helpText && (
        <View className="justify-center h-[60px]">
          <Body1 className="text-white text-center p-2">{helpText}</Body1>
        </View>
      ) }
      <MediaNavButtons
        captureButton={captureButton}
        onConfirm={navToObsEdit}
        onClose={( ) => {
          if ( uri ) {
            setExitWarningShown( true );
          } else {
            onBack();
          }
        }}
        mediaCaptured={uri}
        confirmHidden={status === RECORDING}
        closeHidden={status === RECORDING}
      />
      <MediaViewerModal
        showModal={mediaViewerVisible}
        onClose={( ) => setMediaViewerVisible( false )}
        sounds={sounds}
        autoPlaySound
      />
      <BottomSheet
        headerText="RECORDING SOUNDS"
        hidden={!helpShown}
        onPressClose={( ) => setHelpShown( false )}
      >
        <View className="m-[43px] mt-[20px]">
          <P>
            <Body1>{t( "sound-recorder-help-One-organism" )}</Body1>
            <List2>{t( "sound-recorder-help-Try-to-isolate" )}</List2>
          </P>
          <P>
            <Body1>{t( "sound-recorder-help-Stop-moving" )}</Body1>
            <List2>{t( "sound-recorder-help-Make-sure" )}</List2>
          </P>
          <P>
            <Body1>{t( "sound-recorder-help-Get-closer" )}</Body1>
            <List2>{t( "sound-recorder-help-Get-as-close-as-you-can" )}</List2>
          </P>
          <P>
            <Body1>{t( "sound-recorder-help-Keep-it-short" )}</Body1>
            <List2>{t( "sound-recorder-help-A-recording-of" )}</List2>
          </P>
        </View>
      </BottomSheet>
      <WarningSheet
        hidden={!exitWarningShown}
        headerText={t( "DISCARD-SOUND--question" )}
        text={t( "By-exiting-your-recorded-sound-will-not-be-saved" )}
        confirm={onBack}
        onPressClose={( ) => setExitWarningShown( false )}
        buttonText={t( "DISCARD-RECORDING" )}
      />
      <WarningSheet
        hidden={!resetWarningShown}
        headerText={t( "RESET-SOUND-header" )}
        text={t( "Would-you-like-to-discard-your-current-recording-and-start-over" )}
        confirm={( ) => {
          resetRecording( );
          setResetWarningShown( false );
        }}
        onPressClose={( ) => setResetWarningShown( false )}
        buttonText={t( "RESET-RECORDING" )}
      />
    </ViewWrapper>
  );
};

export default SoundRecorder;
