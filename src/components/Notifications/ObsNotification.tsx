import ObservationIcon from "components/Notifications/ObservationIcon";
import ObsNotificationText from "components/Notifications/ObsNotificationText";
import {
  Body4,
  INatIcon
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts.ts";
import React from "react";
import type { RealmObservation } from "realmModels/types";
import { formatDifferenceForHumans } from "sharedHelpers/dateAndTime.ts";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

const { useRealm } = RealmContext;

// TODO improve / replace these types when api/types.d.ts available
interface ApiUser {
  id: number;
  login: string;
}
interface ApiComment {
  user: ApiUser
}

interface ApiIdentification {
  user: ApiUser
}

interface Props {
  item: {
    comment: ApiComment;
    identification: ApiIdentification;
    notifier_type: string;
    resource_uuid: string;
    created_at: string;
  }
}

const ObsNotification = ( { item }: Props ) => {
  const { i18n } = useTranslation( );
  const { identification, comment } = item;
  const type = item.notifier_type;
  const { user } = identification || comment;
  const realm = useRealm( );

  const observation: RealmObservation | null = realm.objectForPrimaryKey(
    "Observation",
    item.resource_uuid
  );
  const photoUrl = observation?.observationPhotos[0]?.photo?.url;
  const soundsUrl = observation?.observationSounds[0]?.sound?.file_url;

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
      className="shrink flex-row space-x-[10px]"
    >
      <ObservationIcon photoUri={photoUrl} soundUri={soundsUrl} />
      <View className="flex-col shrink justify-center space-y-[8px]">
        <ObsNotificationText type={type} userName={user.login} />
        <View className="flex-row space-x-[8px]">
          {
            type
              && (
                <INatIcon
                  name={renderIcon( )}
                  size={14}
                  color={String( colors?.darkGray )}
                />
              )
          }
          {item.created_at
            && (
              <Body4>
                {formatDifferenceForHumans( item.created_at, i18n )}
              </Body4>
            )}
        </View>
      </View>
    </View>
  );
};

export default ObsNotification;
