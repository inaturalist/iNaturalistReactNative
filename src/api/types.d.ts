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
  preferred_common_name?: string;
}

export interface ApiUser {
  id?: number;
  login?: string;
}

export interface ApiComment {
  body?: string;
  user?: ApiUser;
}

export interface ApiIdentification {
  body?: string;
  taxon?: ApiTaxon;
  user?: ApiUser;
}

export export interface ApiNotification {
  comment?: ApiComment;
  comment_id?: number;
  created_at: string;
  id: number;
  identification?: ApiIdentification;
  identification_id?: number;
  notifier_type: string;
  resource_uuid: string;
  viewed?: boolean;
}
