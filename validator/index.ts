import z from 'zod';

export const PasteSchema = z.object({
  content: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(1, { message: 'Content is required' })),
  ttl: z.string(),
  maxViews: z.number().nullable().optional()
});

export const ApiPasteSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  ttl_seconds: z.number().int().gte(1).optional(),
  max_views: z.number().int().gte(1).optional()
});
