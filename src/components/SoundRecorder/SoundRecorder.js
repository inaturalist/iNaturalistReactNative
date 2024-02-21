// @flow

import { useNavigation } from "@react-navigation/native";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import {
  Heading1,
  INatIconButton,
  MediaNavButtons,
  ViewWrapper
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

// needs to be outside of the component for stopRecorder to work correctly
// const audioRecorderPlayer = new AudioRecorderPlayer();

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

const SoundRecorder = (): Node => {
  const audioRecorderPlayerRef = useRef( new AudioRecorderPlayer( ) );
  const audioRecorderPlayer = audioRecorderPlayerRef.current;
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const setObservations = useStore( state => state.setObservations );
  const navigation = useNavigation();
  const { t } = useTranslation();
  // https://www.npmjs.com/package/react-native-audio-recorder-player
  const [sound, setSound] = useState( INITIAL_SOUND );
  const [uri, setUri] = useState( null );

  // notStarted, recording, paused, or playing
  const [status, setStatus] = useState( NOT_STARTED );

  audioRecorderPlayer.setSubscriptionDuration( 0.09 ); // optional. Default is 0.1

  const addSound = async ( ) => {
    const newObservation = await Observation.createObsWithSounds( );
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
    setStatus( "recording" );
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

  // const resumeRecording = useCallback( async () => {
  //   try {
  //     await audioRecorderPlayer.resumeRecorder();
  //     setStatus( "recording" );
  //   } catch ( e ) {
  //     console.warn( "couldn't resume sound recorder:", e );
  //   }
  // }, [audioRecorderPlayer] );

  const stopRecording = useCallback( async () => {
    try {
      await audioRecorderPlayer.stopRecorder();
      setStatus( "stopped" );
      audioRecorderPlayer.removeRecordBackListener();
      setSound( {
        ...sound,
        recordSecs: 0
      } );
    } catch ( e ) {
      console.warn( "couldn't stop sound recorder:", e );
    }
  }, [audioRecorderPlayer, sound] );
  // const pauseRecording = useCallback( async () => {
  //   await audioRecorderPlayer.stopRecorder();
  //   setStatus( "paused" );
  // }, [audioRecorderPlayer] );

  const navToObsEdit = () => {
    addSound();
    navigation.navigate( "ObsEdit" );
  };

  const captureButton = useMemo( ( ) => {
    let onPress = startRecording;
    let icon = "microphone";
    let accessibilityLabel = t( "Record-verb" );
    let accessibilityHint = t( "Starts-recording-sound" );
    let backgroundColor = colors.red;
    if ( status === "recording" ) {
      onPress = stopRecording;
      icon = "pause";
      accessibilityLabel = t( "Pause-verb" );
      accessibilityHint = t( "Pauses-recording-sound" );
    } else if ( status === "stopped" ) {
      onPress = resetRecording;
      icon = "rotate-right";
      backgroundColor = colors.darkGray;
    }

    return (
      <INatIconButton
        onPress={onPress}
        backgroundColor={backgroundColor}
        color={colors.white}
        size={33}
        icon={icon}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        width={60}
        height={60}
        mode="contained"
      />
    );
  }, [
    resetRecording,
    startRecording,
    stopRecording,
    status,
    t
  ] );

  const sounds = uri
    ? [{ file_url: uri, uuid: "fake-uuid" }]
    : [];

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
        { uri && (
          <View className="absolute right-5 bottom-5">
            <INatIconButton
              icon="play"
              onPress={( ) => setMediaViewerVisible( true )}
              accessibilityLabel="Play"
              color="white"
            />
          </View>
        ) }
      </View>
      <View>{/* TODO: add visualization for sound recording */}</View>
      <MediaNavButtons
        captureButton={captureButton}
        onConfirm={navToObsEdit}
        onClose={( ) => navigation.goBack( )}
        mediaCaptured={uri}
      />
      <MediaViewerModal
        showModal={mediaViewerVisible}
        onClose={( ) => setMediaViewerVisible( false )}
        sounds={sounds}
      />
    </ViewWrapper>
  );
};

export default SoundRecorder;
