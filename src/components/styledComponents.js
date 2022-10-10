// @flow

import { styled } from "nativewind";
import {
  Image as StyledImage,
  KeyboardAvoidingView as StyledKeyboardAvoidingView,
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
const HeaderText = styled( StyledText, "font-Papyrus-Condensed" );
// $FlowIgnore
const Text = styled( StyledText, "font-Whitney-Medium" );
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
