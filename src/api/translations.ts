import handleError, { ErrorWithResponse, INatApiError } from "api/error";
import inatjs from "inaturalistjs";

const fetchAvailableLocales = async (
  params: Record<string, unknown> = {},
  opts: Record<string, unknown> = {}
): Promise<Record<string, unknown> | null | ErrorWithResponse | INatApiError> => {
  try {
    const response = await inatjs.translations.locales( params, opts );
    if ( !response ) { return null; }
    return response?.results;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchAvailableLocales", opts } }
    );
  }
};

export default fetchAvailableLocales;
