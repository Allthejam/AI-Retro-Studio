'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {resolveImageMedia} from '@/ai/media-helper';

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
  error: z.string().optional(),
});
export type ColorizeBlackAndWhitePhotoOutput = z.infer<typeof ColorizeBlackAndWhitePhotoOutputSchema>;

const colorizeBlackAndWhitePhotoFlow = ai.defineFlow(
  {
    name: 'colorizeBlackAndWhitePhotoFlow',
    inputSchema: ColorizeBlackAndWhitePhotoInputSchema,
    outputSchema: ColorizeBlackAndWhitePhotoOutputSchema,
  },
  async (input) => {
    const mediaInput = await resolveImageMedia(input.photoUrl);

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        {
          media: mediaInput,
        },
        {
          text: 'Colorize this photo with rich, vibrant, full-spectrum color. Transform all black, white, sepia, faded, or grayscale areas into realistic, vivid colors: natural warm skin tones, lifelike hair color, vibrant clothing, bright eyes, and richly colored background environment. Ensure the final result is a striking, full-color photograph with clear depth and vibrant saturation. Output the result as an image.',
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
      const reason = response.text ? `: ${response.text}` : ': No colorized media returned.';
      throw new Error(`Failed to colorize photo${reason}`);
    }

    return {
      colorizedPhotoDataUri: media.url,
    };
  }
);

export async function colorizeBlackAndWhitePhoto(input: ColorizeBlackAndWhitePhotoInput): Promise<ColorizeBlackAndWhitePhotoOutput> {
  try {
    return await colorizeBlackAndWhitePhotoFlow(input);
  } catch (err: any) {
    console.error('[colorizeBlackAndWhitePhoto Server Action Error]:', err);
    return {
      colorizedPhotoDataUri: '',
      error: err?.message || 'Server error during photo colorization.',
    };
  }
}
