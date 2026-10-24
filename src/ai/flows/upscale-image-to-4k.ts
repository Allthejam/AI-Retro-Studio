'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { resolveImageMedia } from '@/ai/media-helper';

const UpscaleImageInputSchema = z.object({
  photoUrl: z
    .string()
    .describe("The URL of the photo to be upscaled."),
});
export type UpscaleImageInput = z.infer<typeof UpscaleImageInputSchema>;

const UpscaleImageOutputSchema = z.object({
  upscaledPhotoDataUri: z
    .string()
    .describe(
      "The upscaled high-definition photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  error: z.string().optional(),
});
export type UpscaleImageOutput = z.infer<typeof UpscaleImageOutputSchema>;

const upscaleImageTo4KFlow = ai.defineFlow(
  {
    name: 'upscaleImageTo4KFlow',
    inputSchema: UpscaleImageInputSchema,
    outputSchema: UpscaleImageOutputSchema,
  },
  async (input) => {
    const mediaInput = await resolveImageMedia(input.photoUrl);

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        { media: mediaInput },
        { text: 'Perform dramatic 4K super-resolution enhancement on this image. Significantly enhance micro-details, ultra-sharp facial features, clear skin textures, sharp hair strands, crisp edges, and vivid lighting. Remove any pixelation, blur, compression artifacts, and digital noise. The resulting image must look dramatically sharper, crisper, and enhanced with cinema-grade high fidelity while keeping subject identity. Output the enhanced image as an image.' },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          imageSize: '2K',
        },
      },
    });

    const media = response.media;
    if (!media || !media.url) {
      const reason = response.text ? `: ${response.text}` : ': No image media returned.';
      throw new Error(`Failed to upscale image${reason}`);
    }

    return {
      upscaledPhotoDataUri: media.url,
    };
  }
);

export async function upscaleImageTo4K(
  input: UpscaleImageInput
): Promise<UpscaleImageOutput> {
  try {
    return await upscaleImageTo4KFlow(input);
  } catch (err: any) {
    console.error('[upscaleImageTo4K Server Action Error]:', err);
    return {
      upscaledPhotoDataUri: '',
      error: err?.message || 'Server error during photo upscaling.',
    };
  }
}
