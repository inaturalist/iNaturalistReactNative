import { useEffect, useState } from "react";

import { RealmContext } from "../../providers/contexts";
import Repository from "./Repository";

const { useRealm } = RealmContext;

const useRepository = modelName => {
  const realm = useRealm( );
  const [repository, setRepository] = useState( null );

  useEffect( ( ) => {
    if ( realm ) {
      setRepository( new Repository( modelName, realm ) );
    }
    return ( ) => {
      setRepository( null );
    };
  }, [realm, modelName] );

  return repository;
};

export default useRepository;
