// @flow

import { useNavigation } from "@react-navigation/native";
import { MAX_PHOTOS_ALLOWED } from "components/Camera/StandardCamera/StandardCamera";
import {
  Body2,
  Button,
  CustomFlashList,
  FloatingActionBar,
  INatIcon,
  INatIconButton,
  StickyToolbar
} from "components/SharedComponents";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import { Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useCallback, useMemo, useState } from "react";
import { useTheme } from "react-native-paper";
import { useGridLayout } from "sharedHooks";
import colors from "styles/tailwindColors";

import GroupPhotoImage from "./GroupPhotoImage";

type Props = {
  combinePhotos: Function,
  groupedPhotos: Array<Object>,
  isCreatingObservations?: boolean,
  navToObsEditOrSuggestions: Function,
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
  navToObsEditOrSuggestions,
  removePhotos,
  selectedObservations,
  selectObservationPhotos,
  separatePhotos,
  totalPhotos
}: Props ): Node => {
  const navigation = useNavigation( );
  const theme = useTheme();
  const {
    estimatedGridItemSize,
    flashListStyle,
    gridItemStyle,
    gridItemWidth,
    numColumns
  } = useGridLayout( );
  const [stickyToolbarHeight, setStickyToolbarHeight] = useState( null );
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
      screen: "PhotoGallery",
      params: { fromGroupPhotos: true }
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
            borderColor: colors.mediumGray
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
      height
    } = event.nativeEvent.layout;
    setStickyToolbarHeight( height );
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
    gridItemWidth
  };

  return (
    <ViewWrapper>
      <CustomFlashList
        ListHeaderComponent={renderHeader}
        contentContainerStyle={flashListStyle}
        data={data}
        estimatedItemSize={estimatedGridItemSize}
        extraData={extraData}
        key={numColumns}
        keyExtractor={extractKey}
        numColumns={numColumns}
        renderItem={renderItem}
        testID="GroupPhotos.list"
      />
      <FloatingActionBar
        show={selectedObservations.length > 0 && typeof stickyToolbarHeight === "number"}
        position="bottomStart"
        containerClass="ml-[15px] rounded-md"
        footerHeight={stickyToolbarHeight}
      >
        <View className="rounded-md overflow-hidden flex-row">
          <INatIconButton
            icon="combine"
            mode="contained"
            size={20}
            color={colors.white}
            backgroundColor={theme.colors.primary}
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
            backgroundColor={theme.colors.primary}
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
      <StickyToolbar
        containerClass="items-center z-50"
        onLayout={onLayout}
      >
        <Button
          className="max-w-[500px] w-full"
          level="focus"
          text={t( "IMPORT-X-OBSERVATIONS", { count: groupedPhotos.length } )}
          onPress={navToObsEditOrSuggestions}
          testID="GroupPhotos.next"
          loading={isCreatingObservations}
        />
      </StickyToolbar>
    </ViewWrapper>
  );
};

export default GroupPhotos;
