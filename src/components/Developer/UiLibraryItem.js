import { useNavigation, useRoute } from "@react-navigation/native";
import { ActivityIndicator } from "components/SharedComponents";
import React, { useEffect } from "react";

import ActivityIndicatorDemo from "./UiLibrary/ActivityIndicatorDemo";
import Buttons from "./UiLibrary/Buttons";
import FloatingActionBarDemo from "./UiLibrary/FloatingActionBarDemo";
import Icons from "./UiLibrary/Icons";
import Misc from "./UiLibrary/Misc";
import ObsGridItemDemo from "./UiLibrary/ObsGridItemDemo";
import ObsListItemDemo from "./UiLibrary/ObsListItemDemo";
import TaxonResultDemo from "./UiLibrary/TaxonResultDemo";
import Typography from "./UiLibrary/Typography";

const LIBRARY = {
  ActivityIndicatorDemo,
  Buttons,
  FloatingActionBarDemo,
  Icons,
  Misc,
  ObsGridItemDemo,
  ObsListItemDemo,
  TaxonResultDemo,
  Typography
};

const UiLibraryItem = ( ) => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  useEffect(
    ( ) => navigation.setOptions( { title: params.title } ),
    [navigation, params.title]
  );

  return typeof ( LIBRARY[params.component] ) === "function"
    ? LIBRARY[params.component]()
    : <ActivityIndicator />;
};

export default UiLibraryItem;
