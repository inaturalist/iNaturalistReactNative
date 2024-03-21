// @flow
import { useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { faveObservation, unfaveObservation } from "api/observations";
import { deleteQualityMetric, fetchQualityMetrics, setQualityMetric } from "api/qualityMetrics";
import DataQualityAssessment from "components/ObsDetails/DataQualityAssessment";
import {
  BottomSheet,
  Button,
  List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { compact, groupBy } from "lodash";
import { useCallback, useEffect, useState } from "react";
import * as React from "react";
import Observation from "realmModels/Observation";
import {
  useAuthenticatedMutation,
  useIsConnected,
  useLocalObservation
} from "sharedHooks";
import useRemoteObservation,
{ fetchRemoteObservationKey } from "sharedHooks/useRemoteObservation.ts";

const DQAContainer = ( ): React.Node => {
  const queryClient = useQueryClient( );
  const isOnline = useIsConnected( );
  const { params } = useRoute( );
  const { observationUUID } = params;
  const [qualityMetrics, setQualityMetrics] = useState( undefined );
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
    isRefetching,
    fetchRemoteObservationError
  } = useRemoteObservation( observationUUID, fetchRemoteObservationEnabled );
  const observation
    = localObservation || Observation.mapApiToRealm( remoteObservation );

  // TODO: show some UI on remote observation fetch error
  console.log( "fetchRemoteObservationError", fetchRemoteObservationError );

  const fetchMetricsParams = {
    id: observationUUID,
    fields: "metric,agree,user_id",
    ttl: -1
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

  // destructured mutate to pass into useEffect to prevent infinite
  // rerender and disabling eslint useEffect dependency rule
  const { mutate } = useAuthenticatedMutation(
    ( p, o ) => fetchQualityMetrics( p, o ),
    {
      onSuccess: response => {
        setNotLoading();
        setQualityMetrics( response );
      },
      onError: () => {
        if ( !isOnline ) {
          setHideOfflineSheet( false );
        }
      }
    }
  );

  const combinedQualityMetrics = {
    ...groupBy( qualityMetrics, "metric" ),
    ...groupBy( observation?.votes, "vote_scope" )
  };

  useEffect( ( ) => {
    mutate( {
      id: params.observationUUID,
      fields: "metric,agree,user_id",
      ttl: -1
    } );
  }, [mutate, params] );

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
        queryClient.invalidateQueries( [
          fetchRemoteObservationKey,
          observationUUID
        ] );
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
        queryClient.invalidateQueries( [
          fetchRemoteObservationKey,
          observationUUID
        ] );
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
      onSuccess: () => {
        // fetch updated quality metrics with updated votes
        mutate( fetchMetricsParams );
      },
      onError: () => {
        setHideErrorSheet( false );
      }
    }
  );

  const setMetricVote = ( metric, vote ) => {
    setLoadingMetric( metric );
    if ( vote ) {
      setLoadingAgree( true );
    } else {
      setLoadingDisagree( true );
    }

    // Special case for needs_id metric which is a fave/unfave kind of action
    if ( metric === "needs_id" ) {
      const faveParams = {
        id: observationUUID,
        scope: metric,
        vote: vote === false
          ? "no"
          : "yes"
      };
      faveMutation.mutate( faveParams );
      return;
    }

    const qualityMetricParams = {
      id: observationUUID,
      metric,
      agree: vote,
      ttyl: -1
    };
    createQualityMetricMutation.mutate( qualityMetricParams );
  };

  const createRemoveQualityMetricMutation = useAuthenticatedMutation(
    ( p, o ) => deleteQualityMetric( p, o ),
    {
      onSuccess: () => {
        // fetch updated quality metrics with updated votes
        mutate( fetchMetricsParams );
      },
      onError: () => {
        setHideErrorSheet( false );
      }
    }
  );

  const removeMetricVote = ( metric, vote ) => {
    setLoadingMetric( metric );
    if ( vote ) {
      setLoadingAgree( true );
    } else {
      setLoadingDisagree( true );
    }

    // Special case for needs_id metric which is a fave/unfave kind of action
    if ( metric === "needs_id" ) {
      const unfaveParams = {
        id: observationUUID,
        scope: metric
      };
      unfaveMutation.mutate( unfaveParams );
      return;
    }

    const qualityMetricParams = {
      id: observationUUID,
      metric,
      ttyl: -1
    };
    createRemoveQualityMetricMutation.mutate( qualityMetricParams );
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
    if ( obsDataToCheck ) {
      if ( metric === "date" ) {
        return obsDataToCheck[metric] !== null;
      }
      if ( metric === "location" ) {
        const removedNull = obsDataToCheck[metric].filter(
          value => value !== null
        );
        return removedNull.length !== 0;
      }
      if ( metric === "evidence" ) {
        const removedEmpty = obsDataToCheck[metric].filter(
          value => Object.keys( value ).length !== 0
        );
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
        setMetricVote={setMetricVote}
        removeMetricVote={removeMetricVote}
        ifMajorityAgree={ifMajorityAgree}
        checkTest={checkTest}
      />
      <BottomSheet
        headerText={t( "ERROR-VOTING-IN-DQA" )}
        hidden={hideErrorSheet}
        hideCloseButton
      >
        <View className="px-[26px] py-[20px] flex-col space-y-[20px]">
          <List2 className="text-black">{t( "Error-voting-in-DQA-description" )}</List2>
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
      >
        <View className="px-[26px] py-[20px] flex-col space-y-[20px]">
          <List2 className="text-black">{t( "Offline-DQA-description" )}</List2>
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
