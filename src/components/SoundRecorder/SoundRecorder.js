

// @flow

import React, { useState } from "react";
import { Text, Pressable, View } from "react-native";
import AudioRecorderPlayer, {
  // AVEncoderAudioQualityIOSType,
  // AVEncodingOption,
  // AudioEncoderAndroidType,
  // AudioSet,
  // AudioSourceAndroidType
  // $FlowFixMe
 } from "react-native-audio-recorder-player";
 import type { Node } from "react";
 import { useTranslation } from "react-i18next";
 import { useNavigation } from "@react-navigation/native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { viewStyles, textStyles } from "../../styles/soundRecorder/soundRecorder";

// needs to be outside of the component for stopRecorder to work correctly
const audioRecorderPlayer = new AudioRecorderPlayer( );

const SoundRecorder = ( ): Node => {
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

  const startRecording = async ( ) => {
    try {
      const audioFile = await audioRecorderPlayer.startRecorder( null, null, true );
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
      setUri( audioFile );
    } catch ( e ) {
      console.log( "couldn't start sound recorder:", e );
    }
  };

  // const pauseRecording = async ( ) => {
  //   try {
  //     await audioRecorderPlayer.pauseRecorder( );
  //     setStatus( "paused" );
  //   } catch ( e ) {
  //     console.log( "couldn't pause sound recorder:", e );
  //   }
  // };

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

  const navToObsEdit = ( ) => navigation.navigate( "ObsEdit", { obsToEdit: [{
      observationSounds: uri
    }]
  } );

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
          <Text style={textStyles.alignCenter}>{renderHelpText( )}</Text>
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
