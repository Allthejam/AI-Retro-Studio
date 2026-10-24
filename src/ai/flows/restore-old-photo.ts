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
    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        { media: { url: input.photoUrl } },
        {
          text: 'Perform dramatic professional photo restoration and remastering on this photo. Deeply clean any noise, blur, dust, scratches, folds, cracks, and imperfections. Sharpen facial details, hair strands, eyes, and surface textures. Enhance dynamic range, contrast, and color vibrance so the photo looks vividly remastered with ultra-clear studio-grade quality while faithfully preserving the subject identity and likeness. Output the restored photo as an image.',
        },
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
      const reason = response.text ? `: ${response.text}` : ': no image media returned.';
      throw new Error(`Failed to restore photo${reason}`);
    }

    return {
      restoredPhotoDataUri: media.url,
    };
  }
);

export async function restoreOldPhoto(input: RestoreOldPhotoInput): Promise<RestoreOldPhotoOutput> {
  return restoreOldPhotoFlow(input);
}
