import { useNavigation } from "@react-navigation/native";
import {
  Body1,
  ViewWrapper
} from "components/SharedComponents";
import {
  Pressable
} from "components/styledComponents";
import { sortBy } from "lodash";
import type { Node } from "react";
import React from "react";
import {
  FlatList
} from "react-native";

// Note: you need to add here and in UiLibraryItem
const ITEMS = sortBy( [
  { title: "Activity Indicator", component: "ActivityIndicatorDemo" },
  { title: "Buttons", component: "Buttons" },
  { title: "Floating Action Bar", component: "FloatingActionBarDemo" },
  { title: "Icons", component: "Icons" },
  { title: "Login/Signup LearnMore", component: "LoginSignUpLearnMoreDemo" },
  { title: "Typography", component: "Typography" },
  { title: "ObsListItem", component: "ObsListItemDemo" },
  { title: "TaxonResult", component: "TaxonResultDemo" },
  { title: "ObsGridItem", component: "ObsGridItemDemo" },
  { title: "TaxonGridItem", component: "TaxonGridItemDemo" },
  { title: "Toolbar", component: "ToolbarDemo" }
], item => item.title );
ITEMS.push( { title: "Everything Else", component: "Misc" } );

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
