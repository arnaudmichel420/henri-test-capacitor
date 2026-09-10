export const taskSchema = {
  version: 3,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100, // <- the primary key must have maxLength
    },
    name: {
      type: "string",
    },
    date: {
      type: ["string", "null"],
      format: "date-time",
    },
  },
  required: ["id", "name"],
}
