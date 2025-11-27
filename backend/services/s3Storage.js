import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline);

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined, // Will use IAM role if not provided
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const USE_S3 = process.env.USE_S3_STORAGE === 'true' && BUCKET_NAME;

/**
 * Upload file to S3
 */
export async function uploadToS3(filePath, key, contentType = 'video/mp4') {
  if (!USE_S3) {
    // Fallback to local storage
    return { location: filePath, key: key };
  }

  try {
    const fileStream = fs.createReadStream(filePath);
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
      // Add metadata
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);
    
    // Return S3 location
    const location = `s3://${BUCKET_NAME}/${key}`;
    return { location, key, bucket: BUCKET_NAME };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
}

/**
 * Download file from S3 to local path
 */
export async function downloadFromS3(s3Key, localPath) {
  if (!USE_S3) {
    // If not using S3, assume it's already a local path
    if (fs.existsSync(s3Key)) {
      return s3Key;
    }
    throw new Error('File not found');
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const response = await s3Client.send(command);
    const writeStream = fs.createWriteStream(localPath);
    
    // Stream the S3 object to local file
    await pipeline(response.Body, writeStream);
    
    return localPath;
  } catch (error) {
    console.error('S3 download error:', error);
    throw new Error(`Failed to download from S3: ${error.message}`);
  }
}

/**
 * Get presigned URL for temporary access
 */
export async function getPresignedUrl(s3Key, expiresIn = 3600) {
  if (!USE_S3) {
    return null;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('S3 presigned URL error:', error);
    return null;
  }
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(s3Key) {
  if (!USE_S3) {
    // If not using S3, delete local file
    try {
      if (fs.existsSync(s3Key)) {
        fs.unlinkSync(s3Key);
      }
      return true;
    } catch (error) {
      console.error('Local file delete error:', error);
      return false;
    }
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    return false;
  }
}

/**
 * Generate S3 key for video file
 */
export function generateVideoKey(userId, filename) {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const extension = filename.split('.').pop();
  return `videos/${userId}/${timestamp}-${random}.${extension}`;
}

/**
 * Check if storage is using S3
 */
export function isUsingS3() {
  return USE_S3;
}

