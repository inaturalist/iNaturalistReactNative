import { schemaMigrations, addColumns } from "@nozbe/watermelondb/Schema/migrations";

export default schemaMigrations( {
  migrations: [
    {
      // ⚠️ Set this to a number one larger than the current schema version
      toVersion: 2,
      steps: [
        // See "Migrations API" for more details
        addColumns( {
          table: "observations",
          columns: [
            { name: "geoprivacy", type: "boolean" },
            { name: "positional_accuracy", type: "number" }
          ]
        } )
      ]
    }
  ]
} );
