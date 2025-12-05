import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ApiTaxon } from "api/types";
import {
  TaxonResult,
  TaxonSearch
} from "components/SharedComponents";
import { RealmContext } from "providers/contexts";
import React, {
  useCallback,
  useEffect,
  useState
} from "react";
import saveObservation from "sharedHelpers/saveObservation";
import { useTaxonSearch, useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

const MatchTaxonSearchScreen = ( ) => {
  const [taxonQuery, setTaxonQuery] = useState( "" );
  const [selectedTaxon, setSelectedTaxon] = useState<ApiTaxon | null>( null );
  const { taxa, isLoading, isLocal } = useTaxonSearch( taxonQuery );
  const { t } = useTranslation( );
  const realm = useRealm( );
  const navigation = useNavigation<
    NativeStackNavigationProp<Record<string, { screen: string; params: {screen: string} }>>
  >( );

  const getCurrentObservation = useStore( state => state.getCurrentObservation );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );

  // This effect is largely lifted from useNavigateWithTaxonSelected, which
  // seems fairly specific to Suggestions
  useEffect( ( ) => {
    if ( selectedTaxon === null ) { return; }
    updateObservationKeys( {
      owners_identification_from_vision: false,
      taxon: selectedTaxon
    } );

    saveObservation( getCurrentObservation(), cameraRollUris, realm )
      .then( ( ) => navigation.navigate( "TabNavigator", {
        screen: "ObservationsTab",
        params: {
          screen: "ObsList"
        }
      } ) );

    setSelectedTaxon( null );
  }, [
    cameraRollUris,
    getCurrentObservation,
    navigation,
    realm,
    selectedTaxon,
    updateObservationKeys
  ] );

  const renderTaxonResult = useCallback(
    // no-unused-prop-types failing for components defined at runtime seems to
    // be a bug. These props are clearly used
    // eslint-disable-next-line react/no-unused-prop-types
    ( { item: taxon, index }: { item: ApiTaxon, index: number } ) => (
      <TaxonResult
        accessibilityLabel={t( "Choose-taxon" )}
        fetchRemote={false}
        first={index === 0}
        handleCheckmarkPress={() => setSelectedTaxon( taxon )}
        hideNavButtons
        taxon={taxon}
        testID={`Search.taxa.${taxon.id}`}
      />
    ),
    [setSelectedTaxon, t]
  );

  return (
    <TaxonSearch
      isLoading={isLoading}
      isLocal={isLocal}
      query={taxonQuery}
      renderItem={renderTaxonResult}
      setQuery={setTaxonQuery}
      taxa={taxa}
    />
  );
};

export default MatchTaxonSearchScreen;
