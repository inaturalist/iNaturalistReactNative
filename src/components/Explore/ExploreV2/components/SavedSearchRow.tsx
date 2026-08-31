import LocationSubtitle from "components/Explore/ExploreV2/components/LocationSubtitle";
import SubjectThumbnail from "components/Explore/ExploreV2/components/SubjectThumbnail";
import countFilters from "components/Explore/ExploreV2/helpers/countFilters";
import locationLabel from "components/Explore/ExploreV2/helpers/locationLabel";
import subjectLabel from "components/Explore/ExploreV2/helpers/subjectLabel";
import DisplayTaxonName from "components/SharedComponents/DisplayTaxonName";
import INatIcon from "components/SharedComponents/INatIcon";
import Body1 from "components/SharedComponents/Typography/Body1";
import Body3 from "components/SharedComponents/Typography/Body3";
import { Pressable, View } from "components/styledComponents";
import React, { useCallback } from "react";
import type { AccessibilityActionEvent } from "react-native";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useTranslation from "sharedHooks/useTranslation";
import type { SavedSearch } from "stores/createExploreV2SearchesSlice";

interface Props {
  onDelete: ( ) => void;
  onPress: ( ) => void;
  search: SavedSearch;
}

const SavedSearchRow = ( { onDelete, onPress, search }: Props ) => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const { subject } = search;
  const place = locationLabel( search.location, t );
  const filterCount = countFilters( search.filters );

  const handleAccessibilityAction = useCallback( ( event: AccessibilityActionEvent ) => {
    if ( event.nativeEvent.actionName === "delete" ) { onDelete( ); }
  }, [onDelete] );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${subjectLabel( subject, t )}, ${place}`}
      accessibilityActions={[{ name: "delete", label: t( "Delete-saved-search" ) }]}
      className="flex-row items-center px-[15px] py-[11px] border-b border-lightGray bg-white"
      onAccessibilityAction={handleAccessibilityAction}
      onPress={onPress}
      testID={`SavedSearchRow.${search.key}`}
    >
      <SubjectThumbnail subject={subject} />
      <View className="flex-1 ml-[10px]">
        {subject?.type === "taxon"
          ? (
            <DisplayTaxonName
              taxon={subject.taxon}
              showOneNameOnly
              prefersCommonNames={currentUser?.prefers_common_names}
              scientificNameFirst={currentUser?.prefers_scientific_name_first}
            />
          )
          : (
            <Body1 numberOfLines={1} ellipsizeMode="tail">
              {subjectLabel( subject, t )}
            </Body1>
          )}
        <LocationSubtitle place={place} />
        {filterCount > 0 && (
          <View className="flex-row items-center pt-[4px]">
            <View className="w-[15px] items-center">
              <INatIcon name="sliders" size={12} />
            </View>
            <Body3 className="ml-[5px]">
              {t( "X-filters", { count: filterCount } )}
            </Body3>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default SavedSearchRow;
