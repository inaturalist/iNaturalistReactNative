import type { StateCreator } from "zustand";

const DEFAULT_STATE = {
  dismissedAnnouncementIds: [],
};

export interface LoggedOutAnnouncementsSlice {
  dismissedAnnouncementIds: string[];
  dismissLoggedOutAnnouncement: ( announcementId: string ) => void;
  clearLoggedOutAnnouncements: () => void;
}

// eslint-disable-next-line arrow-body-style
const createLoggedOutAnnouncementsSlice: StateCreator<LoggedOutAnnouncementsSlice> = set => {
  return {
    ...DEFAULT_STATE,
    dismissLoggedOutAnnouncement: announcementId => set( state => ( {
      dismissedAnnouncementIds:
        state.dismissedAnnouncementIds.includes( announcementId )
          ? state.dismissedAnnouncementIds
          : [...state.dismissedAnnouncementIds, announcementId],
    } ) ),
    clearLoggedOutAnnouncements: () => set( () => ( { dismissedAnnouncementIds: [] } ) ),
  };
};

export default createLoggedOutAnnouncementsSlice;
