import {
  Body2,
  Button,
  Heading4,
  ScrollViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React from "react";
import { openExternalWebBrowser } from "sharedHelpers/util";

const Help = ( ) => (
  <ScrollViewWrapper>
    <View className="p-4">
      <Heading4 className="mb-3">{t( "INATURALIST-HELP-PAGE" )}</Heading4>
      <Body2 className="mb-5">
        {t( "You-can-find-answers-on-our-help-page" )}
      </Body2>
      <Button
        className="mb-8"
        level="neutral"
        text={t( "VIEW-INATURALIST-HELP" )}
        onPress={( ) => openExternalWebBrowser( "https://help.inaturalist.org/en/support/solutions/folders/151000552453" )}
      />
      <Heading4 className="mb-3">{t( "CONTACT-SUPPORT" )}</Heading4>
      <Body2 className="mb-5">
        {t( "Still-need-help" )}
      </Body2>
      <Button
        className="mb-8"
        level="neutral"
        text={t( "CONTACT-SUPPORT" )}
        onPress={( ) => openExternalWebBrowser( "https://help.inaturalist.org/support/tickets/new" )}
      />
      <Heading4 className="mb-3">{t( "EDUCATORS" )}</Heading4>
      <Body2 className="mb-5">
        {t( "Are-you-an-educator" )}
      </Body2>
      <Button
        className="mb-8"
        level="neutral"
        text={t( "VIEW-EDUCATORS-GUIDE" )}
        onPress={
          ( ) => openExternalWebBrowser(
            "https://help.inaturalist.org/support/solutions/articles/151000170805"
          )
        }
      />
      <Heading4 className="mb-3">{t( "INATURALIST-FORUM" )}</Heading4>
      <Body2 className="mb-5">
        {t( "Connect-with-other-naturalists" )}
      </Body2>
      <Button
        className="mb-8"
        level="neutral"
        text={t( "INATURALIST-FORUM" )}
        onPress={( ) => openExternalWebBrowser( "https://forum.inaturalist.org" )}
      />
    </View>
  </ScrollViewWrapper>
);

export default Help;
