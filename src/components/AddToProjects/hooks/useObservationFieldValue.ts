import { useCallback } from "react";
import ObservationFieldValue from "realmModels/ObservationFieldValue";
import type { RealmObservationFieldValuePojo, RealmObservationPojo } from "realmModels/types";
import useStore from "stores/useStore";

const useObservationFieldValue = ( obsFieldId: number ) => {
  const observationFieldValues = useStore(
    // currentObs is typed as this | null in createObservationFlowSlice.ts but null means the
    // obs create flow has not been initialized yet. The screen that uses this hook to add obs
    // to projects should only be reachable after currentObs has been initialized in zustand.
    // If it isn't I'd prefer us to error out here to notice it.
    state => ( state.currentObservation as RealmObservationPojo ).observationFieldValues,
  );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );

  const existingOfv = observationFieldValues.find(
    ofv => ofv.obsFieldId === obsFieldId,
  );
  const value = existingOfv?.value ?? "";

  const setValue = useCallback( ( newValue: string | null ) => {
    const index = observationFieldValues.findIndex( ofv => ofv.obsFieldId === obsFieldId );

    let updatedOfvs: RealmObservationFieldValuePojo[];

    if ( !newValue || newValue.trim( ) === "" ) {
      // If newValue is from a selection being removed (null | "") remove OFV from the list
      updatedOfvs = observationFieldValues.filter( ofv => ofv.obsFieldId !== obsFieldId );
    } else if ( index >= 0 ) {
      // Update existing OFV
      updatedOfvs = [...observationFieldValues];
      updatedOfvs[index] = {
        ...updatedOfvs[index],
        value: newValue,
        _updated_at: new Date( ),
      };
    } else {
      // Create new OFV
      updatedOfvs = [
        ...observationFieldValues,
        ObservationFieldValue.new( obsFieldId, newValue ),
      ];
    }

    updateObservationKeys( { observationFieldValues: updatedOfvs } );
  }, [obsFieldId, observationFieldValues, updateObservationKeys] );

  return { value, setValue };
};

export default useObservationFieldValue;
