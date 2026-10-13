export const taskSchema = {
  version: 4,
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
    scheduledAt: {
      type: ["string", "null"],
      format: "date-time",
    },
    done: {
      type: "boolean",
      default: false,
    },
    doneAt: {
      type: ["string", "null"],
      format: "date-time",
    },
  },
  required: ["id", "name"],
}
