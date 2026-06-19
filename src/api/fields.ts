const OBSERVATION_FIELD_FIELDS = {
  id: true,
  name: true,
  datatype: true,
  allowed_values: true,
  description: true,
};

const PROJECT_OBSERVATION_FIELDS = {
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
  project_observation_fields: PROJECT_OBSERVATION_FIELDS,
  project_type: true,
  rule_preferences: {
    field: true,
    value: true,
  },
  title: true,
  user_ids: true,
};

export const PROJECT_FIELDS_ALL = "all";
