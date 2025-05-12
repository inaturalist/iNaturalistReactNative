import { useNavigation } from "@react-navigation/native";
import type { ApiTaxon } from "api/types";
import classnames from "classnames";
import ObsImagePreview from "components/ObservationsFlashList/ObsImagePreview.tsx";
import {
  Body3,
  DisplayTaxonName,
  INatIconButton
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React, { PropsWithChildren } from "react";
import type { GestureResponderEvent } from "react-native";
import type { RealmTaxon, RealmTaxonPhoto } from "realmModels/types";
import { accessibleTaxonName } from "sharedHelpers/taxon";
import { useCurrentUser, useTaxon, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import ConfidenceInterval from "./ConfidenceInterval";

interface TaxonResultProps {
  accessibilityLabel: string;
  activeColor?: string;
  asListItem?: boolean;
  clearBackground?: boolean;
  confidence?: number;
  confidencePosition?: string;
  confidencePercentage?: number | null;
  fetchRemote?: boolean;
  first?: boolean;
  fromLocal?: boolean;
  handleCheckmarkPress: ( taxon: Object ) => void;
  handleRemovePress?: () => void;
  handleTaxonOrEditPress?: ( _event?: GestureResponderEvent ) => void;
  hideInfoButton?: boolean;
  hideNavButtons?: boolean;
  checkmarkFocused?: boolean;
  lastScreen?: string | null;
  onPressInfo?: ( taxon: Object ) => void;
  showCheckmark?: boolean;
  showEditButton?: boolean;
  showRemoveButton?: boolean;
  taxon: RealmTaxon | ApiTaxon;
  testID: string;
  unpressable?: boolean; // Overrides other props controlling interactive elements
  vision?: boolean;
  white?: boolean;
}

interface TaxonResultMainProps extends PropsWithChildren {
  className?: string;
}

const TaxonResult = ( {
  accessibilityLabel,
  activeColor,
  asListItem = true,
  checkmarkFocused = false,
  clearBackground,
  confidence,
  confidencePercentage,
  confidencePosition = "photo",
  fetchRemote = true,
  first = false,
  fromLocal = true,
  handleCheckmarkPress,
  handleRemovePress,
  handleTaxonOrEditPress,
  hideInfoButton = false,
  hideNavButtons = false,
  lastScreen = null,
  onPressInfo,
  retryQuery = true,
  showCheckmark = true,
  showEditButton = false,
  showRemoveButton = false,
  taxon: taxonProp,
  testID,
  unpressable = false,
  vision = false,
  white = false
}: TaxonResultProps ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );

  const currentUser = useCurrentUser( );

  // thinking about future performance, it might make more sense to batch
  // network requests for useTaxon instead of making individual API calls.
  // right now, this fetches a single taxon at a time on AI camera &
  // a short list of taxa from offline Suggestions
  const { taxon: localTaxon } = useTaxon(
    taxonProp,
    fetchRemote,
    retryQuery
  ) as { taxon: RealmTaxon };
  const usableTaxon = fromLocal
    ? localTaxon
    : taxonProp;
  const accessibleName = accessibleTaxonName( usableTaxon, currentUser, t );
  // A representative photo is dependant on the actual image that was scored by computer vision
  // and is currently not added to the taxon realm. So, if it is available directly from the
  // suggestion, i.e. taxonProp, use it. Otherwise, use the default photo from the taxon.
  const representativePhoto = ( taxonProp as ApiTaxon )?.representative_photo;
  // I have seen the RealmTaxon that is accessed here get invalidated and deleted
  // while this screen is still in stack and therefore the app erroring out.
  // Have not had time to investigate further, but this is a workaround for now.
  const taxonImagePointer = representativePhoto
      || ( usableTaxon as ApiTaxon )?.default_photo
      || ( usableTaxon as RealmTaxon )?.defaultPhoto;
  const taxonImage = React.useMemo( () => ( { ...taxonImagePointer } ), [taxonImagePointer] );

  const taxonImageSource = { uri: taxonImage?.url };

  const isRepresentativeButOtherTaxon = representativePhoto
    && !localTaxon?.taxonPhotos?.some(
      ( tp: RealmTaxonPhoto ) => tp.photo.id === representativePhoto.id
    );

  const navToTaxonDetails = React.useCallback( ( ) => {
    const params = {
      id: usableTaxon?.id,
      hideNavButtons,
      lastScreen,
      vision
    };
    if ( !isRepresentativeButOtherTaxon ) {
      params.firstPhotoID = taxonImage?.id;
    } else {
      params.representativePhoto = taxonImage;
    }
    navigation.push( "TaxonDetails", params );
  }, [
    hideNavButtons,
    lastScreen,
    navigation,
    usableTaxon?.id,
    vision,
    taxonImage,
    isRepresentativeButOtherTaxon
  ] );
  const TaxonResultMain = React.useCallback( ( props: TaxonResultMainProps ) => (
    unpressable
      // eslint-disable-next-line react/jsx-props-no-spreading
      ? <View {...props}>{ props.children }</View>
      : (
        <Pressable
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
          onPress={handleTaxonOrEditPress || navToTaxonDetails}
          accessible
          accessibilityRole="link"
          accessibilityLabel={accessibleName}
          accessibilityHint={t( "Navigates-to-taxon-details" )}
        >
          { props.children }
        </Pressable>
      )
  ), [
    accessibleName,
    handleTaxonOrEditPress,
    navToTaxonDetails,
    t,
    unpressable
  ] );

  // useTaxon could return null, and it's at least remotely possible taxonProp is null
  if ( !usableTaxon ) return null;

  const renderCheckmark = () => {
    if ( checkmarkFocused ) {
      return (
        <INatIconButton
          className="ml-2 bg-inatGreen rounded-full h-[40px] w-[40px]"
          icon="checkmark"
          size={21}
          color={String( colors?.white )}
          onPress={() => handleCheckmarkPress( usableTaxon )}
          accessibilityLabel={accessibilityLabel}
          testID={`${testID}.checkmark`}
        />
      );
    }
    return (
      <INatIconButton
        className="ml-2"
        icon="checkmark-circle-outline"
        size={40}
        color={String(
          clearBackground
            ? colors?.white
            : colors?.darkGray
        )}
        onPress={() => handleCheckmarkPress( usableTaxon )}
        accessibilityLabel={accessibilityLabel}
        testID={`${testID}.checkmark`}
      />
    );
  };

  return (
    <View
      className={
        classnames(
          "flex-row items-center justify-between",
          {
            "px-4": asListItem,
            "border-b-[1px] border-lightGray": asListItem,
            "border-t-[1px]": first
          }
        )
      }
      testID={testID}
    >
      <TaxonResultMain
        className={
          classnames( "flex-row items-center shrink", {
            "py-3": asListItem
          } )
        }
      >
        <View className="w-[62px] h-[62px] justify-center relative">
          <ObsImagePreview
            // TODO fix when ObsImagePreview typed
            source={taxonImageSource}
            testID={`${testID}.photo`}
            iconicTaxonName={usableTaxon?.iconic_taxon_name}
            className="rounded-xl"
            isSmall
            white={white}
            isBackground={false}
          />
          {!!( confidence && confidencePosition === "photo" ) && (
            <View className="absolute -bottom-4 w-full items-center">
              <ConfidenceInterval
                confidence={confidence}
                activeColor={activeColor}
              />
            </View>
          )}
        </View>
        <View className="shrink ml-3 flex-1">
          <DisplayTaxonName
            taxon={usableTaxon}
            color={String(
              clearBackground
                ? "text-white"
                : "text-darkGray"
            )}
            scientificNameFirst={currentUser?.prefers_scientific_name_first}
            prefersCommonNames={currentUser?.prefers_common_names}
          />
          {!!( ( confidence || confidencePercentage ) && confidencePosition === "text" ) && (
            <View className="mt-1 w-[62px]">
              {confidencePercentage
                ? (
                  <Body3 className="color-inatGreen">
                    {t( "X-percent", { count: confidencePercentage } )}
                  </Body3>
                )
                : (
                  <ConfidenceInterval
                    confidence={confidence}
                    activeColor={activeColor}
                  />
                )}
            </View>
          )}
        </View>
      </TaxonResultMain>
      { !unpressable && (
        <View className="flex-row items-center">
          { !hideInfoButton && (
            <INatIconButton
              icon="info-circle-outline"
              size={22}
              onPress={( ) => {
                if ( typeof ( onPressInfo ) === "function" ) {
                  onPressInfo( usableTaxon );
                  return;
                }
                navToTaxonDetails( );
              }}
              color={String(
                clearBackground
                  ? colors?.white
                  : colors?.darkGray
              )}
              accessibilityLabel={t( "More-info" )}
              accessibilityHint={t( "Navigates-to-taxon-details" )}
            />
          )}
          { showCheckmark && renderCheckmark()}
          { showEditButton && handleTaxonOrEditPress
              && (
                <INatIconButton
                  icon="edit"
                  size={20}
                  onPress={handleTaxonOrEditPress}
                  accessibilityLabel={t( "Edit-identification" )}
                  accessibilityHint={t( "Edits-this-observations-taxon" )}
                />
              )}
          { showRemoveButton && handleRemovePress
            && (
              <INatIconButton
                icon="close"
                size={20}
                onPress={handleRemovePress}
                accessibilityLabel={t( "Remove-identification" )}
                accessibilityHint={t( "Removes-this-observations-taxon" )}
              />
            )}
        </View>
      ) }
    </View>
  );
};

export default TaxonResult;
