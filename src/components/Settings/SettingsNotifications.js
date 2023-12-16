// @flow

import { Checkbox } from "components/SharedComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text, View } from "react-native";
import Switch from "react-native/Libraries/Components/Switch/Switch";
import { textStyles, viewStyles } from "styles/settings/settings";

import type { SettingsProps } from "./types";

const EMAIL_NOTIFICATIONS = {
  Comments: "prefers_comment_email_notification",
  Identifications: "prefers_identification_email_notification",
  Mentions: "prefers_mention_email_notification",
  Messages: "prefers_message_email_notification",
  "Project journal posts": "prefers_project_journal_post_email_notification",
  // eslint-disable-next-line max-len
  "When a project adds your observations": "prefers_project_added_your_observation_email_notification",
  "Project curator changes": "prefers_project_curator_change_email_notification",
  "Taxonomy changes": "prefers_taxon_change_email_notification",
  "Observations by people I follow": "prefers_user_observation_email_notification",
  // eslint-disable-next-line max-len
  "Observations of taxa or from places that I subscribe to": "prefers_taxon_or_place_observation_email_notification"
};

const EmailNotification = ( { title, value, onValueChange } ): Node => (
  <Checkbox
    isChecked={value}
    onPress={onValueChange}
    text={title}
  />
);

const Notification = ( {
  title, description, value, onValueChange
} ): Node => (
  <View style={[viewStyles.row, viewStyles.notificationContainer]}>
    <View style={[viewStyles.column, viewStyles.notificationLeftSide]}>
      <Text style={textStyles.notificationTitle}>{title}</Text>
      <Text>{description}</Text>
    </View>
    <View style={[viewStyles.column, viewStyles.switch]}>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  </View>
);

const SettingsNotifications = ( { settings, onSettingsModified }: SettingsProps ): Node => (
  <>
    <Text style={textStyles.title}>{t( "iNaturalist-Activity-Notifications" )}</Text>
    <Notification
      title="Notify me of mentions (e.g. @username)"
      // eslint-disable-next-line max-len
      description="If you turn this off, you will not get any notifications when someone mentions you on iNaturalist."
      value={settings.prefers_receive_mentions}
      onValueChange={v => onSettingsModified( { ...settings, prefers_receive_mentions: v } )}
    />
    <Notification
      title="Confirming ID's"
      // eslint-disable-next-line max-len
      description="If you turn this off, you will no longer be notified about IDs that agree with yours."
      value={settings.prefers_redundant_identification_notifications}
      onValueChange={v => onSettingsModified( {
        ...settings,
        prefers_redundant_identification_notifications: v
      } )}
    />
    <Text style={textStyles.title}>{t( "Email-Notifications" )}</Text>
    <Notification
      title="Receive Email Notifications"
      // eslint-disable-next-line max-len
      description="If you turn this off, you will no longer receive any emails from iNaturalist regarding notifications."
      value={!settings.prefers_no_email}
      onValueChange={v => onSettingsModified( { ...settings, prefers_no_email: !v } )}
    />

    {!settings.prefers_no_email
      && (
        <>
          {Object.keys( EMAIL_NOTIFICATIONS ).map( k => (
            <EmailNotification
              key={k}
              title={k}
              value={settings[EMAIL_NOTIFICATIONS[k]]}
              onValueChange={
                // $FlowIgnore
                v => onSettingsModified( { ...settings, [EMAIL_NOTIFICATIONS[k]]: v } )
              }
            />
          ) )}
        </>
      )}
  </>
);

export { EMAIL_NOTIFICATIONS, SettingsNotifications };
