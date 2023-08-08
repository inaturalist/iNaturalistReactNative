// @flow

import { Image } from "components/styledComponents";
import * as React from "react";

type Props = {
  uri: Object,
  withdrawn?: boolean
}

const TaxonImage = ( { uri, withdrawn }: Props ): React.Node => {
  let classname = "w-[62px] h-[62px] rounded-lg mr-3";
  if ( withdrawn ) {
    classname = "w-[62px] h-[62px] rounded-lg mr-3 opacity-50";
  }
  return (
    <Image
      source={uri}
      className={classname}
      accessibilityIgnoresInvertColors
    />
  );
};
export default TaxonImage;
