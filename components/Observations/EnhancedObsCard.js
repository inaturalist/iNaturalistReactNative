// @flow strict-local

import withObservables from "@nozbe/with-observables";

import database from "../../model/database";
import ObservationsList from "./ObservationsList";

const enhance = withObservables( ["observations"], ( { observations } ) => {
  return {
    observations: database.collections
      .get( "observations" )
      .query()
      .observe()
  };
} );

const EnhancedList = enhance( ObservationsList );
export default EnhancedList;
