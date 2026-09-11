import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { image, folder = 'general' } = body;

      if (!image) {
        return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400 });
      }

      const result = await uploadToCloudinary(image, folder);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
      }

      return NextResponse.json({ success: true, url: result.url, public_id: result.public_id });
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const folder = (formData.get('folder') as string) || 'uploads';

      if (!file) {
        return NextResponse.json({ success: false, error: 'No file found in request' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

      const result = await uploadToCloudinary(base64Data, folder);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
      }

      return NextResponse.json({ success: true, url: result.url, public_id: result.public_id });
    }

    return NextResponse.json({ success: false, error: 'Unsupported content type' }, { status: 400 });
  } catch (error: any) {
    console.error('API /upload error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Server error uploading file' }, { status: 500 });
  }
}
