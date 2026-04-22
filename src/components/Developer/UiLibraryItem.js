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
import PivotCardsDemo from "./UiLibrary/PivotCardsDemo";
import TaxonGridItemDemo from "./UiLibrary/TaxonGridItemDemo";
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
  PivotCardsDemo,
  TaxonGridItemDemo,
  TaxonResultDemo,
  Typography,
};

const UiLibraryItem = ( ) => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  useEffect(
    ( ) => navigation.setOptions( { title: params.title } ),
    [navigation, params.title],
  );

  // For reasons I don't understand hot reload doesn't work with this LIBRARY
  // approach, so if you want that you might just need to render the
  // component explicitly here. ~~~~kueda20240613
  // return <ObsGridItemDemo />;
  return typeof ( LIBRARY[params.component] ) === "function"
    ? LIBRARY[params.component]()
    : <ActivityIndicator />;
};

export default UiLibraryItem;
