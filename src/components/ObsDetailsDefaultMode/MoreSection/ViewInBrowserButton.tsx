// @flow

import {
  Body3
} from "components/SharedComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { openExternalWebBrowser } from "sharedHelpers/util.ts";

type Props = {
  id: number
}

const OBSERVATION_URL = "https://www.inaturalist.org/observations";

const ViewInBrowserButton = ( { id }: Props ): Node => (
  <Body3
    className="underline mt-[11px]"
    accessibilityRole="link"
    onPress={async () => openExternalWebBrowser( `${OBSERVATION_URL}/${id}` )}
  >
    {t( "View-in-browser" )}
  </Body3>
);

export default ViewInBrowserButton;
