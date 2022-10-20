// @flow

import { styled } from "nativewind";
import {
  Image as StyledImage,
  KeyboardAvoidingView as StyledKeyboardAvoidingView,
  Platform,
  Pressable as StyledPressable,
  SafeAreaView as StyledSafeAreaView,
  ScrollView as StyledScrollView,
  Text as StyledText,
  TextInput as StyledTextInput,
  View as StyledView
} from "react-native";

// $FlowIgnore
const View = styled( StyledView );
// $FlowIgnore
const KeyboardAvoidingView = styled( StyledKeyboardAvoidingView );
// $FlowIgnore
const SafeAreaView = styled( StyledSafeAreaView );
// $FlowIgnore
const ScrollView = styled( StyledScrollView );
// $FlowIgnore
const HeaderText = styled(
  StyledText,
  Platform.OS === "ios" ? "font-Papyrus-Condensed" : "font-Roboto"
);
// $FlowIgnore
const Text = styled(
  StyledText,
  Platform.OS === "ios" ? "font-Whitney-Medium" : "font-Whitney-Medium-Pro"
);
// $FlowIgnore
const TextInput = styled( StyledTextInput );
// $FlowIgnore
const Pressable = styled( StyledPressable );
// $FlowIgnore
const Image = styled( StyledImage );

export {
  HeaderText,
  Image,
  KeyboardAvoidingView,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View
};
