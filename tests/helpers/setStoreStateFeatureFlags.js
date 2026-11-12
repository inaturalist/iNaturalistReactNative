import { act } from "@testing-library/react-native";
import useStore from "stores/useStore";

// Sets flags as Debug overrides, which win over API values and hard-coded defaults
export default function setStoreStateFeatureFlags( flagsToMerge ) {
  const initialState = useStore.getInitialState();
  act( () => {
    useStore.setState( {
      featureFlagDebugOverrides: {
        ...initialState.featureFlagDebugOverrides,
        ...flagsToMerge,
      },
    } );
  } );
}
