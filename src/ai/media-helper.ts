/**
 * Helper to ensure media URLs passed to Gemini are properly formatted
 * as inline base64 data URIs. Gemini API requires inlineData for external images.
 */
export async function resolveImageMedia(photoUrl: string): Promise<{ url: string; contentType: string }> {
  if (!photoUrl) {
    throw new Error('No photo URL was provided.');
  }

  // If already a base64 data URI
  if (photoUrl.startsWith('data:')) {
    const mimeMatch = photoUrl.match(/^data:([^;]+);base64,/);
    const contentType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    return { url: photoUrl, contentType };
  }

  // If an external HTTP/HTTPS URL (e.g., Firebase Cloud Storage)
  try {
    const res = await fetch(photoUrl, {
      headers: {
        Accept: 'image/*',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to load source image (${res.status} ${res.statusText})`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:${contentType};base64,${base64}`;

    return { url: dataUri, contentType };
  } catch (err: any) {
    console.error('[resolveImageMedia] Error fetching image:', err);
    throw new Error(`Failed to retrieve image from cloud storage: ${err?.message || err}`);
  }
}
