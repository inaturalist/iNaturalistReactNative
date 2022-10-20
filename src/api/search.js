// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const mappedRecords = {
  taxa: "taxon",
  places: "place",
  users: "user",
  projects: "project"
};

const PARAMS = {
  per_page: 10,
  fields: "all"
};

const fetchSearchResults = async ( params: Object = {}, opts: Object = {} ): Promise<any> => {
  try {
    const { results } = await inatjs.search( { ...PARAMS, ...params }, opts );
    const records = results.map( result => {
      const recordType = mappedRecords[params.sources];
      return result[recordType];
    } );
    return records;
  } catch ( e ) {
    return handleError( e );
  }
};

export default fetchSearchResults;
