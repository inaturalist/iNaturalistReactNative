const OBSERVATION_FIELD_FIELDS = {
  allowed_values: true,
  datatype: true,
  description: true,
  id: true,
  name: true,
};

const PROJECT_OBSERVATION_FIELDS_FIELDS = {
  id: true,
  observation_field: OBSERVATION_FIELD_FIELDS,
  position: true,
  required: true,
};

export const PROJECT_SUMMARY_FIELDS = {
  icon: true,
  id: true,
  project_type: true,
  rule_preferences: {
    field: true,
    value: true,
  },
  title: true,
};

export const PROJECT_DETAIL_FIELDS = {
  ...PROJECT_SUMMARY_FIELDS,
  description: true,
  header_image_url: true,
  membership_model: true,
  place_id: true,
  user_ids: true,
};

export const PROJECT_SUMMARY_POF_FIELDS = {
  ...PROJECT_SUMMARY_FIELDS,
  project_observation_fields: PROJECT_OBSERVATION_FIELDS_FIELDS,
};

export const PROJECT_FIELDS_ALL = "all";

export const OBSERVATION_FIELD_VALUE_FIELDS = {
  id: true,
  observation_field: OBSERVATION_FIELD_FIELDS,
  uuid: true,
  value: true,
};

export const PROJECT_OBSERVATION_FIELDS = {
  id: true,
  project: PROJECT_SUMMARY_FIELDS,
  project_id: true,
  uuid: true,
};
