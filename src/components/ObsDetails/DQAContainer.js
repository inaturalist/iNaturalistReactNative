// @flow
import { useRoute } from "@react-navigation/native";
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
import {
  useEffect, useState
} from "react";
import * as React from "react";
import { useIsConnected } from "sharedHooks";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";

const DQAContainer = ( ): React.Node => {
  const isOnline = useIsConnected( );
  const { params } = useRoute( );
  const { observationUUID, observation, qualityGrade } = params;
  const [qualityMetrics, setQualityMetrics] = useState( null );
  const [loadingAgree, setLoadingAgree] = useState( false );
  const [loadingDisagree, setLoadingDisagree] = useState( false );
  const [loadingMetric, setLoadingMetric] = useState( "none" );
  const [hideErrorSheet, setHideErrorSheet] = useState( true );
  const [hideOfflineSheet, setHideOfflineSheet] = useState( true );

  const fetchMetricsParams = {
    id: observationUUID,
    fields: "metric,agree,user_id",
    ttl: -1
  };

  // destructured mutate to pass into useEffect to prevent infinite
  // rerender and disabling eslint useEffect dependency rule
  const { mutate } = useAuthenticatedMutation(
    ( qualityMetricParams, optsWithAuth ) => fetchQualityMetrics(
      qualityMetricParams,
      optsWithAuth
    ),
    {
      onSuccess: response => {
        setLoadingMetric( "none" );
        if ( loadingAgree ) {
          setLoadingAgree( false );
        }
        if ( loadingDisagree ) {
          setLoadingDisagree( false );
        }
        setQualityMetrics( response );
      },
      onError: () => {
        if ( !isOnline ) {
          setHideOfflineSheet( false );
        }
      }
    }
  );

  useEffect( ( ) => {
    mutate( {
      id: params.observationUUID,
      fields: "metric,agree,user_id",
      ttl: -1
    } );
  }, [mutate, params] );

  const faveMutation = useAuthenticatedMutation(
    ( faveParams, optsWithAuth ) => faveObservation( faveParams, optsWithAuth ),
    {
      onSuccess: () => {
        // TODO: refetch observation to get updated votes
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
        // TODO: refetch observation to get updated votes
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
    ( qualityMetricParams, optsWithAuth ) => deleteQualityMetric(
      qualityMetricParams,
      optsWithAuth
    ),
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
    if ( qualityMetrics ) {
      const agreeCount = qualityMetrics.filter(
        element => ( element.agree && element.metric === metric )
      ).length;
      const disagreeCount = qualityMetrics.filter(
        element => ( !element.agree && element.metric === metric )
      ).length;

      return agreeCount >= disagreeCount;
    }
    return null;
  };

  const checkTest = metric => {
    if ( observation ) {
      if ( metric === "date" ) {
        return observation[metric] !== null;
      }
      if ( metric === "location" ) {
        const removedNull = observation[metric]
          .filter( value => ( value !== null ) );
        return removedNull.length !== 0;
      }
      if ( metric === "evidence" ) {
        const removedEmpty = observation[metric]
          .filter( value => ( Object.keys( value ).length !== 0 ) );
        return removedEmpty.length !== 0;
      }
      if ( observation.taxon ) {
        if ( metric === "id_supported" ) {
          const taxonId = observation.taxon.id;
          const supportedIDs = observation.identifications.filter(
            identification => ( identification.taxon.id === taxonId )
          ).length;
          return supportedIDs >= 2;
        }
        if ( metric === "rank" && observation.taxon.rank_level <= 10 ) {
          return true;
        }
      }
    }
    return false;
  };

  const resetButtonsOnError = () => {
    setLoadingAgree( false );
    setLoadingDisagree( false );
    setLoadingMetric( "none" );
    setHideErrorSheet( true );
  };

  return (
    <>
      <DataQualityAssessment
        qualityMetrics={qualityMetrics}
        loadingAgree={loadingAgree}
        loadingDisagree={loadingDisagree}
        loadingMetric={loadingMetric}
        qualityGrade={qualityGrade}
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
