export const OBS_LIST_NAME = "ObsList";
export const STANDARD_CAMERA_NAME = "StandardCamera";
export const PHOTO_GALLERY_NAME = "PhotoGallery";
export const GROUP_PHOTO_NAME = "GroupPhotos";
export const SOUND_RECORDER_NAME = "SoundRecorder";
export const OBS_EDIT_NAME = "ObsEdit";
export const ADD_ID_NAME = "AddID";
export const OBS_DETAILS_NAME = "ObsDetails";
export const TAXON_DETAILS_NAME = "TaxonDetails";
export const USER_PROFILE_NAME = "UserProfile";
export const MESSAGES_NAME = "Messages";
export const EXPLORE_NAME = "Explore";
export const IDENTIFY_NAME = "Identify";
export const PROJECT_NAME = "Project";
export const PROJECT_DETAILS_NAME = "ProjectDetails";

export const MAIN_STACK = new Set( [
  OBS_LIST_NAME,
  STANDARD_CAMERA_NAME,
  PHOTO_GALLERY_NAME,
  GROUP_PHOTO_NAME,
  SOUND_RECORDER_NAME,
  OBS_EDIT_NAME,
  ADD_ID_NAME,
  OBS_DETAILS_NAME,
  TAXON_DETAILS_NAME,
  USER_PROFILE_NAME,
  MESSAGES_NAME,
  EXPLORE_NAME
] );

export const IDENTIFY_STACK = new Set( [
  IDENTIFY_NAME
] );

export const PROJECTS_STACK = new Set( [
  PROJECT_NAME,
  PROJECT_DETAILS_NAME
] );
