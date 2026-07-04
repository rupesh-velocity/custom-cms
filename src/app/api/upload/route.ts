import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '@/lib/prisma';

// Cloudinary config is automatically picked up from CLOUDINARY_URL env var
// You can also explicitly configure it if needed, but CLOUDINARY_URL is standard.

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // Generate a short random string to prevent overwriting files with the same name
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    // Remove the file extension (e.g., .png or .jpg) to get just the base name
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-");
    const publicId = `${baseName}_${randomSuffix}`;

    // Upload directly to Cloudinary using a stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'custom-cms',
          public_id: publicId
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const result = uploadResult as any;
    
    // Create Media record in the database using the secure Cloudinary URL
    const media = await prisma.media.create({
      data: {
        filename: file.name,
        url: result.secure_url,
        mimeType: file.type || 'application/octet-stream',
        size: buffer.length,
      }
    });
    
    return NextResponse.json(media);
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
