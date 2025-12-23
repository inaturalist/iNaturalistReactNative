import { act } from "@testing-library/react-native";
import useStore from "stores/useStore";

export default function setStoreStateLayout( stateToMerge ) {
  const initialState = useStore.getInitialState();
  act( () => {
    useStore.setState( {
      layout: {
        ...initialState.layout,
        ...stateToMerge,
      },
    } );
  } );
}
