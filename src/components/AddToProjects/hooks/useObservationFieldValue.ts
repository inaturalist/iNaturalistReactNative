import { useState } from "react";
import type { RealmObservationPojo } from "realmModels/types";
import useStore from "stores/useStore";

const useObservationFieldValue = ( obsFieldId: number ) => {
  const observationFieldValues = useStore(
    // currentObs is typed as this | null in createObservationFlowSlice.ts but null means the
    // obs create flow has not been initialized yet. The screen that uses this hook to add obs
    // to projects should only be reachable after currentObs has been initialized in zustand.
    // If it isn't I'd prefer us to crash here to notice it.
    state => ( state.currentObservation as RealmObservationPojo ).observationFieldValues,
  );

  const existingOfv = observationFieldValues.find(
    ofv => ofv.obsFieldId === obsFieldId,
  );
  const value = existingOfv?.value ?? "";
  const [value2, setValue] = useState();

  console.log( "value2", value2 );

  return { value, setValue };
};

export default useObservationFieldValue;
