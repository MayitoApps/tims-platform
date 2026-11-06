import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import path from 'path';
import fs from 'fs/promises';
import { getSession } from '@/lib/auth';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export async function POST(request: Request) {
  try {
    // 1. Verificación de Autenticación en Servidor
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado. Se requiere iniciar sesión.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se recibió ningún archivo' },
        { status: 400 }
      );
    }

    // 2. Validación de Tamaño
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'El archivo excede el tamaño máximo permitido de 25MB.' },
        { status: 400 }
      );
    }

    // 3. Validación de Tipo MIME y Extensión
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext) || (file.type && !ALLOWED_MIME_TYPES.has(file.type))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tipo de archivo no permitido. Solo se aceptan imágenes (PNG, JPG, WEBP) o documentos PDF.'
        },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const sanitizedName = path.basename(file.name).replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `facturas/${timestamp}-${sanitizedName}`;

    // 4. Si Vercel Blob está configurado (Producción o con BLOB_READ_WRITE_TOKEN)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(filename, file, {
          access: 'public'
        });
        return NextResponse.json({
          success: true,
          url: blob.url,
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          size: file.size,
          source: 'vercel_blob'
        });
      } catch (blobError) {
        console.warn('Vercel Blob falló o token no válido, alternando a almacenamiento local:', blobError);
      }
    }

    // 5. Almacenamiento local en /public/uploads/ (Entorno local de desarrollo)
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
      contentType: file.type || 'application/octet-stream',
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
