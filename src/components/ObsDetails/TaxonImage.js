// @flow

import { Image } from "components/styledComponents";
import * as React from "react";

type Props = {
  uri: Object
}

const TaxonImage = ( { uri }: Props ): React.Node => (
  <Image
    source={uri}
    className="w-[62px] h-[62px] rounded-lg mr-3"
    accessibilityIgnoresInvertColors
  />
);

export default TaxonImage;
