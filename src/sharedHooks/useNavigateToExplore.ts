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
import useStoredLayout from "sharedHooks/useStoredLayout";

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
  if ( taxon?.id ) { return resultToSubject( { type: "taxon", taxon } ); }
  if ( user?.id ) { return resultToSubject( { type: "user", user } ); }
  if ( project?.id ) { return resultToSubject( { type: "project", project } ); }
  return null;
};

// Single place that knows how to open Explore from outside of it
const useNavigateToExplore = ( ) => {
  const navigation = useNavigation<TabStackScreenProps<
    "TaxonDetails" | "UserProfile" | "ProjectDetails" | "ProjectRequirements"
  >["navigation"]>( );
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
      writeLayout( layout );
    }

    const subject = toSubject( { taxon, user, project } );

    navigation.navigate( "Explore", {
      ...( subject
        ? { subject }
        : {} ),
      location: placeLocation( place ),
      activeTab: tab,
    } );
  }, [navigation, writeLayout] );
};

export default useNavigateToExplore;
