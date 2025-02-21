import inatjs from "inaturalistjs";
import Taxon from "realmModels/Taxon";

import handleError from "./error";

const PARAMS = {
  include_representative_photos: true,
  test_feature: "ancestor_unrestricted",
  fields: {
    combined_score: true,
    vision_score: true,
    taxon: Taxon.LIMITED_TAXON_FIELDS
  }
};

const scoreImage = async (
  params = {},
  opts = {}
): Promise<Object> => {
  try {
    // const fakeData = {
    //   results: [
    //     {
    //       combined_score: 90,
    //       vision_score: 87,
    //       taxon: {
    //         id: 12345,
    //         ancestor_ids: [12344],
    //         default_photo: {
    //           id: 12,
    //           url: "https://www.inaturalist.org/photos/12345/medium.jpg"
    //         },
    //         representative_photo: {
    //           id: 12,
    //           url: "https://www.inaturalist.org/photos/12345/medium.jpg"
    //         },
    //         iconic_taxon_name: "Fake Iconic Taxon",
    //         name: "Fake Taxon Name",
    //         preferred_common_name: "Fake Common Name",
    //         rank: "species",
    //         rank_level: 10,
    //         taxon_photos: [
    //           {
    //             url: "https://www.inaturalist.org/photos/12345/medium.jpg"
    //           }
    //         ]
    //       }
    //     }
    //   ],
    //   commonAncestor: {
    //     combined_score: 92,
    //     vision_score: 88,
    //     taxon: {
    //       id: 12344,
    //       ancestor_ids: [12343],
    //       default_photo: {
    //         id: 12,
    //         url: "https://www.inaturalist.org/photos/12344/medium.jpg"
    //       },
    //       representative_photo: {
    //         id: 12,
    //         url: "https://www.inaturalist.org/photos/12344/medium.jpg"
    //       },
    //       iconic_taxon_name: "Fake Iconic Taxon",
    //       name: "Fake Ancestor Name",
    //       preferred_common_name: "Fake Ancestor Common Name",
    //       rank: "genus",
    //       rank_level: 20,
    //       taxon_photos: [
    //         {
    //           url: "https://www.inaturalist.org/photos/12344/medium.jpg"
    //         }
    //       ]
    //     }
    //   }
    // };
    return inatjs.computervision.score_image( { ...PARAMS, ...params }, opts );
  } catch ( e ) {
    return handleError( e as Error );
  }
};

export default scoreImage;
