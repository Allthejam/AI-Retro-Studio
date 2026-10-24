'use server';
/**
 * @fileOverview An AI agent for colorizing black and white photos.
 *
 * - colorizeBlackAndWhitePhoto - A function that handles the photo colorization process.
 * - ColorizeBlackAndWhitePhotoInput - The input type for the colorizeBlackAndWhitePhoto function.
 * - ColorizeBlackAndWhitePhotoOutput - The return type for the colorizeBlackAndWhitePhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ColorizeBlackAndWhitePhotoInputSchema = z.object({
  photoUrl: z
    .string()
    .describe("The URL of the black and white photo to be colorized."),
});
export type ColorizeBlackAndWhitePhotoInput = z.infer<typeof ColorizeBlackAndWhitePhotoInputSchema>;

const ColorizeBlackAndWhitePhotoOutputSchema = z.object({
  colorizedPhotoDataUri: z
    .string()
    .describe(
      "The colorized version of the photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ColorizeBlackAndWhitePhotoOutput = z.infer<typeof ColorizeBlackAndWhitePhotoOutputSchema>;

export async function colorizeBlackAndWhitePhoto(input: ColorizeBlackAndWhitePhotoInput): Promise<ColorizeBlackAndWhitePhotoOutput> {
  return colorizeBlackAndWhitePhotoFlow(input);
}

const colorizeBlackAndWhitePhotoFlow = ai.defineFlow(
  {
    name: 'colorizeBlackAndWhitePhotoFlow',
    inputSchema: ColorizeBlackAndWhitePhotoInputSchema,
    outputSchema: ColorizeBlackAndWhitePhotoOutputSchema,
  },
  async (input) => {
    const {photoUrl} = input;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        {
          media: {
            url: photoUrl,
          },
        },
        {text: 'Colorize this black and white photo, making the colors realistic and natural.'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Failed to colorize photo: No colorized media returned.');
    }

    return {
      colorizedPhotoDataUri: media.url,
    };
  }
);
