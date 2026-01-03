import { notFound } from 'next/navigation';
import { getRedisClient } from '@/lib/redis';
import { getCurrentTime } from '@/lib/utils';
import { Metadata } from 'next';
import Container from '@/components/Container';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface PasteData {
  content: string;
  ttl_seconds?: number;
  max_views?: number;
  created_at: number;
  view_count: number;
}

interface PastePageProps {
  params: Promise<{ id: string }>;
}

async function getPaste(id: string) {
  const redis = getRedisClient();
  const pasteKey = `paste:${id}`;

  const pasteJson = await redis.get(pasteKey);

  if (!pasteJson) {
    return null;
  }

  const paste: PasteData = JSON.parse(pasteJson);
  const currentTime = new Date();

  // Check if paste has exceeded view limit
  if (paste.max_views !== undefined && paste.view_count >= paste.max_views) {
    await redis.del(pasteKey);
    return null;
  }

  // Check if paste has expired (manual check, Redis TTL handles auto-deletion)
  if (paste.ttl_seconds !== undefined) {
    const createdAt = paste.created_at;
    const expiryTime = createdAt + paste.ttl_seconds * 1000;

    if (currentTime.getTime() >= expiryTime) {
      await redis.del(pasteKey);
      return null;
    }
  }

  // Increment view count
  paste.view_count += 1;

  if (paste.ttl_seconds) {
    await redis.setex(pasteKey, paste.ttl_seconds, JSON.stringify(paste));
  } else {
    await redis.set(pasteKey, JSON.stringify(paste));
  }

  return paste;
}

export async function generateMetadata({
  params
}: PastePageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Paste - ${id}`,
    description: 'View paste'
  };
}

export default async function PastePage({ params }: PastePageProps) {
  const { id } = await params;
  const paste = await getPaste(id);

  if (!paste) {
    notFound();
  }

  const remainingViews =
    paste.max_views !== undefined
      ? Math.max(0, paste.max_views - paste.view_count)
      : null;

  const expiresAt =
    paste.ttl_seconds !== undefined
      ? new Date(paste.created_at + paste.ttl_seconds * 1000)
      : null;

  return (
    <div className=''>
      <Container>
        <Card className='mt-8'>
          <CardHeader className='border-b'>
            <CardTitle>Paste</CardTitle>
            <CardDescription className='space-y-2'>
              <p>ID: {id}</p>
              {remainingViews !== null && (
                <div>
                  <span className=''>Remaining Views:</span> {remainingViews}
                </div>
              )}
              {expiresAt && (
                <div>
                  <span className=''>Expires:</span>{' '}
                  {expiresAt.toLocaleString()}
                </div>
              )}
              {paste.view_count && (
                <div>
                  <span className=''>View Count:</span> {paste.view_count}
                </div>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent>{paste.content}</CardContent>

          <CardFooter className='border-t'>
            <p className='text-xs text-slate-600'>
              Created: {new Date(paste.created_at).toLocaleString()}
            </p>
          </CardFooter>
        </Card>
      </Container>
    </div>
  );
}
