// @flow

import { useNavigation } from "@react-navigation/native";
import PlaceholderText from "components/PlaceholderText";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import type { Node } from "react";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
// $FlowFixMe
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import Observation from "realmModels/Observation";
import useTranslation from "sharedHooks/useTranslation";
import useStore from "stores/useStore";
import { textStyles, viewStyles } from "styles/soundRecorder/soundRecorder";

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

  const startRecording = async () => {
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
  };

  const resumeRecording = async () => {
    try {
      await audioRecorderPlayer.resumeRecorder();
      setStatus( "recording" );
    } catch ( e ) {
      console.warn( "couldn't resume sound recorder:", e );
    }
  };

  const stopRecording = async () => {
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
  };

  const playRecording = async () => {
    try {
      setStatus( "playing" );
      await audioRecorderPlayer.startPlayer( uri );
      audioRecorderPlayer.addPlayBackListener( e => {
        setSound( {
          ...sound,
          currentPositionSec: e.currentPosition,
          currentDurationSec: e.duration,
          playTime: audioRecorderPlayer.mmssss( Math.floor( e.currentPosition ) ),
          duration: audioRecorderPlayer.mmssss( Math.floor( e.duration ) )
        } );
      } );
    } catch ( e ) {
      console.warn( "can't play recording: ", e );
    }
  };

  const stopPlayback = async () => {
    audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
    setStatus( "paused" );
  };

  const renderRecordButton = () => {
    if ( status === "notStarted" ) {
      return (
        <Pressable accessibilityRole="button" onPress={startRecording}>
          <Text style={[textStyles.alignCenter, textStyles.duration]}>
            {t( "Press-Record-to-Start" )}
          </Text>
        </Pressable>
      );
    }
    if ( status === "paused" ) {
      return (
        <Pressable accessibilityRole="button" onPress={resumeRecording}>
          <Text style={[textStyles.alignCenter, textStyles.duration]}>
            {t( "Paused" )}
          </Text>
        </Pressable>
      );
    }
    if ( status === "playing" ) {
      return (
        <Text style={[textStyles.alignCenter, textStyles.duration]}>
          {t( "Playing-Sound" )}
        </Text>
      );
    }
    return (
      <Pressable accessibilityRole="button" onPress={stopRecording}>
        <PlaceholderText
          text="stop"
          style={[textStyles.alignCenter, textStyles.duration]}
        />
      </Pressable>
    );
  };

  const renderPlaybackButton = () => {
    if ( status === "paused" ) {
      return (
        <Pressable
          accessibilityRole="button"
          onPress={playRecording}
          style={viewStyles.playbackButton}
        >
          <Text>{t( "Play" )}</Text>
        </Pressable>
      );
    }
    if ( status === "playing" ) {
      return (
        <Pressable
          accessibilityRole="button"
          onPress={stopPlayback}
          style={viewStyles.playbackButton}
        >
          <PlaceholderText text="stop" />
        </Pressable>
      );
    }
    // TODO does this ever have a status value that isn't paused or playing?
    return <View />;
  };

  const navToObsEdit = () => {
    addSound();
    navigation.navigate( "ObsEdit" );
  };

  return (
    <ViewWrapper>
      <View style={viewStyles.center}>
        <Text style={[textStyles.alignCenter, textStyles.duration]}>
          {sound.recordTime}
        </Text>
        <View>{/* TODO: add visualization for sound recording */}</View>
        <View>
          <View style={viewStyles.recordButtonRow}>
            {renderPlaybackButton()}
            {renderRecordButton()}
            <Pressable accessibilityRole="button" onPress={navToObsEdit}>
              <Text>{t( "Finish" )}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ViewWrapper>
  );
};

export default SoundRecorder;
