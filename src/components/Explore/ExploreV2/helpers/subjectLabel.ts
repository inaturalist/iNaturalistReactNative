import type { TFunction } from "i18next";
import type { ExploreV2Subject } from "providers/ExploreV2Context";

function subjectLabel( subject: ExploreV2Subject | null, t: TFunction ): string {
  if ( !subject ) { return t( "All-organisms" ); }
  switch ( subject.type ) {
    case "taxon":
      return subject.taxon.name;
    case "user":
      return subject.user.login;
    case "project":
      return subject.project.title;
    case "unobserved":
      return t( "Unobserved" );
    case "unknown":
      return t( "Unknown--taxon" );
    default:
      return t( "All-organisms" );
  }
}

export default subjectLabel;
