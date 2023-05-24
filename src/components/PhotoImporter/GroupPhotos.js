// @flow

import {
  Body2, Button, FloatingActionBar, StickyToolbar
} from "components/SharedComponents";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { FlatList } from "react-native";
import { Appbar } from "react-native-paper";

import GroupPhotoImage from "./GroupPhotoImage";

type Props = {
  groupedPhotos: Array<Object>,
  selectedObservations: Array<Object>,
  selectObservationPhotos: Function,
  navToObsEdit: Function,
  combinePhotos: Function,
  removePhotos: Function,
  separatePhotos: Function
}

const GroupPhotos = ( {
  groupedPhotos,
  selectedObservations,
  selectObservationPhotos,
  navToObsEdit,
  combinePhotos,
  removePhotos,
  separatePhotos
}: Props ): Node => {
  const renderImage = ( { item } ) => (
    <GroupPhotoImage
      item={item}
      selectedObservations={selectedObservations}
      selectObservationPhotos={selectObservationPhotos}
    />
  );

  const extractKey = ( item, index ) => `${item.photos[0].uri}${index}`;

  const noObsSelected = selectedObservations.length === 0;
  const oneObsSelected = selectedObservations.length === 1;
  const obsWithMultiplePhotosSelected = selectedObservations?.[0]?.photos?.length > 1;

  return (
    <ViewWrapper>
      <View className="mx-5">
        <Body2 className="mt-5">{t( "Group-photos-onboarding" )}</Body2>
      </View>
      <FlatList
        className="mt-5"
        data={groupedPhotos}
        initialNumToRender={4}
        keyExtractor={extractKey}
        numColumns={2}
        renderItem={renderImage}
        testID="GroupPhotos.list"
      />
      <FloatingActionBar
        show={selectedObservations.length > 0}
        position="bottomStart"
        containerClass="bottom-[100px] ml-1 rounded-md"
      >
        <View className="rounded-md overflow-hidden">
          <Appbar.Header>
            <Appbar.Action
              icon="combine"
              onPress={combinePhotos}
              disabled={noObsSelected || oneObsSelected}
              accessibilityLabel={t( "Combine-Photos" )}
            />
            <Appbar.Action
              icon="separate"
              onPress={separatePhotos}
              disabled={!obsWithMultiplePhotosSelected}
              accessibilityLabel={t( "Separate-Photos" )}
            />
            <Appbar.Action
              icon="trash-outline"
              onPress={removePhotos}
              disabled={noObsSelected}
              accessibilityLabel={t( "Remove-Photos" )}
            />
          </Appbar.Header>
        </View>
      </FloatingActionBar>
      <StickyToolbar>
        <Button
          className="mt-2 mx-4"
          level="focus"
          text={t( "UPLOAD-X-OBSERVATIONS", { count: groupedPhotos.length } )}
          onPress={navToObsEdit}
          testID="GroupPhotos.next"
        />
      </StickyToolbar>
    </ViewWrapper>
  );
};

export default GroupPhotos;
