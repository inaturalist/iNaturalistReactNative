import { Realm } from "@realm/react";

import type OfflineObservation from "./OfflineObservation";

class OfflineRegion extends Realm.Object {
  id!: string;

  name!: string;

  savedAt!: Date;

  /** Human-readable label for the search filter used when saving (e.g. taxon name) */
  queryLabel?: string;

  /** Local file path of a representative taxon/observation photo for the list thumbnail */
  taxonImagePath?: string;

  /** File URI of the Apple Maps standard snapshot image */
  snapshotPath?: string;

  /** File URI of the Apple Maps satellite snapshot image */
  satelliteSnapshotPath?: string;

  /** Pixel dimensions of the snapshot (used for pin position math) */
  snapshotWidth?: number;

  snapshotHeight?: number;

  centerLatitude!: number;

  centerLongitude!: number;

  latitudeDelta!: number;

  longitudeDelta!: number;

  observations!: Realm.List<OfflineObservation>;

  static schema: Realm.ObjectSchema = {
    name: "OfflineRegion",
    primaryKey: "id",
    properties: {
      id: "string",
      name: "string",
      savedAt: "date",
      queryLabel: "string?",
      taxonImagePath: "string?",
      snapshotPath: "string?",
      satelliteSnapshotPath: "string?",
      snapshotWidth: "double?",
      snapshotHeight: "double?",
      centerLatitude: "double",
      centerLongitude: "double",
      latitudeDelta: "double",
      longitudeDelta: "double",
      observations: "OfflineObservation[]",
    },
  };
}

export default OfflineRegion;
