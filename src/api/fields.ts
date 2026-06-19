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

export const PROJECT_FIELDS = {
  description: true,
  header_image_url: true,
  icon: true,
  id: true,
  membership_model: true,
  place_id: true,
  project_observation_fields: PROJECT_OBSERVATION_FIELDS_FIELDS,
  project_type: true,
  rule_preferences: {
    field: true,
    value: true,
  },
  title: true,
  user_ids: true,
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
  project: PROJECT_FIELDS,
  project_id: true,
  uuid: true,
};
