'use server';
/**
 * @fileOverview An AI agent for restoring old photos by repairing cracks, scratches, and fading.
 *
 * - restoreOldPhoto - A function that handles the photo restoration process.
 * - RestoreOldPhotoInput - The input type for the restoreOldPhoto function.
 * - RestoreOldPhotoOutput - The return type for the restoreOldPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RestoreOldPhotoInputSchema = z.object({
  photoUrl: z
    .string()
    .describe("The URL of the damaged photo to be restored."),
});
export type RestoreOldPhotoInput = z.infer<typeof RestoreOldPhotoInputSchema>;

const RestoreOldPhotoOutputSchema = z.object({
  restoredPhotoDataUri: z
    .string()
    .describe(
      "The restored photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RestoreOldPhotoOutput = z.infer<typeof RestoreOldPhotoOutputSchema>;

const restoreOldPhotoFlow = ai.defineFlow(
  {
    name: 'restoreOldPhotoFlow',
    inputSchema: RestoreOldPhotoInputSchema,
    outputSchema: RestoreOldPhotoOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        { media: { url: input.photoUrl } },
        {
          text: 'Carefully analyze this old, damaged photo. Your task is to intelligently repair it by removing all cracks, scratches, and fading. Restore the image to its original, high-quality state without adding new elements or changing the original content. Maintain the original colors and composition as much as possible.',
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Failed to restore photo: no image media returned.');
    }

    return {
      restoredPhotoDataUri: media.url,
    };
  }
);

export async function restoreOldPhoto(input: RestoreOldPhotoInput): Promise<RestoreOldPhotoOutput> {
  return restoreOldPhotoFlow(input);
}
