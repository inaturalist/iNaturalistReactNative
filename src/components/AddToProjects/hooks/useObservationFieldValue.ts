import { useState } from "react";

const useObservationFieldValue = ( obsFieldId: number ) => {
  const [value, setValue] = useState();

  console.log( obsFieldId );

  return { value, setValue };
};

export default useObservationFieldValue;
