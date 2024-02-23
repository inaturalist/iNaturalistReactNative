// @flow

import { useNavigation } from "@react-navigation/native";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import {
  Body1,
  BottomSheet,
  Heading1,
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
import useTranslation from "sharedHooks/useTranslation";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

const INITIAL_SOUND = {
  // recording
  recordSecs: 0,
  recordTime: "00:00:00",
  currentMetering: 0,
  // playback
  currentPositionSec: 0,
  currentDurationSec: 0,
  playTime: "00:00:00",
  duration: "00:00:00"
};

const NOT_STARTED = "notStarted";
const RECORDING = "recording";
const STOPPED = "stopped";

const SoundRecorder = (): Node => {
  const audioRecorderPlayerRef = useRef( new AudioRecorderPlayer( ) );
  const audioRecorderPlayer = audioRecorderPlayerRef.current;
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const setObservations = useStore( state => state.setObservations );
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [sound, setSound] = useState( INITIAL_SOUND );
  const [uri, setUri] = useState( null );
  const [helpShown, setHelpShown] = useState( false );
  const [exitWarningShown, setExitWarningShown] = useState( false );
  const [resetWarningShown, setResetWarningShown] = useState( false );

  const [
    status,
    setStatus
  ]: [
    "notStarted" | "recording" | "stopped",
    Function
  ] = useState( NOT_STARTED );

  audioRecorderPlayer.setSubscriptionDuration( 0.09 ); // optional. Default is 0.1

  const addSound = async ( ) => {
    const newObservation = await Observation.createObsWithSoundPath( uri );
    setObservations( [newObservation] );
  };

  const resetRecording = useCallback( ( ) => {
    setSound( INITIAL_SOUND );
    setUri( null );
    setStatus( NOT_STARTED );
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
        recordTime: audioRecorderPlayer.mmssss( Math.floor( e.currentPosition ) ),
        currentMetering: e.currentMetering
      } );
    } );
    setUri( cachedFile );
  }, [audioRecorderPlayer, sound] );

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
      />
    );
  }, [
    startRecording,
    stopRecording,
    status,
    t
  ] );

  const sounds = uri
    ? [{ file_url: uri, uuid: "fake-uuid" }]
    : [];

  let helpText = t( "Press-record-to-start" );
  switch ( status ) {
    case RECORDING:
      helpText = t( "Recoding-sound" );
      break;
    case STOPPED:
      helpText = t( "Recording-stopped-Tap-play-the-current-recording" );
      break;
    default:
      helpText = t( "Press-record-to-start" );
  }

  return (
    <ViewWrapper wrapperClassName="bg-black justify-between">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View className="flex-1 items-center justify-center">
        <Heading1 className="text-white">
          {sound.recordTime}
        </Heading1>
        {/*
          <Body1 className="text-gray">{uri}</Body1>
        */}
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
      <View>{/* TODO: add visualization for sound recording */}</View>
      <View className="justify-center h-[60px]">
        <Body1 className="text-white text-center p-2">{helpText}</Body1>
      </View>
      <MediaNavButtons
        captureButton={captureButton}
        onConfirm={navToObsEdit}
        onClose={( ) => {
          console.log( "[DEBUG SoundRecorder.js] onClose, uri: ", uri );
          if ( uri ) {
            setExitWarningShown( true );
          } else {
            navigation.goBack( );
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
      />
      <BottomSheet
        headerText="RECORDING SOUNDS"
        hidden={!helpShown}
        handleClose={( ) => setHelpShown( false )}
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
        headerText={t( "DISCARD-SOUND-header" )}
        text={t( "By-exiting-your-recorded-sound-will-not-be-saved" )}
        confirm={( ) => navigation.goBack( )}
        handleClose={( ) => setExitWarningShown( false )}
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
        handleClose={( ) => setResetWarningShown( false )}
        buttonText={t( "RESET-RECORDING" )}
      />
    </ViewWrapper>
  );
};

export default SoundRecorder;
