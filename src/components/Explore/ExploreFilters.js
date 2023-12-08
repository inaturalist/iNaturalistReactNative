import { useNavigation } from "@react-navigation/native";
import {
  Button,
  DisplayTaxon,
  Heading1,
  Heading4,
  IconicTaxonChooser,
  INatIconButton
} from "components/SharedComponents";
import Modal from "components/SharedComponents/Modal";
import type { Node } from "react";
import React from "react";
import {
  ScrollView,
  View
} from "react-native";
import { useTranslation } from "sharedHooks";

type Props = {
  exploreParams: Object,
  showModal: boolean,
  closeModal: Function,
  updateTaxon: Function
};

const ExploreFilters = ( {
  exploreParams,
  showModal,
  closeModal,
  updateTaxon
}: Props ): Node => {
  const { t } = useTranslation();
  const navigation = useNavigation( );
  const { taxon } = exploreParams;

  return (
    <Modal
      showModal={showModal}
      closeModal={closeModal}
      fullScreen
      modal={(
        <View className="flex-1 justify-center items-center bg-gray-900 bg-opacity-50">
          <View className="w-full h-full bg-white rounded-lg overflow-hidden">
            <ScrollView className="p-4">
              {/* Header */}
              {/* TODO: */}
              <View className="flex-row justify-between align-middle">
                <Heading1>{t( "Explore-Filters" )}</Heading1>
                <INatIconButton
                  accessibilityLabel={t( "Close" )}
                  icon="close"
                  onPress={closeModal}
                  size={30}
                />
              </View>

              {/* Taxon Section */}
              <View className="mb-7">
                <Heading4 className="mb-5">{t( "TAXON" )}</Heading4>
                <View className="mb-5">
                  {taxon
                    ? (
                      <DisplayTaxon
                        taxon={taxon}
                        // TODO: add this additional screen
                        onPress={() => navigation.navigate( "ExploreTaxonSearch" )}
                      />
                    )
                    : (
                      <Button
                        text={t( "SEARCH-FOR-A-TAXON" )}
                        // TODO: add this additional screen
                        onPress={() => navigation.navigate( "ExploreTaxonSearch" )}
                        accessibilityLabel={t( "Search" )}
                      />
                    )}
                </View>
                <IconicTaxonChooser taxon={taxon} onTaxonChosen={updateTaxon} />
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    />
  );
};

export default ExploreFilters;
