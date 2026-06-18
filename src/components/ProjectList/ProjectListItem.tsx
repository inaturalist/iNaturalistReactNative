import type { ProjectRulePreference } from "api/types";
import classnames from "classnames";
import displayProjectType from "components/Projects/helpers/displayProjectType";
import CompositeListItem, { THUMBNAIL_CLASS }
  from "components/SharedComponents/CompositeListItem/CompositeListItem";
import INatIcon from "components/SharedComponents/INatIcon";
import Body1 from "components/SharedComponents/Typography/Body1";
import List2 from "components/SharedComponents/Typography/List2";
import { FasterImageView, View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import formatProjectDate from "../Projects/helpers/displayDates";

const defaultProjectIcon = "https://www.inaturalist.org/attachment_defaults/general/span2.png";

const ICON_CLASS = `${THUMBNAIL_CLASS} bg-white mr-3`;

interface Project {
  icon?: string;
  id: number;
  project_type: "collection" | "umbrella" | "";
  rule_preferences?: ProjectRulePreference[];
  title: string;
}

interface Props extends PropsWithChildren {
  item?: Project | null;
  isHeader?: boolean;
  className?: string;
}

interface ProjectListItemContextValue {
  item: Project;
  isHeader: boolean;
}

const ProjectListItemContext = React.createContext<ProjectListItemContextValue | undefined>(
  undefined,
);

function useProjectListItem( ): ProjectListItemContextValue {
  const context = React.useContext( ProjectListItemContext );
  if ( context === undefined ) {
    throw new Error( "ProjectListItem subcomponents must be used within a ProjectListItem" );
  }
  return context;
}

// Thumbnail: the project icon, or a briefcase placeholder for the default icon.
const ProjectListItemIcon = ( ) => {
  const { item } = useProjectListItem( );
  const productionIcon = item.icon?.replace( "staticdev", "static" );

  if ( !productionIcon || productionIcon === defaultProjectIcon ) {
    return (
      <View
        className={classnames( ICON_CLASS, "border-[2px]", "justify-center", "items-center" )}
      >
        <INatIcon
          name="briefcase"
          size={26}
          color={colors.darkGray}
        />
      </View>
    );
  }

  return (
    <FasterImageView
      className={ICON_CLASS}
      source={{
        url: productionIcon,
        cachePolicy: "discWithCacheControl",
        resizeMode: "cover",
      }}
      testID={`Project.${item.id}.photo`}
      accessibilityIgnoresInvertColors
    />
  );
};

// First line: the project title.
const ProjectListItemTitle = ( ) => {
  const { item } = useProjectListItem( );
  return <Body1>{ item.title }</Body1>;
};

// Second line: a date range when available, otherwise the project type.
const ProjectListItemMeta = ( ) => {
  const { item, isHeader } = useProjectListItem( );
  const { t, i18n } = useTranslation( );
  const { projectDate, shouldDisplayDateRange } = formatProjectDate( item, t, i18n );
  const displayDateRange = shouldDisplayDateRange && !isHeader;

  return (
    <List2 className="mt-2">
      { displayDateRange
        ? projectDate
        : displayProjectType( item.project_type, t ) }
    </List2>
  );
};

const ProjectListItem = ( {
  item, isHeader = false, className, children,
}: Props ) => {
  const contextValue = React.useMemo(
    ( ) => ( item
      ? { item, isHeader }
      : undefined ),
    [item, isHeader],
  );

  if ( !contextValue ) { return null; }

  return (
    <ProjectListItemContext.Provider value={contextValue}>
      <CompositeListItem pressable={false} className={className || "shrink py-1"}>
        { children || (
          <>
            <ProjectListItem.Icon />
            <ProjectListItem.TextSection>
              <ProjectListItem.Title />
              <ProjectListItem.Meta />
            </ProjectListItem.TextSection>
          </>
        ) }
      </CompositeListItem>
    </ProjectListItemContext.Provider>
  );
};

ProjectListItem.Icon = ProjectListItemIcon;
ProjectListItem.Title = ProjectListItemTitle;
ProjectListItem.Meta = ProjectListItemMeta;
ProjectListItem.TextSection = CompositeListItem.TextSection;

export default ProjectListItem;
