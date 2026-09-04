export const taskSchema = {
  version: 1,
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
      type: "string",
    },
    date: {
      type: "string",
      format: "date-time",
    },
  },
  required: ["id", "name"],
}
