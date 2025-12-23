// @flow

import { useNavigation } from "@react-navigation/native";
import { MAX_PHOTOS_ALLOWED } from "components/Camera/StandardCamera/StandardCamera";
import {
  Body2,
  Button,
  ButtonBar,
  CustomFlashList,
  FloatingActionBar,
  INatIcon,
  INatIconButton,
} from "components/SharedComponents";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import { Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useCallback, useMemo, useState } from "react";
import { useGridLayout } from "sharedHooks";
import colors from "styles/tailwindColors";

import GroupPhotoImage from "./GroupPhotoImage";

type Props = {
  combinePhotos: Function,
  groupedPhotos: Array<Object>,
  isCreatingObservations?: boolean,
  navBasedOnUserSettings: Function,
  removePhotos: Function,
  selectedObservations: Array<Object>,
  selectObservationPhotos: Function,
  separatePhotos: Function,
  totalPhotos: number
}

const GroupPhotos = ( {
  combinePhotos,
  groupedPhotos,
  isCreatingObservations,
  navBasedOnUserSettings,
  removePhotos,
  selectedObservations,
  selectObservationPhotos,
  separatePhotos,
  totalPhotos,
}: Props ): Node => {
  const navigation = useNavigation( );
  const {
    flashListStyle,
    gridItemStyle,
    gridItemWidth,
    numColumns,
  } = useGridLayout( );
  const [buttonBarHeight, setButtonBarHeight] = useState( null );
  const extractKey = ( item, index ) => ( item.empty
    ? "empty"
    : `${item.photos[0].uri}${index}` );

  const noObsSelected = selectedObservations.length === 0;
  const oneObsSelected = selectedObservations.length === 1;
  const obsWithMultiplePhotosSelected
    = selectedObservations?.[0]?.photos?.length > 1;

  const renderImage = useCallback( item => (
    <GroupPhotoImage
      item={item}
      selectedObservations={selectedObservations}
      selectObservationPhotos={selectObservationPhotos}
      style={gridItemStyle}
    />
  ), [gridItemStyle, selectedObservations, selectObservationPhotos] );

  const addPhotos = useCallback( () => {
    navigation.navigate( "NoBottomTabStackNavigator", {
      screen: "PhotoLibrary",
      params: { fromGroupPhotos: true },
    } );
  }, [navigation] );

  // $FlowIgnore
  const renderItem = useCallback( ( { item } ) => {
    if ( item.empty ) {
      return (
        <Pressable
          accessibilityRole="button"
          onPress={addPhotos}
          className="rounded-[15px] justify-center items-center"
          // Sorry, couldn't get this to work with tailwind
          // eslint-disable-next-line react-native/no-inline-styles
          style={[gridItemStyle, {
            borderWidth: 4,
            borderStyle: "dashed",
            borderColor: colors.mediumGray,
          }]}
        >
          <INatIcon name="plus" size={50} color={colors.mediumGray} />
        </Pressable>
      );
    }
    // $FlowIgnore
    return renderImage( item );
  }, [gridItemStyle, renderImage, addPhotos] );

  const renderHeader = ( ) => (
    <View className="m-5">
      <Body2>{t( "Group-photos-onboarding" )}</Body2>
    </View>
  );

  const onLayout = event => {
    const {
      height,
    } = event.nativeEvent.layout;
    setButtonBarHeight( height );
  };

  const data = useMemo( ( ) => {
    const newData = [].concat( groupedPhotos );
    if ( totalPhotos < MAX_PHOTOS_ALLOWED ) {
      newData.push( { empty: true } );
    }
    return newData;
  }, [groupedPhotos, totalPhotos] );

  const extraData = {
    selectedObservations,
    gridItemWidth,
  };

  return (
    <ViewWrapper>
      <CustomFlashList
        ListHeaderComponent={renderHeader}
        contentContainerStyle={flashListStyle}
        data={data}
        extraData={extraData}
        key={numColumns}
        keyExtractor={extractKey}
        numColumns={numColumns}
        renderItem={renderItem}
        testID="GroupPhotos.list"
      />
      <FloatingActionBar
        show={selectedObservations.length > 0 && typeof buttonBarHeight === "number"}
        position="bottomStart"
        containerClass="ml-[15px] rounded-md"
        footerHeight={buttonBarHeight}
      >
        <View className="rounded-md overflow-hidden flex-row">
          <INatIconButton
            icon="combine"
            mode="contained"
            size={20}
            color={colors.white}
            backgroundColor={colors.darkGray}
            className="m-4"
            accessibilityLabel={t( "Combine-Photos" )}
            disabled={noObsSelected || oneObsSelected}
            onPress={combinePhotos}
          />
          <INatIconButton
            icon="separate"
            mode="contained"
            size={20}
            color={colors.white}
            backgroundColor={colors.darkGray}
            className="m-4"
            accessibilityLabel={t( "Separate-Photos" )}
            disabled={!obsWithMultiplePhotosSelected}
            onPress={separatePhotos}
          />
          <INatIconButton
            icon="trash-outline"
            mode="contained"
            size={20}
            color={colors.white}
            backgroundColor={colors.warningRed}
            className="m-4"
            accessibilityLabel={t( "Remove-Photos" )}
            disabled={noObsSelected}
            onPress={removePhotos}
          />
        </View>
      </FloatingActionBar>
      <ButtonBar
        sticky
        containerClass="items-center z-50 bg-white"
        onLayout={onLayout}
      >
        <Button
          className="max-w-[500px] w-full"
          level="focus"
          text={t( "IMPORT-X-OBSERVATIONS", { count: groupedPhotos.length } )}
          onPress={navBasedOnUserSettings}
          testID="GroupPhotos.next"
          loading={isCreatingObservations}
        />
      </ButtonBar>
    </ViewWrapper>
  );
};

export default GroupPhotos;
