import type { UniversalSearchResultItem }
  from "components/Explore/ExploreV2/hooks/useUniversalSearch";
import type { TFunction } from "i18next";
import type { ExploreV2Subject } from "providers/ExploreV2Context";
import { log } from "sharedHelpers/logger";
import { generateTaxonPieces } from "sharedHelpers/taxon";

const logger = log.extend( "universalSearchSubject" );

// Translation layer between the universal search API results
// (UniversalSearchResultItem) and the ExploreV2 context's subject shape
// (ExploreV2Subject), plus the inverse mapping from a subject to the text shown
// in the search field.

export const resultToSubject = ( result: UniversalSearchResultItem ): ExploreV2Subject => {
  switch ( result.type ) {
    case "user":
      return {
        type: "user",
        user: {
          id: result.user.id as number,
          login: result.user.login as string,
          icon_url: result.user.icon_url,
        },
      };
    case "project":
      return {
        type: "project",
        project: {
          id: result.project.id,
          title: result.project.title,
          icon: result.project.icon,
        },
      };
    case "taxon":
      return {
        type: "taxon",
        taxon: {
          id: result.taxon.id as number,
          name: result.taxon.name as string,
          preferred_common_name: result.taxon.preferred_common_name,
          default_photo: result.taxon.default_photo?.url
            ? { url: result.taxon.default_photo.url }
            : undefined,
          iconic_taxon_name: result.taxon.iconic_taxon_name,
          rank_level: result.taxon.rank_level,
        },
      };
    default:
      throw new Error( `resultToSubject: Unknown explore 
        subject result type: ${( result as { type: string } ).type}` );
  }
};

export const subjectToText = (
  subject: ExploreV2Subject,
  commonNameIsPrimary: boolean,
  t: TFunction,
): string => {
  switch ( subject.type ) {
    case "user":
      return subject.user.login;
    case "project":
      return subject.project.title;
    case "taxon":
      return ( commonNameIsPrimary && subject.taxon.preferred_common_name )
        ? generateTaxonPieces( subject.taxon ).commonName ?? subject.taxon.name
        : subject.taxon.name;
    case "unobserved":
      return t( "Species-I-havent-observed" );
    default:
      logger.error( `subjectToText: Unknown explore 
        subject type: ${( subject as { type: string } ).type}` );
      return "";
  }
};
