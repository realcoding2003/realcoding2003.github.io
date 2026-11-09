import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { postLoader } from './lib/post-loader';
const posts = defineCollection({ loader: postLoader(), schema: z.looseObject({}) });
export const collections = { posts };
