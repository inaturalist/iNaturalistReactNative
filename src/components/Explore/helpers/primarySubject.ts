import type {
  ExploreFilters,
  ExploreState,
  ExploreSubject,
} from "providers/ExploreContext";

export type ExplorePrimarySubject =
  | { display: "subject"; subject: ExploreSubject }
  | { display: "unobserved" }
  | { display: "location" };

const asSubject = ( subject: ExploreSubject ): ExplorePrimarySubject => ( {
  display: "subject",
  subject,
} );

const userFromFilters = ( filters: ExploreFilters ): ExploreSubject | null => {
  const { user } = filters;
  if ( !user?.id || !user.login ) { return null; }
  return {
    type: "user",
    user: {
      id: user.id,
      login: user.login,
      icon_url: user.icon_url,
      observations_count: user.observations_count,
    },
  };
};

const projectFromFilters = ( filters: ExploreFilters ): ExploreSubject | null => (
  filters.project?.id
    ? { type: "project", project: filters.project }
    : null
);

function primarySubject( state: ExploreState ): ExplorePrimarySubject {
  const { filters, subject } = state;

  if ( subject?.type === "taxon" || subject?.type === "unknown" ) {
    return asSubject( subject );
  }

  if ( subject?.type === "user" ) { return asSubject( subject ); }
  const filterUser = userFromFilters( filters );
  if ( filterUser ) { return asSubject( filterUser ); }
  if ( subject?.type === "unobserved" || filters.unobservedByUser ) {
    return { display: "unobserved" };
  }

  if ( subject?.type === "project" ) { return asSubject( subject ); }
  const filterProject = projectFromFilters( filters );
  if ( filterProject ) { return asSubject( filterProject ); }

  return { display: "location" };
}

export default primarySubject;
