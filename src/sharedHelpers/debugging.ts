import {
  useEffect, useRef,
} from "react";

function useWhyEffectRuns( effectName: string, dependenciesObject: Record<string, unknown> ) {
  const prev = useRef( dependenciesObject );

  useEffect( () => {
    const changed = Object.entries( dependenciesObject ).filter(
      ( [key, value] ) => !Object.is( value, prev.current[key] ),
    );

    if ( changed.length ) {
      console.log(
        `[${effectName}] dependencies changed:`,
        changed.map( ( [k, v] ) => ( {
          key: k,
          prev: prev.current[k],
          next: v,
        } ) ),
      );
    } else {
      console.log(
        `[${effectName}] ran, but no dependencies changed.`,
      );
    }

    prev.current = dependenciesObject;
  } );
}
export default useWhyEffectRuns;
