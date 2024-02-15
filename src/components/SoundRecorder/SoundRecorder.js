// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Body1,
  Heading1,
  INatIconButton,
  MediaNavButtons,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, StatusBar } from "react-native";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import Observation from "realmModels/Observation";
import useTranslation from "sharedHooks/useTranslation";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

// needs to be outside of the component for stopRecorder to work correctly
const audioRecorderPlayer = new AudioRecorderPlayer();

const SoundRecorder = (): Node => {
  const setObservations = useStore( state => state.setObservations );
  const navigation = useNavigation();
  const { t } = useTranslation();
  // https://www.npmjs.com/package/react-native-audio-recorder-player
  const [sound, setSound] = useState( {
    // recording
    recordSecs: 0,
    recordTime: "00:00:00",
    currentMetering: 0,
    // playback
    currentPositionSec: 0,
    currentDurationSec: 0,
    playTime: "00:00:00",
    duration: "00:00:00"
  } );
  const [uri, setUri] = useState( null );

  // notStarted, recording, paused, or playing
  const [status, setStatus] = useState( "notStarted" );

  audioRecorderPlayer.setSubscriptionDuration( 0.09 ); // optional. Default is 0.1

  const addSound = async ( ) => {
    const newObservation = await Observation.createObsWithSounds( );
    setObservations( [newObservation] );
  };

  const startRecording = useCallback( async () => {
    try {
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
    } catch ( e ) {
      console.warn( "couldn't start sound recorder:", e );
    }
  }, [sound] );

  const resumeRecording = useCallback( async () => {
    try {
      await audioRecorderPlayer.resumeRecorder();
      setStatus( "recording" );
    } catch ( e ) {
      console.warn( "couldn't resume sound recorder:", e );
    }
  }, [] );

  const stopRecording = useCallback( async () => {
    try {
      await audioRecorderPlayer.stopRecorder();
      setStatus( "paused" );
      audioRecorderPlayer.removeRecordBackListener();
      setSound( {
        ...sound,
        recordSecs: 0
      } );
    } catch ( e ) {
      console.warn( "couldn't stop sound recorder:", e );
    }
  }, [sound] );

  // const playRecording = async () => {
  //   try {
  //     setStatus( "playing" );
  //     await audioRecorderPlayer.startPlayer( uri );
  //     audioRecorderPlayer.addPlayBackListener( e => {
  //       setSound( {
  //         ...sound,
  //         currentPositionSec: e.currentPosition,
  //         currentDurationSec: e.duration,
  //         playTime: audioRecorderPlayer.mmssss( Math.floor( e.currentPosition ) ),
  //         duration: audioRecorderPlayer.mmssss( Math.floor( e.duration ) )
  //       } );
  //     } );
  //   } catch ( e ) {
  //     console.warn( "can't play recording: ", e );
  //   }
  // };

  // const stopPlayback = async () => {
  //   audioRecorderPlayer.stopPlayer();
  //   audioRecorderPlayer.removePlayBackListener();
  //   setStatus( "paused" );
  // };

  // const renderPlaybackButton = () => {
  //   if ( status === "paused" ) {
  //     return (
  //       <Pressable
  //         accessibilityRole="button"
  //         onPress={playRecording}
  //         style={viewStyles.playbackButton}
  //       >
  //         <Text>{t( "Play" )}</Text>
  //       </Pressable>
  //     );
  //   }
  //   if ( status === "playing" ) {
  //     return (
  //       <Pressable
  //         accessibilityRole="button"
  //         onPress={stopPlayback}
  //         style={viewStyles.playbackButton}
  //       >
  //         <PlaceholderText text="stop" />
  //       </Pressable>
  //     );
  //   }
  //   // TODO does this ever have a status value that isn't paused or playing?
  //   return <View />;
  // };

  const navToObsEdit = () => {
    addSound();
    navigation.navigate( "ObsEdit" );
  };

  const captureButton = useMemo( ( ) => {
    let onPress = startRecording;
    let icon = "microphone";
    let accessibilityLabel = t( "Record-verb" );
    let accessibilityHint = t( "Starts-recording-sound" );
    if ( status === "recording" ) {
      onPress = stopRecording;
      icon = "pause";
      accessibilityLabel = t( "Pause-verb" );
      accessibilityHint = t( "Pauses-recording-sound" );
    } else if ( status === "paused" ) {
      onPress = resumeRecording;
    }

    return (
      <INatIconButton
        onPress={onPress}
        backgroundColor={colors.red}
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
    resumeRecording,
    startRecording,
    stopRecording,
    status,
    t
  ] );

  return (
    <ViewWrapper wrapperClassName="bg-black justify-between">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View className="flex-1 items-center justify-center">
        <Heading1 className="text-white">
          {sound.recordTime}
        </Heading1>
        <Body1 className="text-gray">{uri}</Body1>
        <View className="absolute right-5 bottom-5">
          <INatIconButton
            icon="play"
            onPress={( ) => Alert.alert( "Open the MediaViewer or something custom?" )}
            accessibilityLabel="Play"
            color="white"
          />
        </View>
      </View>
      <View>{/* TODO: add visualization for sound recording */}</View>
      <MediaNavButtons
        captureButton={captureButton}
        onConfirm={navToObsEdit}
        onClose={( ) => navigation.goBack( )}
        mediaCaptured={!!sound}
      />
    </ViewWrapper>
  );
};

export default SoundRecorder;
