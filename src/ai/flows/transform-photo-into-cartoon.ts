'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {resolveImageMedia} from '@/ai/media-helper';

const TransformPhotoIntoCartoonInputSchema = z.object({
  photoUrl: z
    .string()
    .describe("The URL of the photo to be cartoonized."),
});
export type TransformPhotoIntoCartoonInput = z.infer<
  typeof TransformPhotoIntoCartoonInputSchema
>;

const TransformPhotoIntoCartoonOutputSchema = z.object({
  cartoonPhotoDataUri: z
    .string()
    .describe(
      "The cartoonized version of the photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  error: z.string().optional(),
});
export type TransformPhotoIntoCartoonOutput = z.infer<
  typeof TransformPhotoIntoCartoonOutputSchema
>;

const transformPhotoIntoCartoonFlow = ai.defineFlow(
  {
    name: 'transformPhotoIntoCartoonFlow',
    inputSchema: TransformPhotoIntoCartoonInputSchema,
    outputSchema: TransformPhotoIntoCartoonOutputSchema,
  },
  async (input) => {
    const mediaInput = await resolveImageMedia(input.photoUrl);

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        { media: mediaInput },
        { text: 'Transform this photo into a stylized illustration or a cartoon-like image. Output the result as an image.' },
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
      const reason = response.text ? `: ${response.text}` : ': No media URL returned.';
      throw new Error(`Failed to generate cartoonized image${reason}`);
    }

    return {
      cartoonPhotoDataUri: media.url,
    };
  }
);

export async function transformPhotoIntoCartoon(
  input: TransformPhotoIntoCartoonInput
): Promise<TransformPhotoIntoCartoonOutput> {
  try {
    return await transformPhotoIntoCartoonFlow(input);
  } catch (err: any) {
    console.error('[transformPhotoIntoCartoon Server Action Error]:', err);
    return {
      cartoonPhotoDataUri: '',
      error: err?.message || 'Server error during cartoon transformation.',
    };
  }
}
