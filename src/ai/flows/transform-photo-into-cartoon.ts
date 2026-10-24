'use server';
/**
 * @fileOverview A Genkit flow that transforms an uploaded photo into a stylized illustration or cartoon-like image.
 *
 * - transformPhotoIntoCartoon - A function that handles the photo cartoonization process.
 * - TransformPhotoIntoCartoonInput - The input type for the transformPhotoIntoCartoon function.
 * - TransformPhotoIntoCartoonOutput - The return type for the transformPhotoIntoCartoon function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
});
export type TransformPhotoIntoCartoonOutput = z.infer<
  typeof TransformPhotoIntoCartoonOutputSchema
>;

export async function transformPhotoIntoCartoon(
  input: TransformPhotoIntoCartoonInput
): Promise<TransformPhotoIntoCartoonOutput> {
  return transformPhotoIntoCartoonFlow(input);
}

const transformPhotoIntoCartoonFlow = ai.defineFlow(
  {
    name: 'transformPhotoIntoCartoonFlow',
    inputSchema: TransformPhotoIntoCartoonInputSchema,
    outputSchema: TransformPhotoIntoCartoonOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        { media: { url: input.photoUrl } },
        { text: 'Transform this photo into a stylized illustration or a cartoon-like image. Output the result as an image.' },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
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
