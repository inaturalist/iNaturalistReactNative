import { useNavigation } from "@react-navigation/native";
import {
  Body1,
  ViewWrapper
} from "components/SharedComponents";
import {
  Pressable
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  FlatList
} from "react-native";

const ITEMS = [
  {
    title: "Activity Indicator",
    component: "ActivityIndicatorDemo"
  },
  {
    title: "Buttons",
    component: "Buttons"
  },
  {
    title: "Floating Action Bar",
    component: "FloatingActionBarDemo"
  },
  {
    title: "Icons",
    component: "Icons"
  },
  {
    title: "Typography",
    component: "Typography"
  },
  {
    title: "Everything Else",
    component: "Misc"
  }
];

const UiLibrary = (): Node => {
  const navigation = useNavigation( );
  return (
    <ViewWrapper>
      <FlatList
        data={ITEMS}
        renderItem={( { item } ) => (
          <Pressable
            accessibilityRole="link"
            onPress={( ) => navigation.navigate( "UiLibraryItem", item )}
            className="p-4 border-b-[1px] border-mediumGray"
          >
            <Body1>{ item.title }</Body1>
          </Pressable>
        )}
        keyExtractor={item => item.title}
      />
    </ViewWrapper>
  );
};

export default UiLibrary;
