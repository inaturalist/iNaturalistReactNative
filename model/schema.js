
import { appSchema, tableSchema } from "@nozbe/watermelondb";

export default appSchema( {
  version: 2,
  tables: [
    tableSchema( {
      name: "observations",
      columns: [
        { name: "comments", type: "number" },
        { name: "common_name", type: "string", isOptional: true },
        { name: "identifications", type: "number" },
        { name: "location", type: "string", isOptional: true },
        { name: "quality_grade", type: "string" },
        { name: "time_observed_at", type: "string" },
        { name: "uuid", type: "string" },
        { name: "user_photo", type: "string", isOptional: true },
        { name: "geoprivacy", type: "boolean" },
        { name: "positional_accuracy", type: "number" }
      ]
    } )
  ]
} );
