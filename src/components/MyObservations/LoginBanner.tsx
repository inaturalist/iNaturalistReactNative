import { useNavigation } from "@react-navigation/native";
import {
  Body2,
  INatIcon
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import * as React from "react";
import type { RealmUser } from "realmModels/types";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadow( {
  offsetHeight: 2,
  shadowOpacity: 1,
  shadowRadius: 2
} );

type Props = {
  currentUser: RealmUser | null;
};

const LoginBanner = ( {
  currentUser
}: Props ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation();
  const loginBannerDismissed = useStore( state => state.layout.loginBannerDismissed );
  const setLoginBannerDismissed = useStore( state => state.layout.setLoginBannerDismissed );

  const dismissLoginBanner = () => {
    setLoginBannerDismissed();
  };

  if ( !currentUser && !loginBannerDismissed ) {
    return (
      <View className="z-20">
        <View
          className="absolute self-center top-0"
        >
          <View className="pt-[20px] px-[20px]" pointerEvents="box-none">
            <Pressable
              className="absolute top-0 right-0 justify-center items-center h-[44px] w-[44px] z-20"
              accessibilityRole="button"
              onPress={() => dismissLoginBanner()}
              accessibilityLabel={t( "Close" )}
            >
              <View className="
                justify-center
                items-center
                bg-lightGray
                h-[25px]
                w-[25px]
                rounded-xl"
              >
                <INatIcon
                  name="close"
                  color={colors.mediumGray}
                  size={11}
                />
              </View>
            </Pressable>
            <View pointerEvents="box-none">
              <Pressable
                style={DROP_SHADOW}
                accessibilityRole="button"
                className="
                flex-row
                shrink
                items-center
                justify-center
                p-[20px]
                space-x-[12px]
                bg-white
                rounded-xl
                z-10"
                onPress={() => navigation.navigate( "LoginStackNavigator" )}
                disabled={false}
              >
                <INatIcon
                  name="inaturalist"
                  size={25}
                  color={colors.inatGreen}
                />
                <Body2 maxFontSizeMultiplier={1}>
                  {t( "Already-have-an-iNaturalist-account" )}
                </Body2>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return null;
};

export default LoginBanner;
