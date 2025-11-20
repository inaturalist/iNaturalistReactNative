import type { RootStackParamList } from "@react-navigation/native";

declare global {
  namespace ReactNavigation {
    type RootParamList = RootStackParamList
  }
}
