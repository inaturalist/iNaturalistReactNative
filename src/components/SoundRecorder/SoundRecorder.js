// @flow

import { useNavigation } from "@react-navigation/native";
import PlaceholderText from "components/PlaceholderText";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import { UploadContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
// $FlowFixMe
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import { textStyles, viewStyles } from "styles/soundRecorder/soundRecorder";

// needs to be outside of the component for stopRecorder to work correctly
const audioRecorderPlayer = new AudioRecorderPlayer( );

const SoundRecorder = ( ): Node => {
  const { addSound } = useContext( UploadContext );
  const navigation = useNavigation( );
  const { t } = useTranslation( );
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
      const cachedFile = await audioRecorderPlayer.startRecorder( null, null, true );
      setStatus( "recording" );
      audioRecorderPlayer.addRecordBackListener( e => {
        setSound( {
          ...sound,
          recordSecs: e.currentPosition,
          recordTime: audioRecorderPlayer.mmssss(
            Math.floor( e.currentPosition )
          ),
          currentMetering: e.currentMetering
        } );
      } );
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
          <Text style={[textStyles.alignCenter, textStyles.duration]}>
            {t( "Press-Record-to-Start" )}
          </Text>
        </Pressable>
      );
    } if ( status === "paused" ) {
      return (
        <Pressable
          onPress={resumeRecording}
        >
          <Text style={[textStyles.alignCenter, textStyles.duration]}>{t( "Paused" )}</Text>
        </Pressable>
      );
    } if ( status === "playing" ) {
      return (
        <Text style={[textStyles.alignCenter, textStyles.duration]}>
          {t( "Playing-Sound" )}
        </Text>
      );
    }
    return (
      <Pressable
        onPress={stopRecording}
      >
        <PlaceholderText text="stop" style={[textStyles.alignCenter, textStyles.duration]} />
      </Pressable>
    );
  };

  const renderPlaybackButton = ( ) => {
    if ( status === "paused" ) {
      return (
        <Pressable
          onPress={playRecording}
          style={viewStyles.playbackButton}
        >
          <Text>{t( "Play" )}</Text>
        </Pressable>
      );
    } if ( status === "playing" ) {
      return (
        <Pressable
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
