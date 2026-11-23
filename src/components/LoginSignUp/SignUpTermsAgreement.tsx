import Checkbox from "components/SharedComponents/Checkbox";
import Body2 from "components/SharedComponents/Typography/Body2";
import UnderlinedLink from "components/SharedComponents/Typography/UnderlinedLink";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import { Trans } from "react-i18next";
import useTranslation from "sharedHooks/useTranslation";

// The numbered tags <Trans> swaps for components
const TRANS_TAGS = /<\/?\d+>/g;

interface Props {
  checked: boolean;
  // Ignores presses on the checkbox and the link
  disabled?: boolean;
  onChange: ( checked: boolean ) => void;
  onLearnMore: ( ) => void;
}

// The required agreement to the Terms of Use, Privacy Policy and Community
// Guidelines, with a link to read them
const SignUpTermsAgreement = ( {
  checked, disabled = false, onChange, onLearnMore,
}: Props ) => {
  const { t } = useTranslation( );
  const agreementText = t( "I-agree-to-the-Terms-of-Use" ).replace( TRANS_TAGS, "" );

  const toggle = ( ) => {
    if ( !disabled ) onChange( !checked );
  };

  return (
    <View className="flex-row mt-5 items-start">
      <Checkbox
        accessibilityLabel={agreementText}
        transparent
        isChecked={checked}
        onPress={toggle}
      />
      <View className="flex-1 -ml-2">
        {/* The checkbox is the accessible control; this only widens its tap target */}
        <Pressable accessible={false} onPress={toggle}>
          <Trans
            i18nKey="I-agree-to-the-Terms-of-Use"
            components={[
              <Body2 key="0" className="text-white" />,
              <Body2 key="1" className="text-white italic" />,
            ]}
          />
        </Pressable>
        <UnderlinedLink
          className="color-white mt-[9px]"
          accessibilityRole="link"
          accessibilityState={{ disabled }}
          onPress={disabled
            ? undefined
            : onLearnMore}
        >
          {t( "Learn-More" )}
        </UnderlinedLink>
      </View>
    </View>
  );
};

export default SignUpTermsAgreement;
