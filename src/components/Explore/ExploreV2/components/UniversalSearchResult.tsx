import { THUMBNAIL_CLASS } from "appConstants/classNames";
import ProjectListItem from "components/ProjectList/ProjectListItem";
import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import DisplayTaxonName from "components/SharedComponents/DisplayTaxonName";
import IconicTaxonIcon from "components/SharedComponents/IconicTaxonIcon";
import { Image, Pressable, View } from "components/styledComponents";
import UserListItem from "components/UserList/UserListItem";
import React from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useTranslation from "sharedHooks/useTranslation";
import type { UniversalSearchResultItem } from "sharedHooks/useUniversalSearch";

interface Props {
  result: UniversalSearchResultItem;
  onPress: ( ) => void;
}

const resultId = ( result: UniversalSearchResultItem ): number | undefined => {
  if ( result.type === "user" ) { return result.user.id; }
  if ( result.type === "project" ) { return result.project.id; }
  return result.taxon.id;
};

const UniversalSearchResult = ( { result, onPress }: Props ) => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );

  const renderContent = ( ) => {
    switch ( result.type ) {
      case "taxon": {
        const photo = result.taxon.default_photo?.url;
        return (
          <View className="flex-row items-center flex-1">
            {photo
              ? (
                <Image
                  source={{ uri: photo }}
                  className={THUMBNAIL_CLASS}
                  accessibilityIgnoresInvertColors
                  testID="UniversalSearchResult.taxonImage"
                />
              )
              : (
                <IconicTaxonIcon
                  imageClassName={[THUMBNAIL_CLASS]}
                  iconicTaxonName={result.taxon.iconic_taxon_name}
                />
              )}
            <View className="flex-1 ml-3">
              <DisplayTaxonName
                taxon={result.taxon}
                prefersCommonNames={currentUser?.prefers_common_names}
                scientificNameFirst={currentUser?.prefers_scientific_name_first}
              />
            </View>
          </View>
        );
      }
      case "user":
        return (
          <View className="flex-1">
            <UserListItem
              item={{ user: result.user }}
              countText={t( "X-Observations", {
                count: result.user.observations_count || 0,
              } )}
              pressable={false}
            />
          </View>
        );
      case "project":
        return (
          <View className="flex-1">
            <ProjectListItem item={result.project} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center justify-between px-4 py-2 border-b border-lightGray"
      onPress={onPress}
      testID={`UniversalSearchResult.${result.type}.${resultId( result )}`}
    >
      {renderContent( )}
      <INatIconButton
        accessibilityLabel={t( "More-info" )}
        icon="info-circle-outline"
        // TODO MOB-1339 follow-up: navigate to the taxon/user/project detail.
        onPress={( ) => undefined}
        size={22}
        testID={`UniversalSearchResult.info.${resultId( result )}`}
      />
    </Pressable>
  );
};

export default UniversalSearchResult;
