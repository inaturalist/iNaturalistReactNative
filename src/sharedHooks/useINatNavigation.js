import { useNavigation, useRoute } from "@react-navigation/native";
import { MAIN_STACK } from "navigation/navigationIds";

const useINatNavigation = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const navigate = ( screen, params = {} ) => {
    let parentScreen = screen;
    if ( MAIN_STACK.has( screen ) ) {
      parentScreen = "MainStack";
    }

    if ( parentScreen === screen ) {
      return navigation.navigate( screen, params );
    }

    return navigation.navigate( parentScreen, {
      screen,
      params: {
        ...params,
        fromScreen: route.name,
        fromScreenParams: route?.params
      }
    } );
  };

  const goBack = () => {
    const { fromScreen, fromScreenParams = { } } = route?.params || {};
    if ( navigation.canGoBack() ) {
      return navigation.goBack();
    }

    if ( fromScreen ) {
      return navigate( fromScreen, fromScreenParams );
    }

    return null;
  };

  return {
    ...navigation,
    navigate,
    goBack
  };
};

export default useINatNavigation;
