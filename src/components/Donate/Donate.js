// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Body2, Button, Heading4, ScrollViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import * as StoreReview from "react-native-store-review";

const Donate = (): Node => {
  const navigation = useNavigation( );
  const onDonatePress = async ( ) => {
    const url = "https://inaturalist.org/donate";
    navigation.navigate( "FullPageWebView", {
      title: t( "Donate-to-iNaturalist" ),
      initialUrl: url,
      loggedIn: false,
      openLinksInBrowser: true
    } );
  };

  const onShopPress = async ( ) => {
    const url = "https://inaturalist.threadless.com";
    navigation.navigate( "FullPageWebView", {
      title: t( "Shop-iNaturalist-Merch" ),
      initialUrl: url,
      loggedIn: false,
      openLinksInBrowser: true
    } );
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
          onPress={() => onShopPress( )}
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
