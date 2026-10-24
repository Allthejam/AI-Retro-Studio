'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { resolveImageMedia } from '@/ai/media-helper';

const DehazeAndClarifyInputSchema = z.object({
  photoUrl: z
    .string()
    .describe('The URL of the photo to be dehazed and clarified.'),
});
export type DehazeAndClarifyInput = z.infer<typeof DehazeAndClarifyInputSchema>;

const DehazeAndClarifyOutputSchema = z.object({
  dehazedPhotoDataUri: z
    .string()
    .describe(
      "The dehazed and clarified photo as a Base64 data URI."
    ),
  error: z.string().optional(),
});
export type DehazeAndClarifyOutput = z.infer<typeof DehazeAndClarifyOutputSchema>;

const dehazeAndClarifyFlow = ai.defineFlow(
  {
    name: 'dehazeAndClarifyFlow',
    inputSchema: DehazeAndClarifyInputSchema,
    outputSchema: DehazeAndClarifyOutputSchema,
  },
  async (input) => {
    const mediaInput = await resolveImageMedia(input.photoUrl);

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        { media: mediaInput },
        {
          text: 'Expertly enhance, dehaze, and clarify this outdoor photo with backlit sunset or sun glare over the people. ' +
            'Your tasks are:\n' +
            '1. Penetrate and remove the sun haze, glare, and washed-out fog covering the people in the foreground and midground.\n' +
            '2. Reveal and dramatically sharpen all the people in the photo: recover their facial features, sharp eyes, natural skin tones, and clothing details from the shadows and backlight.\n' +
            '3. Perfect the exposure balance: preserve the sunset atmosphere while lifting the darker figures so every person is crisp, clear, and easy to see.\n' +
            '4. Eliminate fuzziness, blur, and chromatic lens flare while preserving the real identity and likeness of everyone in the group.\n' +
            'Output the resulting dehazed, ultra-clear photograph as an image.',
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
      const reason = response.text ? `: ${response.text}` : ': No dehazed image returned.';
      throw new Error(`Failed to dehaze photo${reason}`);
    }

    return {
      dehazedPhotoDataUri: media.url,
    };
  }
);

export async function dehazeAndClarifyPhoto(
  input: DehazeAndClarifyInput
): Promise<DehazeAndClarifyOutput> {
  try {
    return await dehazeAndClarifyFlow(input);
  } catch (err: any) {
    console.error('[dehazeAndClarifyPhoto Server Action Error]:', err);
    return {
      dehazedPhotoDataUri: '',
      error: err?.message || 'Server error during photo dehazing.',
    };
  }
}
