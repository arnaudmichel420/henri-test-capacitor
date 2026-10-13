export const uploadSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 36, // format UUID
    },
    taskId: {
      type: 'string',
      maxLength: 36, // FK vers Task — on ne sérialise que l'ID, pas l'objet Task complet
    },
    s3Key: {
      type: 'string',
      maxLength: 512,
    },
    status: {
      type: 'string',
      enum: ['pending', 'uploaded', 'failed', 'deleted'], // les valeurs de ton StatusEnum
      maxLength: 20,
    },
    mimeType: {
      type: 'string',
      maxLength: 255,
    },
    sizeBytes: {
      type: ['string', 'null'],
      maxLength: 20,
    },
    etag: {
      type: ['string', 'null'],
      maxLength: 255,
    },
  },
  required: ['id', 'taskId', 's3Key', 'status', 'mimeType'],
};