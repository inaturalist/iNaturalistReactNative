import {
  Body1,
  Body2,
  CustomFlashList,
} from "components/SharedComponents";
import { SharedStackViewWrapper } from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

const ItemSeparator = ( ) => <View className="border-b border-lightGray" />;

const AddToProjects = ( ) => {
  const { t } = useTranslation( );
  const listHeaderComponent = useMemo(
    ( ) => (
      <View className="px-4 pt-5 pb-6">
        <Body1>{t( "Traditional-Projects" )}</Body1>
        <Body2 className="mt-2">
          {t(
            "You-can-manually-add-observations-to-Traditional-Projects-you-have-joined",
          )}
        </Body2>
      </View>
    ),
    [t],
  );

  const listEmptyComponent = useMemo(
    ( ) => (
      <View className="px-20 items-center">
        <Body1 className="text-center">
          {t( "You-havent-joined-any-Traditional-Projects-yet" )}
        </Body1>
      </View>
    ),
    [t],
  );

  const listFooterComponent = useMemo(
    () => (
      <View className="px-4 pt-6 pb-6">
        <Body1>{t( "Collection-and-Umbrella-Projects" )}</Body1>
        <Body2 className="mt-2">
          {t(
            "For-most-other-projects-observations-will-automatically-be-included",
          )}
        </Body2>
        <Body2 className="mt-4">
          {t( "You-cant-add-or-remove-observations-from-collection-and-umbrella-projects" )}
        </Body2>
        <Body2 className="mt-4">
          {t( "To-view-this-observations-Collection-and-Umbrella-Projects" )}
        </Body2>
      </View>
    ),
    [t],
  );

  return (
    <SharedStackViewWrapper testID="add-to-projects">
      <CustomFlashList
        testID="AddToProjects.list"
        ListEmptyComponent={listEmptyComponent}
        ListHeaderComponent={listHeaderComponent}
        ListFooterComponent={listFooterComponent}
        data={[]}
        ItemSeparatorComponent={ItemSeparator}
      />
    </SharedStackViewWrapper>
  );
};

export default AddToProjects;
