import useStore from "stores/useStore";

export default function setStoreStateLayout( stateToMerge ) {
  const initialState = useStore.getInitialState();
  useStore.setState( {
    layout: {
      ...initialState.layout,
      ...stateToMerge
    }
  } );
}
