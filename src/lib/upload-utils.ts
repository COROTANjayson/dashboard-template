export interface UploadTicket {
  url: string;
  method: 'PUT' | 'POST';
  fields?: Record<string, string>;
  headers?: Record<string, string>;
  fileUrl: string;
  fileId: string;
}

import { compressClientImage } from './client-image-utils';

interface UploadOptions {
  compress?: boolean;
  folder?: string;
  onProgress?: (progress: number) => void;
}

/**
 * High-level utility for client-side uploads. 
 * This abstracts away the difference between S3 (PUT) and ImageKit (POST).
 */
export async function uploadToStorage(
  file: File,
  options: UploadOptions = {}
): Promise<{ url: string; fileId: string }> {

  // 1. Optionally compress the file first
  let uploadableFile = file;
  if (options.compress) {
    uploadableFile = await compressClientImage(file);
  }

  // 2. Request an UploadTicket from our backend (modular-monolith-api)
  // We need to pass filename and optionally the folder so backend can create a presigned link
  const ticketRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/storage/ticket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      filename: uploadableFile.name,
      mimeType: uploadableFile.type,
      folder: options.folder 
    }),
  });

  console.log("ticketRes: ", ticketRes)

  if (!ticketRes.ok) {
    const errorData = await ticketRes.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate upload ticket from server');
  }

  const ticket: UploadTicket = await ticketRes.json();

  // 3. Execute the actual file upload using the Ticket details
  let uploadResponse: Response;

  if (ticket.method === 'PUT') {
    // Standard PUT behavior, typically S3 Presigned URL
    uploadResponse = await fetch(ticket.url, {
      method: 'PUT',
      body: uploadableFile,
      headers: ticket.headers || {
        'Content-Type': uploadableFile.type,
      },
    });

  } else if (ticket.method === 'POST') {
    // POST behavior, typically Formidable/Imagekit direct uploads
    const formData = new FormData();
    // Add all fields returned from the ticket (like token, signature, PublicKey, etc)
    if (ticket.fields) {
      Object.entries(ticket.fields).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }
    // Formidable requires the file to be appended last or under a specific name. Imagekit uses 'file'
    formData.append('file', uploadableFile);

    uploadResponse = await fetch(ticket.url, {
      method: 'POST',
      body: formData,
      headers: ticket.headers, // Usually undefined for POST multipart formData
    });
  } else {
    throw new Error(`Unsupported upload ticket method: ${ticket.method}`);
  }

  if (!uploadResponse.ok) {
    throw new Error(`Provider upload failed: ${uploadResponse.statusText}`);
  }

  // Handle Response Parsing (Required because Imagekit defines the final url/fileId AFTER upload unlike S3)
  // If the upload was successful and it returned JSON (like ImageKit), update our result targets
  let finalFileUrl = ticket.fileUrl;
  let finalFileId = ticket.fileId;
  
  const contentType = uploadResponse.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const responseData = await uploadResponse.json();
    if (responseData.url) finalFileUrl = responseData.url;
    if (responseData.fileId) finalFileId = responseData.fileId;
  }

  return {
    url: finalFileUrl,
    fileId: finalFileId,
  };
}
