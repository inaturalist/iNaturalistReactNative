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
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useTranslation from "sharedHooks/useTranslation";
import type { SavedSearch } from "stores/createExploreV2SearchesSlice";
import colors from "styles/tailwindColors";

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

  // A swipe is not reachable with a screen reader, so the same action is also offered as an
  // accessibility action on the row
  const handleAccessibilityAction = useCallback( ( event: AccessibilityActionEvent ) => {
    if ( event.nativeEvent.actionName === "delete" ) { onDelete( ); }
  }, [onDelete] );

  const renderDeleteAction = ( ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t( "Delete-saved-search" )}
      className="w-[84px] bg-warningRed items-center justify-center"
      onPress={onDelete}
      testID={`SavedSearchRow.delete.${search.key}`}
    >
      <INatIcon name="trash-outline" size={22} color={colors.white} />
    </Pressable>
  );

  return (
    <ReanimatedSwipeable
      overshootRight={false}
      renderRightActions={renderDeleteAction}
    >
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
    </ReanimatedSwipeable>
  );
};

export default SavedSearchRow;
