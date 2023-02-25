// @flow
import ContextHeader from "./ContextHeader";

const showHeader: Object = {
  headerShown: true,
  headerBackTitleVisible: false,
  headerShadowVisible: false,
  header: ContextHeader
};

const hideHeader = {
  headerShown: false
};

const hideScreenTransitionAnimation = {
  animation: "none"
};

const blankHeaderTitle = {
  headerTitle: ""
};

export {
  blankHeaderTitle,
  hideHeader,
  hideScreenTransitionAnimation,
  showHeader
};
