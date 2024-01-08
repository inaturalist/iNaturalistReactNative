// @flow
import ObservationIcon from "components/Notifications/ObservationIcon";
import ObsNotificationText from "components/Notifications/ObsNotificationText";
import {
  Body4,
  INatIcon
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import { formatIdDate } from "sharedHelpers/dateAndTime";
import { useTranslation } from "sharedHooks";

const { useRealm } = RealmContext;

    type Props = {
      item: Object
    };

const ObsNotification = ( { item }: Props ): Node => {
  const { t } = useTranslation( );
  const { identification, comment } = item;
  const type = item?.notifier_type;
  const { user } = identification || comment;
  const realm = useRealm( );
  const theme = useTheme();

  const { observationPhotos } = realm.objectForPrimaryKey( "Observation", item.resource_uuid );
  const displayPhoto = observationPhotos[0]?.photo;

  const photoUrl = displayPhoto?.url
    ? displayPhoto.url.replace( "square", "large" )
    : null;

  const renderIcon = () => {
    switch ( type ) {
      case "Identification":
        return "label-outline";
      case "Comment":
        return "comments-outline";
      default:
        return "";
    }
  };

  return (
    <View
      className="flex-row space-x-[10px]"
    >
      <ObservationIcon uri={photoUrl} />
      <View className="flex-col w-2/3 justify-between p-1 space-y-[8px]">
        <ObsNotificationText type={type} notifier={user.login} />
        <View className="flex-row space-x-[8px]">
          {
            type
              && (
                <INatIcon
                  name={renderIcon( )}
                  size={14}
                  color={theme.colors.primary}
                />
              )
          }
          {item.created_at
            && (
              <Body4>
                {formatIdDate( item.created_at, t )}
              </Body4>
            )}
        </View>
      </View>
    </View>
  );
};

export default ObsNotification;
