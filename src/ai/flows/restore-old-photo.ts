'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {resolveImageMedia} from '@/ai/media-helper';

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
  error: z.string().optional(),
});
export type RestoreOldPhotoOutput = z.infer<typeof RestoreOldPhotoOutputSchema>;

const restoreOldPhotoFlow = ai.defineFlow(
  {
    name: 'restoreOldPhotoFlow',
    inputSchema: RestoreOldPhotoInputSchema,
    outputSchema: RestoreOldPhotoOutputSchema,
  },
  async (input) => {
    const mediaInput = await resolveImageMedia(input.photoUrl);

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        { media: mediaInput },
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
  try {
    return await restoreOldPhotoFlow(input);
  } catch (err: any) {
    console.error('[restoreOldPhoto Server Action Error]:', err);
    return {
      restoredPhotoDataUri: '',
      error: err?.message || 'Server error during photo restoration.',
    };
  }
}
