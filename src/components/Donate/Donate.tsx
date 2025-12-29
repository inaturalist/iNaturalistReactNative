// import { useNavigation } from "@react-navigation/native";
import {
  Body2, Button, Heading4, ScrollViewWrapper,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React from "react";
import * as StoreReview from "react-native-store-review";
import { openExternalWebBrowser } from "sharedHelpers/util";

const Donate = () => {
  // const navigation = useNavigation( );
  const onDonatePress = async ( ) => {
    const url = "https://www.inaturalist.org/donate?utm_campaign=default&utm_medium=mobile&utm_source=iNatRN";
    // Temporarily disable in-app donation until we can convince Apple that we
    // really are a non-profit
    // navigation.navigate( "FullPageWebView", {
    //   title: t( "DONATE-TO-INATURALIST" ),
    //   initialUrl: url,
    //   loggedIn: false,
    //   skipSetSourceInShouldStartLoadWithRequest: true
    // } );
    openExternalWebBrowser( url );
  };

  const onReviewPress = ( ) => {
    StoreReview.requestReview( );
  };

  return (
    <ScrollViewWrapper>
      <View className="p-4">
        <Heading4 className="mb-3">{t( "DONATE-TO-INATURALIST" )}</Heading4>
        <Body2 className="mb-5">{t( "Your-donation-to-iNaturalist" )}</Body2>
        <Body2 className="mb-5">{t( "iNaturalist-is-a-501" )}</Body2>
        <Button
          className="mb-8"
          level="focus"
          text={t( "DONATE-TO-INATURALIST" )}
          onPress={() => onDonatePress( )}
        />
        <Heading4 className="mb-3">{t( "INATURALIST-STORE" )}</Heading4>
        <Body2 className="mb-5">
          {t( "You-can-also-check-out-merchandise" )}
        </Body2>
        <Button
          className="mb-8"
          level="neutral"
          text={t( "SHOP-INATURALIST-MERCH" )}
          onPress={() => openExternalWebBrowser( "https://inaturalist.threadless.com" )}
        />
        <Heading4 className="mb-3">{t( "LEAVE-US-A-REVIEW" )}</Heading4>
        <Button
          className="mb-8"
          level="neutral"
          text={t( "REVIEW-INATURALIST" )}
          onPress={() => onReviewPress( )}
        />
      </View>
    </ScrollViewWrapper>
  );
};

export default Donate;
