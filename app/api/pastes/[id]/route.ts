import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { getCurrentTime } from '@/lib/utils';

interface PasteData {
  content: string;
  ttl_seconds?: number;
  max_views?: number;
  created_at: number;
  view_count: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const redis = getRedisClient();
    const pasteKey = `paste:${id}`;

    // Fetch paste from Redis
    const pasteJson = await redis.get(pasteKey);

    if (!pasteJson) {
      return NextResponse.json({ error: 'Paste not found' }, { status: 404 });
    }

    const paste: PasteData = JSON.parse(pasteJson);
    const currentTime = getCurrentTime(request);

    // Check if paste has exceeded view limit
    if (paste.max_views !== undefined && paste.view_count >= paste.max_views) {
      // Delete the paste since it's exhausted
      await redis.del(pasteKey);
      return NextResponse.json(
        { error: 'Paste view limit exceeded' },
        { status: 404 }
      );
    }

    // Check if paste has expired (manual check, Redis TTL handles auto-deletion)
    if (paste.ttl_seconds !== undefined) {
      const createdAt = paste.created_at;
      const expiryTime = createdAt + paste.ttl_seconds * 1000;

      if (currentTime.getTime() >= expiryTime) {
        await redis.del(pasteKey);
        return NextResponse.json({ error: 'Paste expired' }, { status: 404 });
      }
    }

    // Increment view count
    paste.view_count += 1;
    const remainingTtl = paste.ttl_seconds || -1;

    if (remainingTtl > 0) {
      await redis.setex(pasteKey, paste.ttl_seconds!, JSON.stringify(paste));
    } else {
      await redis.set(pasteKey, JSON.stringify(paste));
    }

    // Calculate response
    const remainingViews =
      paste.max_views !== undefined
        ? Math.max(0, paste.max_views - paste.view_count)
        : null;

    const expiresAt =
      paste.ttl_seconds !== undefined
        ? new Date(paste.created_at + paste.ttl_seconds * 1000).toISOString()
        : null;

    return NextResponse.json({
      content: paste.content,
      remaining_views: remainingViews,
      expires_at: expiresAt,
      view_count: paste.view_count
    });
  } catch (error) {
    console.error('Error fetching paste:', error);
    return NextResponse.json(
      { error: 'Failed to fetch paste' },
      { status: 500 }
    );
  }
}
