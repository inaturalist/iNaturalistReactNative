import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import clearCaches from "sharedHelpers/clearCaches";

const { useRealm } = RealmContext;

const DeferredStartupService = ( ) => {
  const realm = useRealm( );
  useEffect( () => {
    const initializeApp = async ( ) => {
    // Run startup tasks when app launches
      if ( realm?.path ) {
        await clearCaches( realm );
      }
    };
    initializeApp();
  }, [realm] );

  return null;
};

export default DeferredStartupService;
