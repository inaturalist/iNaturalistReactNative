import { act } from "@testing-library/react-native";
import useStore from "stores/useStore";

export default function setStoreStateFeatureFlags( flagsToMerge ) {
  const initialState = useStore.getInitialState();
  act( () => {
    useStore.setState( {
      featureFlagConfig: {
        ...initialState.featureFlagConfig,
        ...flagsToMerge,
      },
    } );
  } );
}
