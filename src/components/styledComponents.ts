import { FasterImageView as UnstyledFasterImageView } from "@candlefinance/faster-image";
import {
  BottomSheetTextInput as StyledBottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import UnstyledPressableWithTracking
  from "components/SharedComponents/Buttons/PressableWithTracking";
import {
  Image as UnstyledImage,
  ImageBackground as UnstyledImageBackground,
  KeyboardAvoidingView as UnstyledKeyboardAvoidingView,
  Modal as UnstyledModal,
  Platform,
  ScrollView as UnstyledScrollView,
  Text as UnstyledText,
  TextInput as UntyledTextInput,
  View as UnstyledView,
} from "react-native";
import UnstyledLinearGradient from "react-native-linear-gradient";
import { SafeAreaView as UnstyledSafeAreaView } from "react-native-safe-area-context";

const View = UnstyledView;
const KeyboardAvoidingView = UnstyledKeyboardAvoidingView;
// Since upgrading to React Native 0.73 UnstyledSafeAreaView is undefined in the jest tests
// Why I don't know. This is just to fix the failing tests.
const SafeAreaView = UnstyledSafeAreaView === undefined
  ? UnstyledView
  : UnstyledSafeAreaView;
const ScrollView = UnstyledScrollView;
const Text = UnstyledText;
const TextInput = UntyledTextInput;
const Pressable = UnstyledPressableWithTracking;
const Image = UnstyledImage;
const BottomSheetTextInput = StyledBottomSheetTextInput;
const Modal = UnstyledModal;
const ImageBackground = UnstyledImageBackground;

const fontMonoClass: string = ( Platform.OS === "ios"
  ? "font-Menlo"
  : "font-monospace" );

const LinearGradient = UnstyledLinearGradient;

const FasterImageView = UnstyledFasterImageView;

export {
  BottomSheetTextInput,
  FasterImageView,
  fontMonoClass,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  LinearGradient,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
};
