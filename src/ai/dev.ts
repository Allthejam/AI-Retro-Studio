import { config } from 'dotenv';
config();

import '@/ai/flows/transform-photo-into-cartoon.ts';
import '@/ai/flows/colorize-black-and-white-photo.ts';
import '@/ai/flows/upscale-image-to-4k.ts';
import '@/ai/flows/restore-old-photo.ts';