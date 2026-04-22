import { logFirebaseEvent } from "sharedHelpers/tracking";
import { v4 as uuidv4 } from "uuid";

import type { OfflineSuggestionsResponse } from "./useOfflineSuggestions";
import type { OnlineSuggestionsQueryResponse } from "./useOnlineSuggestions";

// GA has very limited support for structured data. Only certain built-in events have support for
// non-primitive data structures. We're piggybacking on those built-ins for this reporting.
// These are then mapped to more appropriately named suggestion events using "event modifications"
// in the Firebase Events Config.
// https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#purchase
const offlineEventName = "purchase";
// https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#view_item_list
const onlineEventName = "view_item_list";
// similarly, GA, at least through Firebase, doesn't seem to respect custom properties on `items`
// so we're using the generic "item_category" properties which will also be remapped.
const taxonIdPropertyName = "item_category";
const taxonScorePropertyName = "item_category2";

const logSuggestionAnalytics = (
  optimisticObservationUuid: string,
  offlineSuggestions: OfflineSuggestionsResponse,
  onlineSuggestions: OnlineSuggestionsQueryResponse,
) => {
  const transactionId = uuidv4();

  logFirebaseEvent( offlineEventName, {
    transactionId,
    optimisticObservationUuid,
    prediction_source: "offline",
    commonAncestorTaxonId: offlineSuggestions.commonAncestor?.taxon.id ?? "NA",
    commonAncestorCombinedScore: offlineSuggestions.commonAncestor?.combined_score ?? "NA",
    items: offlineSuggestions.results
      .slice( 0, 10 )
      .map( suggestion => ( {
        item_id: String( suggestion.taxon.id ),
        [taxonIdPropertyName]: String( suggestion.taxon.id ),
        [taxonScorePropertyName]: String( suggestion.combined_score ),
      } ) ),
  } );

  logFirebaseEvent( onlineEventName, {
    transactionId,
    optimisticObservationUuid,
    prediction_source: "online",
    commonAncestorTaxonId: onlineSuggestions.common_ancestor?.taxon.id ?? "NA",
    commonAncestorCombinedScore: onlineSuggestions.common_ancestor?.combined_score ?? "NA",
    items: onlineSuggestions.results
      .slice( 0, 10 )
      .map( suggestion => ( {
        item_id: String( suggestion.taxon.id ),
        [taxonIdPropertyName]: String( suggestion.taxon.id ),
        [taxonScorePropertyName]: String( suggestion.combined_score ),
      } ) ),
  } );
};

const experimentChanceIntegerPercentage = 1;

// eslint-disable-next-line import/prefer-default-export
export const startOfflineExperimentInBackground = async (
  obsUuid: string,
  shimmedOnlineResponse: OnlineSuggestionsQueryResponse,
  offlineSuggestionOperation: () => Promise<OfflineSuggestionsResponse | null>,
) => {
  if ( Math.random() * 100 > experimentChanceIntegerPercentage ) {
    return;
  }

  try {
    const offlineResult = await offlineSuggestionOperation();
    if ( !offlineResult ) {
      return;
    }

    logSuggestionAnalytics( obsUuid, offlineResult, shimmedOnlineResponse );
  } catch ( _error ) { /* empty */ }
};
