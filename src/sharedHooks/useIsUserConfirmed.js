// @flow
import { useEffect, useState } from "react";
import {
  useUserMe
} from "sharedHooks";

const { parseISO, isAfter } = require( "date-fns" );

// Only users created after this date are checked for confirmation
// TODO - need to decide on the date
const USER_MIN_REGISTRATION_DATE = parseISO( "2012-01-01T00:00:00Z" );

const useIsUserConfirmed = ( ) => {
  const { remoteUser } = useUserMe( );
  // By default, we consider the user confirmed (to not show email confirmation bottom sheet
  // to non-logged-in users, users with earlier registration date, etc.)
  const [isUserConfirmed, setIsUserConfirmed] = useState( true );

  useEffect( ( ) => {
    // Non-logged-in users are considered confirmed
    if ( remoteUser && remoteUser.created_at ) {
      const createdAt = parseISO( remoteUser.created_at );
      if ( isAfter( createdAt, USER_MIN_REGISTRATION_DATE ) ) {
        if ( remoteUser.confirmed_at ) {
          setIsUserConfirmed( true );
        } else {
          // User fit the criteria (registered after min date),
          // but hasn't confirmed their email address
          setIsUserConfirmed( false );
        }

        return;
      }
    }

    setIsUserConfirmed( true );
  }, [remoteUser] );

  return isUserConfirmed;
};

export default useIsUserConfirmed;
