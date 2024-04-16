import { useNavigation, useRoute } from "@react-navigation/native";
import { ActivityIndicator } from "components/SharedComponents";
import React, { useEffect } from "react";

import ActivityIndicatorDemo from "./UiLibrary/ActivityIndicatorDemo";
import Buttons from "./UiLibrary/Buttons";
import FloatingActionBarDemo from "./UiLibrary/FloatingActionBarDemo";
import Icons from "./UiLibrary/Icons";
import Misc from "./UiLibrary/Misc";
import Typography from "./UiLibrary/Typography";

const LIBRARY = {
  ActivityIndicatorDemo,
  Buttons,
  FloatingActionBarDemo,
  Icons,
  Typography,
  Misc
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
