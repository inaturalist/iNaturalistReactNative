import { useNavigation } from "@react-navigation/native";
import {
  Body3,
  Button,
  DisplayTaxon,
  Heading1,
  Heading4,
  IconicTaxonChooser,
  INatIcon
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

const NumberBadge = ( { number } ): Node => (
  <View
    className="ml-3 w-5 h-5 justify-center items-center rounded-full bg-inatGreen"
  >
    <Body3 className="text-white">{number}</Body3>
  </View>
);

const FilterModal = ( { closeModal, exploreParams, updateTaxon } ): Node => {
  const { t } = useTranslation();
  const navigation = useNavigation( );
  const { taxon } = exploreParams;

  // TODO: actually calculate this number
  const number = 0;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      {/* TODO: add dropshadow */}
      <View className="flex-row items-center p-5 justify-between">
        <View className="flex-row items-center">
          <INatIcon name="sliders" size={20} />
          <Heading1 className="ml-3">{t( "Explore-Filters" )}</Heading1>
          {/* TODO: add shadow */}
          {number !== 0 && <NumberBadge number={number} />}
        </View>
        {/* TODO: onPress needs to reset filters */}
        <Body3 onPress={closeModal}>{t( "Reset" )}</Body3>
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

const ExploreFilters = ( {
  exploreParams,
  showModal,
  closeModal,
  updateTaxon
}: Props ): Node => (
  <Modal
    showModal={showModal}
    closeModal={closeModal}
    fullScreen
    modal={(
      <FilterModal
        exploreParams={exploreParams}
        closeModal={closeModal}
        updateTaxon={updateTaxon}
      />
    )}
  />
);

export default ExploreFilters;
