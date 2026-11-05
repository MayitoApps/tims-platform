import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se recibió ningún archivo' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `facturas/${timestamp}-${sanitizedName}`;

    // 1. Si Vercel Blob está configurado (Producción o con BLOB_READ_WRITE_TOKEN)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(filename, file, {
          access: 'public'
        });
        return NextResponse.json({
          success: true,
          url: blob.url,
          filename: file.name,
          contentType: file.type,
          size: file.size,
          source: 'vercel_blob'
        });
      } catch (blobError) {
        console.warn('Vercel Blob falló o token no válido, alternando a almacenamiento local:', blobError);
      }
    }

    // 2. Almacenamiento local en /public/uploads/ (Entorno local o sin token de Vercel)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const localFilename = `${timestamp}-${sanitizedName}`;
    const filePath = path.join(uploadsDir, localFilename);
    await fs.writeFile(filePath, buffer);

    const localUrl = `/uploads/${localFilename}`;

    return NextResponse.json({
      success: true,
      url: localUrl,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      source: 'local_disk'
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

