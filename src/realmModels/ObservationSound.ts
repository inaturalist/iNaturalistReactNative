import { Realm } from "@realm/react";
import type { ApiObservationSound } from "api/types";
import { FileUpload } from "inaturalistjs";
import { Platform } from "react-native";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import * as uuid from "uuid";

import Sound from "./Sound";
import type { RealmObservationSound, RealmSound } from "./types";

class ObservationSound extends Realm.Object {
  _created_at?: Date;

  _synced_at?: Date;

  _updated_at?: Date;

  static OBSERVATION_SOUNDS_FIELDS = {
    id: true,
    uuid: true,
    sound: Sound.SOUND_FIELDS,
  } as const;

  needsSync( ) {
    return !this._synced_at || this._synced_at <= this._updated_at;
  }

  wasSynced( ) {
    return this._synced_at !== null;
  }

  static async new( uri: string ) {
    const sound = await Sound.new( uri );
    return {
      sound,
      uuid: uuid.v4( ),
    };
  }

  static mapApiToRealm( observationSound: ApiObservationSound, realm = null ) {
    const localObsSound = {
      ...observationSound,
      _synced_at: new Date( ),
      sound: Sound.mapApiToRealm( observationSound.sound, realm ),
    };
    return localObsSound;
  }

  static mapSoundForUpload( sound: RealmSound ) {
    const uri = Sound.getLocalSoundUri( sound.file_url );
    const fileExt = Platform.OS === "android"
      ? "mp4"
      : "m4a";

    return {
      file: new FileUpload( {
        uri,
        name: uri?.split( "/" ).pop( ),
        type: `audio/${fileExt}`,
      } ),
    };
  }

  static mapSoundForAttachingToObs(
    id: number,
    observationSound: RealmObservationSound,
  ) {
    return {
      "observation_sound[observation_id]": id,
      "observation_sound[sound_id]": observationSound.id,
      "observation_sound[uuid]": observationSound.uuid,
    };
  }

  static mapObservationSoundForMyObsDefaultMode( obsSound: {
    uuid?: string;
  } ) {
    return {
      uuid: obsSound?.uuid,
    };
  }

  static async deleteLocalObservationSound( realm: Realm, uri: string, obsUUID: string ) {
    // delete uri on disk
    Sound.deleteSoundFromDeviceStorage( uri );
    const realmObs = realm.objectForPrimaryKey( "Observation", obsUUID );
    const obsSoundToDelete = realmObs?.observationSounds
      .find( p => p.file_url === uri );
    if ( obsSoundToDelete ) {
      safeRealmWrite( realm, ( ) => {
        realm?.delete( obsSoundToDelete );
      }, "deleting local observation sound in ObservationSound" );
    }
  }

  static schema = {
    name: "ObservationSound",
    embedded: true,
    properties: {
      // datetime the obsSound was created on the device
      _created_at: "date?",
      // datetime the obsSound was last synced with the server
      _synced_at: "date?",
      // datetime the obsSound was updated on the device (i.e. edited locally)
      _updated_at: "date?",
      uuid: "string",
      id: "int?",
      // file_url: { type: "string", mapTo: "fileUrl" },
      sound: "Sound?",
      // this creates an inverse relationship so observation sounds
      // automatically keep track of which Observation they are assigned to
      assignee: {
        type: "linkingObjects",
        objectType: "Observation",
        property: "observationSounds",
      },
    },
  };
}

export default ObservationSound;
