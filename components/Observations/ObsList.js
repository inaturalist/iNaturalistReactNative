// @flow

import React from "react";
import { FlatList, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import { useTranslation } from "react-i18next";

import ObsCard from "./ObsCard";
import useFetchObservations from "./hooks/fetchObservations";
import EmptyList from "./EmptyList";
import useFetchObsListFromRealm from "./hooks/fetchObsListFromRealm";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";

const ObsList = ( ): Node => {
  const [count, setCounter] = React.useState( 0 );
  const { t, i18n } = useTranslation( );
  const navigation = useNavigation( );
  const navToObsDetails = observation => navigation.navigate( "ObsDetails", { obsId: observation.uuid } );
  const localObservations = useFetchObsListFromRealm( );
  // this custom hook fetches on first component render
  // (and anytime you save while in debug - hot reloading mode )
  useFetchObservations( );

  const extractKey = item => item.uuid;
  const renderItem = ( { item } ) => <ObsCard item={item} handlePress={navToObsDetails} />;

  const renderEmptyState = ( ) => <EmptyList />;

  const lngs = {
    en: { nativeName: "English" },
    de: { nativeName: "Deutsch" }
  };

  return (
    <ViewWithFooter>
      {Object.keys( lngs ).map( lng => {
        return (
          <Pressable
            key={lng}
            onPress={() => {
              i18n.changeLanguage( lng );
              setCounter( count + 1 );
            } }
          >
            <Text>{lngs[lng].nativeName}</Text>
          </Pressable>
        );
      } )}
      <Text>{t( "number_of_observations", {count: localObservations.length } )}</Text>
      <FlatList
        data={localObservations}
        keyExtractor={extractKey}
        renderItem={renderItem}
        testID="ObsList.myObservations"
        ListEmptyComponent={renderEmptyState}
      />
    </ViewWithFooter>
  );
};

export default ObsList;
