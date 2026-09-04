import { THUMBNAIL_CLASS } from "appConstants/classNames";
import IconicTaxonIcon from "components/SharedComponents/IconicTaxonIcon";
import INatIcon from "components/SharedComponents/INatIcon";
import UserIcon from "components/SharedComponents/UserIcon";
import { Image, View } from "components/styledComponents";
import type { ExploreV2Subject } from "providers/ExploreV2Context";
import React from "react";
import colors from "styles/tailwindColors";

interface Props {
  subject: ExploreV2Subject | null;
}

const SubjectThumbnail = ( { subject }: Props ) => {
  switch ( subject?.type ) {
    case "taxon": {
      const photo = subject.taxon.default_photo?.url;
      return photo
        ? (
          <Image
            source={{ uri: photo }}
            className={THUMBNAIL_CLASS}
            accessibilityIgnoresInvertColors
            testID="ExploreV2Header.taxonImage"
          />
        )
        : (
          <IconicTaxonIcon
            imageClassName={[THUMBNAIL_CLASS]}
            iconicTaxonName={subject.taxon.iconic_taxon_name}
          />
        );
    }
    case "user":
      return <UserIcon size={62} uri={subject.user.icon_url} />;
    case "project":
      return subject.project.icon
        ? (
          <Image
            source={{ uri: subject.project.icon }}
            className={THUMBNAIL_CLASS}
            accessibilityIgnoresInvertColors
            testID="ExploreV2Header.projectImage"
          />
        )
        : (
          <View
            className={`${THUMBNAIL_CLASS} bg-lightGray items-center justify-center`}
            testID="ExploreV2Header.projectFallbackIcon"
          >
            <INatIcon name="briefcase" size={28} color={colors.darkGray} />
          </View>
        );
    case "unknown":
    case "unobserved":
    default:
      return (
        <IconicTaxonIcon
          imageClassName={[THUMBNAIL_CLASS]}
          iconicTaxonName="unknown"
        />
      );
  }
};

export default SubjectThumbnail;
