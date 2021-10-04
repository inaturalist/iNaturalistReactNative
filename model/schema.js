
import { appSchema, tableSchema } from "@nozbe/watermelondb";

export default appSchema( {
  version: 1,
  tables: [
    tableSchema( {
      name: "observations",
      columns: [
        { name: "uuid", type: "string" },
        { name: "user_photo", type: "string", isOptional: true },
        { name: "common_name", type: "string", isOptional: true },
        { name: "location", type: "string", isOptional: true },
        { name: "time_observed_at", type: "string" },
        { name: "identifications", type: "number" },
        { name: "comments", type: "number" },
        { name: "quality_grade", type: "string" }
      ]
    } )
  ]
} );
