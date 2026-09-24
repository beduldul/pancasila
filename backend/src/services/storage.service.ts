import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { config } from '../config';

// Flag to check if Cloudinary is fully configured in current environment
const isCloudinaryConfigured = !!(
  config.CLOUDINARY_CLOUD_NAME &&
  config.CLOUDINARY_API_KEY &&
  config.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
  });
  console.log('Cloud Storage: Cloudinary configured and initialized.');
} else {
  console.log('Cloud Storage: credentials missing, falling back to local/ephemeral disk storage.');
}

export class StorageService {
  /**
   * Generates a secure upload signature for direct client-side uploads.
   * 
   * @param folder Target folder in Cloudinary
   */
  static getUploadSignature(folder: string = 'pancasila-edu') {
    if (!isCloudinaryConfigured) {
      throw new Error('Cloud Storage: Credentials missing or Cloudinary not configured');
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = {
      timestamp,
      folder,
    };

    // Calculate secure SHA-1 signature
    const signature = cloudinary.utils.api_sign_request(paramsToSign, config.CLOUDINARY_API_SECRET!);

    return {
      signature,
      timestamp,
      cloudName: config.CLOUDINARY_CLOUD_NAME!,
      apiKey: config.CLOUDINARY_API_KEY!,
      folder,
    };
  }

  /**
   * Uploads a file either to Cloudinary or falls back to local storage depending on configuration.
   * Automatically handles temp file deletion upon successful Cloudinary upload.
   * 
   * @param file The file object provided by Multer
   * @param folder Target folder in Cloudinary
   */
  static async uploadFile(file: Express.Multer.File, folder: string = 'pancasila-edu'): Promise<string> {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    // Path where Multer saved the file temporarily
    const tempFilePath = file.path;

    if (isCloudinaryConfigured) {
      try {
        console.log(`Cloud Storage: uploading ${file.originalname} (${file.size} bytes) to Cloudinary...`);
        
        const result = await cloudinary.uploader.upload(tempFilePath, {
          folder,
          resource_type: 'auto', // Detects images, videos, PDFs, and documents automatically
          public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`.split('.')[0]
        });

        // Clean up ephemeral local temp file to avoid Vercel /tmp congestion
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          console.log(`Cloud Storage: cleaned up local temp file: ${tempFilePath}`);
        }

        console.log(`Cloud Storage: upload successful, permanent URL: ${result.secure_url}`);
        return result.secure_url;
      } catch (error: any) {
        console.error('Cloud Storage error during upload:', error);
        // Fallback to local url if upload fails, to avoid breaking user experience
        console.warn('Cloud Storage: falling back to local static URL due to upload error.');
        return `/uploads/${file.filename}`;
      }
    }

    // Fallback: Return relative local path if Cloudinary is not configured
    return `/uploads/${file.filename}`;
  }
}
