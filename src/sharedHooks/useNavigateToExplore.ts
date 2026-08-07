import { useNavigation } from "@react-navigation/native";
import type { ApiProjectSummary, ApiTaxon, ApiUser } from "api/types";
import { OBSERVATIONS_TAB } from "appConstants/tabs";
import { resultToSubject }
  from "components/Explore/ExploreV2/helpers/universalSearchSubject";
import type { TabStackScreenProps } from "navigation/types";
import type {
  ExploreV2LocationState,
  ExploreV2Subject,
  ExploreV2Tab,
  Place,
} from "providers/ExploreV2Context";
import { EXPLORE_V2_PLACE_MODE } from "providers/ExploreV2Context";
import { useCallback } from "react";
import useFeatureFlag from "sharedHooks/useFeatureFlag";
import useStoredLayout from "sharedHooks/useStoredLayout";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

interface NavigateToExploreOptions {
  taxon?: ApiTaxon | null;
  user?: ApiUser | null;
  project?: ApiProjectSummary | null;
  place?: Partial<Place> | null;
  tab?: ExploreV2Tab;
  layout?: "map" | "grid" | "list";
}

const placeLocation = ( place?: Partial<Place> | null ): ExploreV2LocationState => {
  if ( !place?.id ) { return { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE }; }
  return {
    placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
    place: {
      id: place.id,
      display_name: place.display_name,
    },
  };
};

const toSubject = ( {
  taxon,
  user,
  project,
}: NavigateToExploreOptions ): ExploreV2Subject | null => {
  if ( taxon?.id && taxon.name ) { return resultToSubject( { type: "taxon", taxon } ); }
  if ( user?.id && user.login ) { return resultToSubject( { type: "user", user } ); }
  if ( project?.id && project.title ) { return resultToSubject( { type: "project", project } ); }
  return null;
};

// Single place that knows how to open Explore from outside of it: which of the
// two Explore implementations is live, and what each one expects
const useNavigateToExplore = ( ) => {
  const navigation = useNavigation<TabStackScreenProps<
    "TaxonDetails" | "UserProfile" | "ProjectDetails" | "ProjectRequirements"
  >["navigation"]>( );
  const exploreV2Enabled = useFeatureFlag( FeatureFlag.ExploreV2Enabled );
  const setExploreView = useStore( state => state.setExploreView );
  const { writeLayoutToStorage: writeLegacyLayout } = useStoredLayout(
    "exploreObservationsLayout",
  );
  const { writeLayoutToStorage: writeLayout } = useStoredLayout(
    "exploreV2ObservationsLayout",
  );

  return useCallback( ( {
    taxon,
    user,
    project,
    place,
    tab = OBSERVATIONS_TAB,
    layout,
  }: NavigateToExploreOptions ) => {
    if ( layout ) {
      if ( exploreV2Enabled ) {
        writeLayout( layout );
      } else {
        writeLegacyLayout( layout );
      }
    }

    const hasPlace = Boolean( place?.id );

    if ( !exploreV2Enabled ) {
      // V1 keeps the observations/species choice in the store, not in params
      setExploreView( tab );
      navigation.navigate( "Explore", {
        ...( taxon
          ? { taxon }
          : {} ),
        ...( user
          ? { user }
          : {} ),
        ...( project
          ? { project }
          : {} ),
        ...( hasPlace
          ? { place }
          : { worldwide: true } ),
      } );
      return;
    }

    const subject = toSubject( { taxon, user, project } );

    navigation.navigate( "Explore", {
      ...( subject
        ? { subject }
        : {} ),
      location: placeLocation( place ),
      activeTab: tab,
    } );
  }, [
    exploreV2Enabled,
    navigation,
    setExploreView,
    writeLayout,
    writeLegacyLayout,
  ] );
};

export default useNavigateToExplore;
