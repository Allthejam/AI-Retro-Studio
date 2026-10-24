'use server';
/**
 * @fileOverview A Genkit flow for upscaling an image to 4K quality.
 *
 * - upscaleImageTo4K - A function that handles the image upscaling process.
 * - UpscaleImageInput - The input type for the upscaleImageTo4K function.
 * - UpscaleImageOutput - The return type for the upscaleImageTo4K function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

// Define the input schema
const UpscaleImageInputSchema = z.object({
  photoUrl: z
    .string()
    .describe("The URL of the photo to be upscaled."),
});
export type UpscaleImageInput = z.infer<typeof UpscaleImageInputSchema>;

// Define the output schema
const UpscaleImageOutputSchema = z.object({
  upscaledPhotoDataUri: z
    .string()
    .describe(
      "The upscaled high-definition photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type UpscaleImageOutput = z.infer<typeof UpscaleImageOutputSchema>;

// Define the Genkit flow
const upscaleImageTo4KFlow = ai.defineFlow(
  {
    name: 'upscaleImageTo4KFlow',
    inputSchema: UpscaleImageInputSchema,
    outputSchema: UpscaleImageOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        { media: { url: input.photoUrl } },
        { text: 'Upscale this image, enhancing its resolution, sharpness, and details to achieve a high-definition output, similar to 4K quality, without introducing distortion or artifacts. Preserve the original content and style. Output the upscaled result as an image.' },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
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

// Export the wrapper function
export async function upscaleImageTo4K(
  input: UpscaleImageInput
): Promise<UpscaleImageOutput> {
  return upscaleImageTo4KFlow(input);
}
