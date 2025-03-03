import { resendEmailConfirmation } from "api/users";
import { getJWT } from "components/LoginSignUp/AuthenticationService.ts";
import {
  WarningSheet
} from "components/SharedComponents";
import React, { useState } from "react";
import { useWindowDimensions, View } from "react-native";
import HTML from "react-native-render-html";
import { openInbox } from "sharedHelpers/mail.ts";
import {
  useTranslation, useUserMe
} from "sharedHooks";

const EmailConfirmationSheet = ( {
  onPressClose
} ) => {
  const { t } = useTranslation( );
  const [sentEmail, setSentEmail] = useState( false );
  const [sendingConfirmationEmail, setSendingConfirmationEmail] = useState( false );
  const { remoteUser } = useUserMe( );
  const { width } = useWindowDimensions( );

  const resendConfirmationEmail = async ( ) => {
    // Resend confirmation email
    setSendingConfirmationEmail( true );

    const apiToken = await getJWT( );
    const options = { api_token: apiToken };
    await resendEmailConfirmation( options );

    setSendingConfirmationEmail( false );
    setSentEmail( true );
  };

  return (
    <WarningSheet
      loading={sendingConfirmationEmail}
      onPressClose={onPressClose}
      confirm={sentEmail
        ? openInbox
        : resendConfirmationEmail}
      headerText={sentEmail
        ? t( "EMAIL-SENT" )
        : t( "PLEASE-CONFIRM-EMAIL" )}
      rawText={(
        <View className="p-4">
          <HTML
            contentWidth={width}
            source={{ html: t( "In-order-to-add-comments-or-IDs", { email: remoteUser?.email } ) }}
          />
        </View>
      )}
      buttonText={sentEmail
        ? t( "OPEN-EMAIL" )
        : t( "RESEND-CONFIRMATION-EMAIL" )}
      buttonType={sentEmail
        ? "focus"
        : "primary"}
    />
  );
};

export default EmailConfirmationSheet;
