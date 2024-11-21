export interface ApiParams {
  per_page?: number;
  page?: number;
  fields?: "all" | Object
}

export interface ApiOpts {
  api_token?: string;
}

export interface ApiResponse {
  total_results: number;
  page: number;
  per_page: number;
  results: Object[];
}

export interface ApiPlace {
  id?: number;
  name?: string;
}

export interface ApiProject {
  id?: number;
  title?: string;
}

export interface ApiTaxon {
  id?: number;
  name?: string;
}

export interface ApiUser {
  id?: number;
  login?: string;
}
