

// @flow

import React, { useContext, useState, useEffect } from "react";
import { Text, Pressable, View, Platform, PermissionsAndroid } from "react-native";
// $FlowFixMe
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import type { Node } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { viewStyles, textStyles } from "../../styles/soundRecorder/soundRecorder";
import { ObsEditContext } from "../../providers/contexts";

// needs to be outside of the component for stopRecorder to work correctly
const audioRecorderPlayer = new AudioRecorderPlayer( );

const SoundRecorder = ( ): Node => {
  const { addSound } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  // TODO: add Android permissions
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

  const checkAndroidPermissions = async ( ) => {
    if ( Platform.OS === "android" ) {
      try {
        const grants = await PermissionsAndroid.requestMultiple( [
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        ] );

        if (
          grants["android.permission.WRITE_EXTERNAL_STORAGE"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants["android.permission.READ_EXTERNAL_STORAGE"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants["android.permission.RECORD_AUDIO"] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log( "Permissions granted" );
        } else {
          console.log( "All required permissions not granted" );
          return;
        }
      } catch ( err ) {
        console.warn( err );
        return;
      }
    }
  };

  useEffect( ( ) => {
    navigation.addListener( "focus", async ( )  => {
      await checkAndroidPermissions( );
    } );
  }, [navigation] );

  const startRecording = async ( ) => {
    try {
      const cachedFile = await audioRecorderPlayer.startRecorder( null, null, true );
      setStatus( "recording" );
      audioRecorderPlayer.addRecordBackListener( ( e ) => {
        setSound( {
          ...sound,
          recordSecs: e.currentPosition,
          recordTime: audioRecorderPlayer.mmssss(
            Math.floor( e.currentPosition ),
          ),
          currentMetering: e.currentMetering
        } );
        return;
      } );
      console.log( cachedFile, "cached file in sound recorder" );
      setUri( cachedFile );
    } catch ( e ) {
      console.log( "couldn't start sound recorder:", e );
    }
  };

  const resumeRecording = async ( ) => {
    try {
      await audioRecorderPlayer.resumeRecorder( );
      setStatus( "recording" );
    } catch ( e ) {
      console.log( "couldn't resume sound recorder:", e );
    }
  };

  const stopRecording = async ( ) => {
    try {
      await audioRecorderPlayer.stopRecorder( );
      setStatus( "paused" );
      audioRecorderPlayer.removeRecordBackListener( );
      setSound( {
        ...sound,
        recordSecs: 0
      } );
    } catch ( e ) {
      console.log( "couldn't stop sound recorder:", e );
    }
  };

  const playRecording = async ( ) => {
    try {
      setStatus( "playing" );
      await audioRecorderPlayer.startPlayer( uri );
      audioRecorderPlayer.addPlayBackListener( ( e ) => {
        setSound( {
          ...sound,
          currentPositionSec: e.currentPosition,
          currentDurationSec: e.duration,
          playTime: audioRecorderPlayer.mmssss( Math.floor( e.currentPosition ) ),
          duration: audioRecorderPlayer.mmssss( Math.floor( e.duration ) )
        } );
        return;
      } );
    } catch ( e ) {
      console.log( "can't play recording: ", e );
    }
  };

  const stopPlayback = async ( ) => {
    audioRecorderPlayer.stopPlayer( );
    audioRecorderPlayer.removePlayBackListener( );
    setStatus( "paused" );
  };

  const renderRecordButton = ( ) => {
    if ( status === "notStarted" ) {
      return (
        <Pressable
          onPress={startRecording}
        >
          <Text style={[textStyles.alignCenter, textStyles.duration]}>start</Text>
        </Pressable>
      );
    } else if ( status === "paused" ) {
      return (
        <Pressable
          onPress={resumeRecording}
        >
          <Text style={[textStyles.alignCenter, textStyles.duration]}>resume</Text>
        </Pressable>
      );
    } else if ( status === "playing" ) {
      return <Text style={[textStyles.alignCenter, textStyles.duration]}>playing</Text>;
    } else {
      return (
        <Pressable
          onPress={stopRecording}
        >
          <Text style={[textStyles.alignCenter, textStyles.duration]}>stop</Text>
        </Pressable>
      );
    }
  };

  const renderPlaybackButton = ( ) => {
    if ( status === "paused" ) {
      return (
        <Pressable
          onPress={playRecording}
          style={viewStyles.playbackButton}
        >
          <Text>play</Text>
        </Pressable>
      );
    } else if ( status === "playing" ) {
      return (
        <Pressable
          onPress={stopPlayback}
          style={viewStyles.playbackButton}
        >
          <Text>stop</Text>
        </Pressable>
      );
    }
  };

  const navToObsEdit = ( ) => {
    addSound( );
    navigation.navigate( "ObsEdit" );
  };

  return (
    <ViewWithFooter>
      <View style={viewStyles.center}>
        <View>
          <Text style={textStyles.alignCenter}>{ t( "Record-new-sound" ) }</Text>
          <Text style={[textStyles.alignCenter, textStyles.duration]}>{sound.recordTime}</Text>
        </View>
        <View>
          {/* TODO: add visualization for sound recording */}
          <Text>insert visualization here</Text>
        </View>
        <View>
          <View style={viewStyles.recordButtonRow}>
            {renderPlaybackButton( )}
            {renderRecordButton( )}
            <Pressable
              onPress={navToObsEdit}
            >
              <Text>{ t( "Finish" )}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ViewWithFooter>
  );
};

export default SoundRecorder;
