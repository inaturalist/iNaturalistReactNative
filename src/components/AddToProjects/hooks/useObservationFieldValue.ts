import { useCallback } from "react";
import ObservationFieldValue from "realmModels/ObservationFieldValue";
import type { RealmObservationFieldValuePojo, RealmObservationPojo } from "realmModels/types";
import useStore from "stores/useStore";

const useObservationFieldValue = ( obsFieldId: number ) => {
  const currentObservation = useStore(
    // currentObs is typed as this | null in createObservationFlowSlice.ts but null means the
    // obs create flow has not been initialized yet. The screen that uses this hook to add obs
    // to projects should only be reachable after currentObs has been initialized in zustand.
    // If it isn't I'd prefer us to error out here to notice it.
    state => state.currentObservation as RealmObservationPojo,
  );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const { observationFieldValues } = currentObservation;

  const existingOfv = ObservationFieldValue.findActiveForObsField(
    currentObservation,
    obsFieldId,
  );
  const value = existingOfv?.value ?? "";

  const setValue = useCallback( ( newValue: string | null ) => {
    const existingRow = ObservationFieldValue.findForObsField(
      currentObservation,
      obsFieldId,
    );

    let updatedOfvs: RealmObservationFieldValuePojo[];

    if ( !newValue || newValue.trim( ) === "" ) {
      if ( existingRow?._synced_at != null ) {
        updatedOfvs = observationFieldValues.map( ofv => (
          ofv.obsFieldId === obsFieldId
            ? { ...ofv, _pendingRemoval: true }
            : ofv
        ) );
      } else {
        updatedOfvs = observationFieldValues.filter( ofv => ofv.obsFieldId !== obsFieldId );
      }
    } else if ( existingRow ) {
      updatedOfvs = observationFieldValues.map( ofv => (
        ofv.obsFieldId === obsFieldId
          ? {
            ...ofv,
            value: newValue,
            _updated_at: new Date( ),
            _pendingRemoval: undefined,
            _pending_deletion: undefined,
          }
          : ofv
      ) );
    } else {
      // Create new OFV
      updatedOfvs = [
        ...observationFieldValues,
        ObservationFieldValue.new( obsFieldId, newValue ),
      ];
    }

    updateObservationKeys( { observationFieldValues: updatedOfvs } );
  }, [currentObservation, obsFieldId, observationFieldValues, updateObservationKeys] );

  return { value, setValue };
};

export default useObservationFieldValue;
