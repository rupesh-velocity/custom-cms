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
    
    // Remove the file extension to get just the base name, and sanitize it
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-");
    const extension = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';
    
    let finalFileName = file.name;
    let publicId = baseName;
    let counter = 1;

    // Check if a file with this name already exists in the database
    while (true) {
      const existingMedia = await prisma.media.findFirst({
        where: { filename: finalFileName }
      });
      
      if (!existingMedia) {
        break; // Name is available!
      }
      
      // If it exists, append a number (e.g., banner-1.jpg)
      finalFileName = `${baseName}-${counter}${extension}`;
      publicId = `${baseName}-${counter}`;
      counter++;
    }

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
        filename: finalFileName,
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
