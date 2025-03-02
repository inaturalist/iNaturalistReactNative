// @flow
import {
  refresh as refreshNetInfo,
  useNetInfo
} from "@react-native-community/netinfo";
import { useRoute } from "@react-navigation/native";
import { faveObservation, unfaveObservation } from "api/observations";
import { deleteQualityMetric, fetchQualityMetrics, setQualityMetric } from "api/qualityMetrics";
import DataQualityAssessment from "components/ObsDetails/DataQualityAssessment";
import {
  BottomSheet,
  Button,
  List2
} from "components/SharedComponents";
import EmailConfirmationSheet from "components/SharedComponents/Sheets/EmailConfirmationSheet";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { compact, groupBy } from "lodash";
import { useCallback, useEffect, useState } from "react";
import * as React from "react";
import Observation from "realmModels/Observation";
import { log } from "sharedHelpers/logger";
import {
  useAuthenticatedMutation,
  useAuthenticatedQuery, useCurrentUser,
  useLocalObservation
} from "sharedHooks";
import useIsUserConfirmed from "sharedHooks/useIsUserConfirmed";
import useRemoteObservation from "sharedHooks/useRemoteObservation";

const logger = log.extend( "DQAContainer" );

const DQAContainer = ( ): React.Node => {
  const { isConnected } = useNetInfo( );
  const { params } = useRoute( );
  const { observationUUID } = params;
  const [loadingAgree, setLoadingAgree] = useState( false );
  const [loadingDisagree, setLoadingDisagree] = useState( false );
  const [loadingMetric, setLoadingMetric] = useState( "none" );
  const [hideErrorSheet, setHideErrorSheet] = useState( true );
  const [hideOfflineSheet, setHideOfflineSheet] = useState( true );

  const localObservation = useLocalObservation( observationUUID );
  const fetchRemoteObservationEnabled = !localObservation || localObservation?.wasSynced();
  const {
    remoteObservation,
    refetchRemoteObservation,
    isRefetching
  } = useRemoteObservation( observationUUID, fetchRemoteObservationEnabled );
  const observation = remoteObservation
    ? Observation.mapApiToRealm( remoteObservation )
    : localObservation;
  const currentUser = useCurrentUser( );
  const belongsToCurrentUser = observation?.user?.login === currentUser?.login;
  const isUserConfirmed = useIsUserConfirmed();
  const [showUserNeedToConfirm, setShowUserNeedToConfirm] = useState( false );

  const fetchMetricsParams = {
    id: observationUUID,
    fields: "metric,agree,user_id",
    ttl: -1
  };

  const callFunctionIfConfirmedEmail = ( func, funcParams ) => {
    // Allow the user to add a comment, suggest an ID, etc.  - only if they've
    // confirmed their email or if they're the observer of this observation
    if ( isUserConfirmed || belongsToCurrentUser ) {
      if ( func ) func( funcParams );
      return true;
    }
    // Show the user the bottom sheet that tells them they need to confirm
    setShowUserNeedToConfirm( true );
    return false;
  };

  const setNotLoading = useCallback( () => {
    setLoadingMetric( "none" );
    if ( loadingAgree ) {
      setLoadingAgree( false );
    }
    if ( loadingDisagree ) {
      setLoadingDisagree( false );
    }
  }, [loadingAgree, loadingDisagree] );

  const setLoading = ( metric, vote ) => {
    setLoadingMetric( metric );
    if ( vote ) {
      setLoadingAgree( true );
    } else {
      setLoadingDisagree( true );
    }
  };

  const {
    data: qualityMetrics,
    refetch: refetchQualityMetrics
  } = useAuthenticatedQuery(
    ["fetchQualityMetrics", observationUUID],
    optsWithAuth => fetchQualityMetrics( fetchMetricsParams, optsWithAuth )
  );

  const combinedQualityMetrics = {
    ...groupBy( qualityMetrics, "metric" ),
    ...groupBy( observation?.votes, "vote_scope" )
  };

  /**
   * After a success mutation of the needs_id vote we start the refetching of the remote
   * observation to update the metric status of the observation. So we need to wait until
   * the refetching is done to set the loading state to false.
   */
  useEffect( () => {
    if ( !isRefetching ) {
      setNotLoading();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefetching] );

  const faveMutation = useAuthenticatedMutation(
    ( faveParams, optsWithAuth ) => faveObservation( faveParams, optsWithAuth ),
    {
      onSuccess: () => {
        refetchRemoteObservation();
      },
      onError: () => {
        setHideErrorSheet( false );
      }
    }
  );

  const unfaveMutation = useAuthenticatedMutation(
    ( faveParams, optsWithAuth ) => unfaveObservation( faveParams, optsWithAuth ),
    {
      onSuccess: () => {
        refetchRemoteObservation();
      },
      onError: () => {
        setHideErrorSheet( false );
      }
    }
  );

  const createQualityMetricMutation = useAuthenticatedMutation(
    ( qualityMetricParams, optsWithAuth ) => setQualityMetric( qualityMetricParams, optsWithAuth ),
    {
      onSuccess: async ( ) => {
        await refetchQualityMetrics( );
        await refetchRemoteObservation( );
        setNotLoading( );
      },
      onError: error => {
        logger.error( "createQualityMetricMutation failure", error );
        setHideErrorSheet( false );
      }
    }
  );

  const setMetricVote = ( { metric, vote } ) => {
    setLoading( metric, vote );

    const qualityMetricParams = {
      id: observationUUID,
      metric,
      agree: vote,
      ttyl: -1
    };
    createQualityMetricMutation.mutate( qualityMetricParams );
  };

  // The quality metric "needs_id" uses a fave/unfave vote with vote_scope: "needs_id"
  // as it's interaction with the API
  const setNeedsIDVote = ( { vote } ) => {
    setLoading( "needs_id", vote );

    const faveParams = {
      id: observationUUID,
      scope: "needs_id",
      vote: vote === false
        ? "no"
        : "yes"
    };
    faveMutation.mutate( faveParams );
  };

  const removeQualityMetricMutation = useAuthenticatedMutation(
    ( deleteParams, options ) => deleteQualityMetric( deleteParams, options ),
    {
      onSuccess: async ( ) => {
        await refetchQualityMetrics( );
        await refetchRemoteObservation( );
        setNotLoading( );
      },
      onError: error => {
        logger.error( "removeQualityMetricMutation failed", error );
        setHideErrorSheet( false );
      }
    }
  );

  const removeMetricVote = ( { metric, vote } ) => {
    setLoading( metric, vote );

    const qualityMetricParams = {
      id: observationUUID,
      metric,
      ttyl: -1
    };
    removeQualityMetricMutation.mutate( qualityMetricParams );
  };

  // The quality metric "needs_id" uses a fave/unfave vote with vote_scope: "needs_id"
  // as it's interaction with the API
  const removeNeedsIDVote = ( { vote } ) => {
    setLoading( "needs_id", vote );

    const unfaveParams = {
      id: observationUUID,
      scope: "needs_id"
    };
    unfaveMutation.mutate( unfaveParams );
  };

  const ifMajorityAgree = metric => {
    const votesOfMetric = combinedQualityMetrics[metric];
    if ( votesOfMetric && votesOfMetric.length > 0 ) {
      const agreeCount = votesOfMetric.filter(
        element => element.agree
      ).length;
      const disagreeCount = votesOfMetric.filter(
        element => !element.agree
      ).length;

      return agreeCount >= disagreeCount;
    }
    return null;
  };

  const checkTest = metric => {
    if ( observation ) {
      const obsDataToCheck = {
        date: observation.observed_on,
        location: [observation.latitude, observation.longitude],
        evidence: compact( [
          observation.observationPhotos || observation.observation_photos,
          observation.observationSounds || observation.sounds
        ] ),
        taxonId: observation.taxon?.id,
        rankLevel: observation.taxon?.rank_level,
        identifications: observation.identifications
      };
      if ( metric === "date" ) {
        return obsDataToCheck[metric] !== null;
      }
      if ( metric === "location" ) {
        const removedNull = obsDataToCheck[metric]
          .filter( value => value !== null );
        return removedNull.length !== 0;
      }
      if ( metric === "evidence" ) {
        const removedEmpty = obsDataToCheck[metric]
          .filter( value => Object.keys( value ).length !== 0 );
        return removedEmpty.length !== 0;
      }
      if ( metric === "id_supported" ) {
        const { taxonId } = obsDataToCheck;
        const supportedIDs = obsDataToCheck.identifications.filter(
          identification => identification.taxon.id === taxonId
        ).length;
        return supportedIDs >= 2;
      }
      if ( metric === "rank" && obsDataToCheck.rankLevel <= 10 ) {
        return true;
      }
    }
    return false;
  };

  const resetButtonsOnError = () => {
    setNotLoading();
    setHideErrorSheet( true );
  };

  return (
    <>
      <DataQualityAssessment
        qualityMetrics={combinedQualityMetrics}
        loadingAgree={loadingAgree}
        loadingDisagree={loadingDisagree}
        loadingMetric={loadingMetric}
        qualityGrade={observation?.quality_grade}
        setMetricVote={metricParams => callFunctionIfConfirmedEmail( setMetricVote, metricParams )}
        removeMetricVote={
          metricParams => callFunctionIfConfirmedEmail( removeMetricVote, metricParams )
        }
        setNeedsIDVote={
          metricParams => callFunctionIfConfirmedEmail( setNeedsIDVote, metricParams )
        }
        removeNeedsIDVote={
          metricParams => callFunctionIfConfirmedEmail( removeNeedsIDVote, metricParams )
        }
        ifMajorityAgree={ifMajorityAgree}
        checkTest={checkTest}
        isConnected={isConnected}
        recheckisConnected={refreshNetInfo}
      />
      {showUserNeedToConfirm && (
        <EmailConfirmationSheet
          onPressClose={() => setShowUserNeedToConfirm( false )}
        />
      )}

      <BottomSheet
        headerText={t( "ERROR-VOTING-IN-DQA" )}
        hidden={hideErrorSheet}
        hideCloseButton
        onPressClose={( ) => resetButtonsOnError( )}
      >
        <View className="px-[26px] py-[20px] flex-col space-y-[20px]">
          <List2 className="text-darkGray">{t( "Error-voting-in-DQA-description" )}</List2>
          <Button
            text={t( "OK" )}
            onPress={() => resetButtonsOnError( )}
          />
        </View>
      </BottomSheet>
      <BottomSheet
        headerText={t( "ERROR-LOADING-DQA" )}
        hidden={hideOfflineSheet}
        hideCloseButton
        onPressClose={( ) => setHideOfflineSheet( true )}
      >
        <View className="px-[26px] py-[20px] flex-col space-y-[20px]">
          <List2 className="text-darkGray">{t( "Offline-DQA-description" )}</List2>
          <Button
            text={t( "OK" )}
            onPress={() => setHideOfflineSheet( true )}
          />
        </View>
      </BottomSheet>
    </>
  );
};

export default DQAContainer;
