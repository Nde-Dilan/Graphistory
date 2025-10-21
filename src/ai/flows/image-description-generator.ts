'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating image descriptions.
 *
 * - generateImageDescription - Generates a description for an image based on its ID.
 * - ImageDescriptionInput - The input type for the generateImageDescription function.
 * - ImageDescriptionOutput - The return type for the generateImageDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageDescriptionInputSchema = z.object({
  imageId: z.string().describe('A hint or keywords about the image content.'),
});
export type ImageDescriptionInput = z.infer<typeof ImageDescriptionInputSchema>;

const ImageDescriptionOutputSchema = z.object({
  description: z.string().describe('A brief, evocative, and creative description of the image.'),
});
export type ImageDescriptionOutput = z.infer<typeof ImageDescriptionOutputSchema>;

export async function generateImageDescription(input: ImageDescriptionInput): Promise<ImageDescriptionOutput> {
  return imageDescriptionFlow(input);
}

const imageDescriptionPrompt = ai.definePrompt({
  name: 'imageDescriptionPrompt',
  input: {schema: ImageDescriptionInputSchema},
  output: {schema: ImageDescriptionOutputSchema},
  prompt: `You are an AI assistant that generates brief, evocative, and creative captions for images. Your descriptions should be one or two sentences long.
  
  Generate a caption for an image described by the following hint: {{{imageId}}}.
  
  Example Hint: "city night"
  Example Description: "A vibrant cityscape pulses with light under the cloak of darkness, where stories unfold in every illuminated window."
  `,
});

const imageDescriptionFlow = ai.defineFlow(
  {
    name: 'imageDescriptionFlow',
    inputSchema: ImageDescriptionInputSchema,
    outputSchema: ImageDescriptionOutputSchema,
  },
  async input => {
    try {
      const {output} = await imageDescriptionPrompt(input);
      return output!;
    } catch (error) {
        console.error("Error generating image description:", error);
        return { description: `A captivating image showing ${input.imageId}.` };
    }
  }
);
