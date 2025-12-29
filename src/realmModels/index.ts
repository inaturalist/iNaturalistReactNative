import RNFS from "react-native-fs";
import type Realm from "realm";

import Application from "./Application";
import Comment from "./Comment";
import Flag from "./Flag";
import Identification from "./Identification";
import Observation from "./Observation";
import ObservationPhoto from "./ObservationPhoto";
import ObservationSound from "./ObservationSound";
import Photo from "./Photo";
import QueueItem from "./QueueItem";
import Sound from "./Sound";
import Taxon from "./Taxon";
import TaxonPhoto from "./TaxonPhoto";
import User from "./User";
import Vote from "./Vote";

export default {
  schema: [
    Application,
    Comment,
    Flag,
    Identification,
    Observation,
    ObservationPhoto,
    ObservationSound,
    Photo,
    QueueItem,
    Sound,
    Taxon,
    TaxonPhoto,
    User,
    Vote,
  ],
  schemaVersion: 66,
  path: `${RNFS.DocumentDirectoryPath}/db.realm`,
  // https://github.com/realm/realm-js/pull/6076 embedded constraints
  migrationOptions: {
    resolveEmbeddedConstraints: true,
  },
  // TODO: type?
  migration: ( oldRealm: Realm, newRealm: Realm ) => {
    if ( oldRealm.schemaVersion < 59 ) {
      const oldTaxa = oldRealm.objects( "Taxon" );
      const newTaxa = newRealm.objects( "Taxon" );
      for ( const objectIndex of newTaxa.keys() ) {
        const newTaxon = newTaxa[objectIndex];
        const oldTaxon = oldTaxa[objectIndex];
        newTaxon._searchableName = Taxon.compileSearchableName( oldTaxon );
      }
    }
    if ( oldRealm.schemaVersion < 55 ) {
      const newObservations = newRealm.objects( "Observation" );
      for ( const objectIndex of newObservations.keys() ) {
        const newObservation = newObservations[objectIndex];
        newObservation.updateNeedsSync();
      }
    }
    if ( oldRealm.schemaVersion < 52 ) {
      const oldPrefs = oldRealm.objects( "LocalPreferences" );
      const newPrefs = newRealm.objects( "LocalPreferences" );
      //  TODO: type? here and below
      for ( const objectIndex of oldPrefs.keys() ) {
        const newPreference = newPrefs[objectIndex];
        delete newPreference.explore_location_permission_shown;
      }
    }
    if ( oldRealm.schemaVersion < 51 ) {
      // const oldIdentifications = oldRealm.objects( "Identification" );
      // const newIdentifications = newRealm.objects( "Identification" );
      // // loop through all objects and set the new property in the new schema
      // oldIdentifications.keys( ).forEach( objectIndex => {
      //   const oldIdentification = oldIdentifications[objectIndex];
      //   const newIdentification = newIdentifications[objectIndex];
      //   newIdentification.disagreement = oldIdentification.disagreement;
      // } );
    }
    if ( oldRealm.schemaVersion < 49 ) {
      const oldObsSounds = oldRealm.objects( "ObservationSound" );
      const newObsSounds = newRealm.objects( "ObservationSound" );
      for ( const objectIndex of oldObsSounds.keys() ) {
        const oldObsSound = oldObsSounds[objectIndex];
        const newObsSound = newObsSounds[objectIndex];
        newObsSound.sound = { file_url: oldObsSound.file_url };
      }
    }
    if ( oldRealm.schemaVersion < 48 ) {
      const oldObservations = oldRealm.objects( "Observation" );
      const newObservations = newRealm.objects( "Observation" );
      for ( const objectIndex of oldObservations.keys() ) {
        const oldObservation = oldObservations[objectIndex];
        const newObservation = newObservations[objectIndex];
        newObservation.votes = oldObservation.faves;
        delete newObservation.faves;
      }
    }
    if ( oldRealm.schemaVersion < 34 ) {
      const oldObservations = oldRealm.objects( "Observation" );
      const newObservations = newRealm.objects( "Observation" );
      for ( const objectIndex of oldObservations.keys() ) {
        const oldObservation = oldObservations[objectIndex];
        const newObservation = newObservations[objectIndex];
        newObservation.observed_on = oldObservation.time_observed_at;
      }
    }
    if ( oldRealm.schemaVersion < 33 ) {
      const oldObservations = oldRealm.objects( "Observation" );
      const newObservations = newRealm.objects( "Observation" );
      for ( const objectIndex of oldObservations.keys() ) {
        const oldObservation = oldObservations[objectIndex];
        const newObservation = newObservations[objectIndex];
        newObservation.comments_viewed = oldObservation.viewed;
        newObservation.identifications_viewed = oldObservation.viewed;
        delete newObservation.viewed;
      }
    }

    if ( oldRealm.schemaVersion < 32 ) {
      const oldObservations = oldRealm.objects( "Observation" );
      const newObservations = newRealm.objects( "Observation" );
      for ( const objectIndex of oldObservations.keys() ) {
        const oldObservation = oldObservations[objectIndex];
        const newObservation = newObservations[objectIndex];
        newObservation.updated_at = oldObservation.created_at;
      }
    }

    // Apparently you need to migrate when making a property optional
    if ( oldRealm.schemaVersion < 31 ) {
      const oldTaxa = oldRealm.objects( "Taxon" );
      const newTaxa = newRealm.objects( "Taxon" );
      for ( const objectIndex of oldTaxa.keys() ) {
        const newTaxon = newTaxa[objectIndex];
        const oldTaxon = oldTaxa[objectIndex];
        if ( oldTaxon.rank_level === 0 ) {
          newTaxon.rank_level = null;
        } else {
          newTaxon.rank_level = oldTaxon.rank_level;
        }
      }
    }

    if ( oldRealm.schemaVersion < 30 ) {
      const oldUsers = oldRealm.objects( "User" );
      const newUsers = newRealm.objects( "User" );
      // loop through all objects and set the new property in the new schema
      for ( const objectIndex of oldUsers.keys() ) {
        const newUser = newUsers[objectIndex];
        const oldUser = oldUsers[objectIndex];
        newUser.prefers_scientific_name_first = Boolean( oldUser.prefers_scientific_name_first );
        oldUser.prefers_scientific_name_first = Boolean( oldUser.prefers_scientific_name_first );
      }
    }

    if ( oldRealm.schemaVersion < 29 ) {
      const oldTaxa = oldRealm.objects( "Taxon" );
      const newTaxa = newRealm.objects( "Taxon" );

      // loop through all objects and set the new property in the new schema
      for ( const objectIndex of oldTaxa.keys() ) {
        const oldTaxon = oldTaxa[objectIndex];
        const newTaxon = newTaxa[objectIndex];
        newTaxon.rank_level = oldTaxon.rank_level || 0;
        oldTaxon.rank_level = oldTaxon.rank_level || 0;
      }
    }

    if ( oldRealm.schemaVersion < 21 ) {
      const oldObservations = oldRealm.objects( "Observation" );
      const newObservations = newRealm.objects( "Observation" );

      for ( const objectIndex of oldObservations.keys() ) {
        const oldObservation = oldObservations[objectIndex];
        const newObservation = newObservations[objectIndex];
        newObservation.captive_flag = oldObservation.captive;
      }
    }
    if ( oldRealm.schemaVersion < 16 ) {
      const oldObservations = oldRealm.objects( "Observation" );
      const newObservations = newRealm.objects( "Observation" );

      for ( const objectIndex of oldObservations.keys() ) {
        const oldObservation = oldObservations[objectIndex];
        const newObservation = newObservations[objectIndex];
        newObservation._synced_at = oldObservation.timeSynced;
        newObservation._updated_at = oldObservation.timeUpdatedLocally;
      }
    }
    if ( oldRealm.schemaVersion < 3 ) {
      const oldComments = oldRealm.objects( "Comment" );
      const newComments = newRealm.objects( "Comment" );
      // loop through all objects and set the new property in the new schema
      for ( const objectIndex of oldComments.keys() ) {
        const oldComment = oldComments[objectIndex];
        const newComment = newComments[objectIndex];
        newComment.created_at = oldComment.createdAt;
      }

      const oldIdentifications = oldRealm.objects( "Identification" );
      const newIdentifications = newRealm.objects( "Identification" );
      // loop through all objects and set the new property in the new schema
      for ( const objectIndex of oldIdentifications.keys() ) {
        const oldIdentification = oldIdentifications[objectIndex];
        const newIdentification = newIdentifications[objectIndex];
        newIdentification.created_at = oldIdentification.createdAt;
      }

      const oldPhotos = oldRealm.objects( "Photo" );
      const newPhotos = newRealm.objects( "Photo" );
      // loop through all objects and set the new property in the new schema
      for ( const objectIndex of oldPhotos.keys() ) {
        const oldPhoto = oldPhotos[objectIndex];
        const newPhoto = newPhotos[objectIndex];
        newPhoto.license_code = oldPhoto.licenseCode;
      }

      const oldUsers = oldRealm.objects( "User" );
      const newUsers = newRealm.objects( "User" );
      // loop through all objects and set the new property in the new schema
      for ( const objectIndex of oldUsers.keys() ) {
        const oldUser = oldUsers[objectIndex];
        const newUser = newUsers[objectIndex];
        newUser.icon_url = oldUser.iconUrl;
      }

      const oldTaxa = oldRealm.objects( "Taxon" );
      const newTaxa = newRealm.objects( "Taxon" );
      // loop through all objects and set the new property in the new schema
      for ( const objectIndex of oldTaxa.keys() ) {
        const oldTaxon = oldTaxa[objectIndex];
        const newTaxon = newTaxa[objectIndex];
        newTaxon.preferred_common_name = oldTaxon.preferredCommonName;
        newTaxon.rank_level = null;
      }

      const oldObservations = oldRealm.objects( "Observation" );
      const newObservations = newRealm.objects( "Observation" );
      // loop through all objects and set the new property in the new schema
      for ( const objectIndex of oldObservations.keys() ) {
        const oldObservation = oldObservations[objectIndex];
        const newObservation = newObservations[objectIndex];
        newObservation.created_at = oldObservation.createdAt;
        newObservation.place_guess = oldObservation.placeGuess;
        newObservation.quality_grade = oldObservation.qualityGrade;
        newObservation.time_observed_at = oldObservation.timeObservedAt;
      }
    }
  },
};
