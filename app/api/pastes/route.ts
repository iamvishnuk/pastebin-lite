import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';
import { getRedisClient } from '@/lib/redis';
import { nanoid } from 'nanoid';

const CreatePasteSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  ttl_seconds: z.number().int().gte(1).optional(),
  max_views: z.number().int().gte(1).optional()
});

type CreatePasteRequest = z.infer<typeof CreatePasteSchema>;

interface PasteData {
  content: string;
  ttl_seconds?: number;
  max_views?: number;
  created_at: number;
  view_count: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    // Validate request body
    const parseResult = CreatePasteSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: parseResult.error.flatten()
        },
        { status: 400 }
      );
    }

    const data: CreatePasteRequest = parseResult.data;
    const redis = getRedisClient();

    // Generate unique ID
    const pasteId = nanoid(10);
    const pasteKey = `paste:${pasteId}`;

    // Create paste data
    const pasteData: PasteData = {
      content: data.content,
      created_at: Date.now(),
      view_count: 0
    };

    if (data.ttl_seconds) {
      pasteData.ttl_seconds = data.ttl_seconds;
    }

    if (data.max_views) {
      pasteData.max_views = data.max_views;
    }

    // Store in Redis with TTL if specified
    if (data.ttl_seconds) {
      await redis.setex(pasteKey, data.ttl_seconds, JSON.stringify(pasteData));
    } else {
      // Store indefinitely
      await redis.set(pasteKey, JSON.stringify(pasteData));
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      request.headers.get('origin') ||
      'http://localhost:3000';
    const shareUrl = `${baseUrl}/p/${pasteId}`;

    return NextResponse.json(
      {
        id: pasteId,
        url: shareUrl
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating paste:', error);
    return NextResponse.json(
      { error: 'Failed to create paste' },
      { status: 500 }
    );
  }
}
