import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const bucketName = process.env.MINIO_BUCKET || 'documents';

export const initializeStorage = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`Created MinIO bucket: ${bucketName}`);
    }
  } catch (err) {
    console.error('MinIO initialization error:', err);
  }
};

export const uploadFile = async (objectName: string, buffer: Buffer, mimetype: string) => {
  const metaData = {
    'Content-Type': mimetype,
  };
  await minioClient.putObject(bucketName, objectName, buffer, buffer.length, metaData);
};

export const getFileUrl = async (objectName: string) => {
  return minioClient.presignedGetObject(bucketName, objectName, 24 * 60 * 60); // 24 hours
};

export const deleteFile = async (objectName: string) => {
  await minioClient.removeObject(bucketName, objectName);
};
