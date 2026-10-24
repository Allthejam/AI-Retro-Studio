'use client';
import { ref, uploadBytes, uploadString, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a base64 data URI to Firebase Storage.
 * This stores the actual transformed image in Cloud Storage rather than
 * bloating the Firestore document with megabytes of base64 data.
 *
 * @param storage - The initialized FirebaseStorage instance.
 * @param userId - The ID of the authenticated user.
 * @param dataUri - The base64 data URI (e.g. data:image/png;base64,...).
 * @param prefix - Name prefix for identification.
 * @returns A promise resolving to the public/download URL.
 */
export async function uploadDataUri(
  storage: FirebaseStorage,
  userId: string,
  dataUri: string,
  prefix: string = 'transformed'
): Promise<string> {
  const fileId = uuidv4();
  // Extract format from mime type if present
  let ext = 'png';
  if (dataUri.startsWith('data:image/')) {
    const mimeMatch = dataUri.match(/^data:image\/([a-zA-Z0-9+]+);/);
    if (mimeMatch && mimeMatch[1]) {
      ext = mimeMatch[1] === 'jpeg' ? 'jpg' : mimeMatch[1];
    }
  }

  const filePath = `images/${userId}/${prefix}_${fileId}.${ext}`;
  const storageRef = ref(storage, filePath);

  console.log(`Starting upload of transformed image to: ${filePath}`);

  try {
    const uploadResult = await uploadString(storageRef, dataUri, 'data_url');
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    console.log('Transformed image uploaded successfully. URL:', downloadUrl);
    return downloadUrl;
  } catch (error: any) {
    console.error('Firebase Storage uploadDataUri Error:', error);
    if (error.code === 'storage/unauthorized') {
      throw new Error('Cloud storage permission denied. Please ensure you are signed in.');
    }
    throw new Error(error.message || 'The transformed image could not be saved to Cloud Storage.');
  }
}

/**
 * Uploads a file to Firebase Storage using the standard upload pattern.
 * This is more reliable for common image sizes in various network environments.
 * 
 * @param storage - The initialized FirebaseStorage instance.
 * @param userId - The ID of the user performing the upload.
 * @param file - The file object to upload.
 * @returns A promise that resolves to the download URL of the uploaded image.
 */
export async function uploadImage(
  storage: FirebaseStorage,
  userId: string,
  file: File
): Promise<string> {
  const fileId = uuidv4();
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const filePath = `images/${userId}/${fileId}.${fileExtension}`;
  const storageRef = ref(storage, filePath);

  console.log(`Starting upload to: ${filePath}`);

  try {
    // Standard upload is often more stable than resumable for files under 20MB
    const uploadResult = await uploadBytes(storageRef, file);
    console.log('Upload bytes successful, getting download URL...');
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    
    if (!downloadUrl) {
      throw new Error('Upload succeeded but no download URL was returned.');
    }
    
    console.log('Cloud sync complete. URL:', downloadUrl);
    return downloadUrl;
  } catch (error: any) {
    console.error('Firebase Storage Upload Error:', error);
    // Explicitly check for permission errors or common network issues
    if (error.code === 'storage/unauthorized') {
      throw new Error('Cloud storage permission denied. Please ensure you are signed in.');
    }
    throw new Error(error.message || 'The image could not be saved to the cloud.');
  }
}
