export const taskSchema = {
  version: 2,
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
    image: {
      type: ["string", "null"],
    },
    date: {
      type: ["string", "null"],
      format: "date-time",
    },
  },
  required: ["id", "name"],
}
