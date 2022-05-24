import { Platform } from "react-native";
import Realm from "realm";

import resizeImageForUpload from "../providers/uploadHelpers/resizeImage";

class Photo extends Realm.Object {
  static PHOTO_FIELDS = {
    id: true,
    attribution: true,
    license_code: true,
    url: true
  };

  static mapApiToRealm( photo ) {
    return photo;
  }

  static setPlatformSpecificFilePath( uri ) {
    return Platform.OS === "android" ? "file://" + uri : uri;
  }

  static async new( uri ) {
    const localFilePath = await resizeImageForUpload( uri );

    return {
      localFilePath
    };
  }

  static displayLocalOrRemotePhoto( p ) {
    return p.photo?.url || p?.photo?.localFilePath;
  }

  static schema = {
    name: "Photo",
    // TODO: need uuid to be primary key for photos that get uploaded?
    properties: {
      id: "int?",
      attribution: "string?",
      license_code: { type: "string?", mapTo: "licenseCode" },
      url: "string?",
      localFilePath: "string?"
    }
  }
}

export default Photo;
