

// @flow

import React, { useState } from "react";
import { Text, Pressable, View } from "react-native";
import AudioRecorderPlayer, {
  // AVEncoderAudioQualityIOSType,
  // AVEncodingOption,
  // AudioEncoderAndroidType,
  // AudioSet,
  // AudioSourceAndroidType
 } from "react-native-audio-recorder-player";
 import type { Node } from "react";
 import { useTranslation } from "react-i18next";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { viewStyles, textStyles } from "../../styles/soundRecorder/soundRecorder";

// needs to be outside of the component for stopRecorder to work correctly
const audioRecorderPlayer = new AudioRecorderPlayer( );

const SoundRecorder = ( ): Node => {
  const { t } = useTranslation( );
  // TODO: add Android permissions
  // https://www.npmjs.com/package/react-native-audio-recorder-player
  const [sound, setSound] = useState( {
    isLoggingIn: false,
    recordSecs: 0,
    recordTime: "00:00:00",
    currentPositionSec: 0,
    currentDurationSec: 0,
    playTime: "00:00:00",
    duration: "00:00:00"
  } );
  const [uri, setUri] = useState( null );
  const [status, setStatus] = useState( "notStarted" );

  audioRecorderPlayer.setSubscriptionDuration( 0.09 ); // optional. Default is 0.1

  const startRecording = async ( ) => {
    try {
      const audioFile = await audioRecorderPlayer.startRecorder( );
      audioRecorderPlayer.addRecordBackListener( ( e ) => {
        setSound( {
          ...sound,
          recordSecs: e.currentPosition,
          recordTime: audioRecorderPlayer.mmssss(
            Math.floor( e.currentPosition ),
          )
        } );
        return;
      } );
      setUri( audioFile );
    } catch ( e ) {
      console.log( "couldn't start sound recorder:", e );
    }
  };

  const stopRecording = async ( ) => {
    try {
      await audioRecorderPlayer.stopRecorder( );
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
      await audioRecorderPlayer.startPlayer( uri );
      setStatus( "recording" );
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

  const pausePlayback = async ( ) => {
    try {
      await audioRecorderPlayer.pausePlayer( );
    } catch ( e ) {
      console.log( "can't pause recording player: ", e );
    }
  };

  const stopPlayback = async ( ) => {
    console.log( "onStopPlay" );
    audioRecorderPlayer.stopPlayer( );
    audioRecorderPlayer.removePlayBackListener( );
  };

  // console.log( uri, sound, "audio file" );

  const renderHelpText = ( ) => {
    if ( status === "notStarted" ) {
      return t( "Press-Record-to-Start" );
    } else if ( status === "recording" ) {
      return t( "Recording-Sound" );
    } else if ( status === "paused" ) {
      return ( t( "Paused" ) );
    } else if ( status === "playing" ) {
      return ( t( "Playing-Sound" ) );
    }
  };

  return (
    <ViewWithFooter>
      <View style={viewStyles.center}>
        <View>
          <Text style={textStyles.alignCenter}>{ t( "Record-new-sound" ) }</Text>
          <Text style={[textStyles.alignCenter, textStyles.duration]}>{sound.recordTime}</Text>
        </View>
        <View>
          <Text>insert visualization here</Text>
        </View>
        <View>
          <Text>{renderHelpText( )}</Text>
          <Pressable
            onPress={startRecording}
          >
            <Text>start recording</Text>
          </Pressable>
          <Pressable
            onPress={stopRecording}
          >
            <Text>stop recording</Text>
          </Pressable>
          <Pressable
            onPress={playRecording}
          >
            <Text>play</Text>
          </Pressable>
          <Pressable
            onPress={pausePlayback}
          >
            <Text>pause</Text>
          </Pressable>
          <Pressable
            onPress={stopPlayback}
          >
            <Text>stop</Text>
          </Pressable>
          <Pressable
            onPress={( ) => console.log( "nav to obs edit" )}
          >
            <Text>{ t( "Finish" )}</Text>
          </Pressable>
        </View>
      </View>
    </ViewWithFooter>
  );
};

export default SoundRecorder;
