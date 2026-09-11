import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'yscz2svu',
  api_key: process.env.CLOUDINARY_API_KEY || '294229168297144',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'BwLBH1RQIvKCx822PcYaXkFaL48',
  secure: true,
});

export default cloudinary;

/**
 * Upload base64 data URI, buffer, or image URL to Cloudinary
 */
export async function uploadToCloudinary(
  fileData: string,
  folder: string = 'arjun_crm'
): Promise<{ success: boolean; url: string; public_id?: string; error?: string }> {
  try {
    const uploadRes = await cloudinary.uploader.upload(fileData, {
      folder: `arjun_crm/${folder}`,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      success: true,
      url: uploadRes.secure_url || uploadRes.url,
      public_id: uploadRes.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      url: '',
      error: error?.message || 'Failed to upload image to Cloudinary',
    };
  }
}
