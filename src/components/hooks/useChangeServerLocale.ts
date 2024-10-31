import { updateUsers } from "api/users";
import { RealmContext } from "providers/contexts.ts";
import { useEffect, useState } from "react";
import Queue from "realmModels/Queue.ts";
import {
  useAuthenticatedMutation
} from "sharedHooks";

const { useRealm } = RealmContext;

const useChangeServerLocale = ( ) => {
  const realm = useRealm( );
  const [isMutating, setIsMutating] = useState( false );

  const queue = realm.objects( "Queue" ).sorted( "id" );
  const firstQueueItem = queue?.[0];
  const mutationParams = firstQueueItem
    ? JSON.parse( firstQueueItem?.payload )
    : null;

  const updateUserMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => updateUsers( params, optsWithAuth ),
    {
      onSuccess: ( ) => {
        console.log(
          "updated user locale on server to: ",
          mutationParams["user[locale]"]
        );
        Queue.dequeue( realm );
        setIsMutating( false );
      },
      onError: ( ) => {
        console.log( "error updating user locale in useChangeLocale" );
        setIsMutating( false );
      }
    }
  );

  useEffect( ( ) => {
    if ( !mutationParams || isMutating ) { return; }
    setIsMutating( true );
    updateUserMutation.mutate( mutationParams );
  }, [mutationParams, updateUserMutation, queue.length, isMutating] );
};

export default useChangeServerLocale;
