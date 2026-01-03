import { notFound } from 'next/navigation';
import Container from '@/components/Container';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface PasteResponse {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;
  view_count: number;
}

async function getPaste(id: string): Promise<PasteResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  console.log('Base URL:', baseUrl);
  const response = await fetch(`${baseUrl}/api/pastes/${id}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    notFound();
  }

  return response.json();
}

export default async function PastePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paste = await getPaste(id);
  const createdAt = new Date();

  return (
    <div className=''>
      <Container>
        <Card className='mt-8'>
          <CardHeader className='border-b'>
            <CardTitle>Paste</CardTitle>
            <CardDescription className='space-y-2'>
              <p>ID: {id}</p>
              {paste.remaining_views !== null && (
                <div>
                  <span className=''>Remaining Views:</span>{' '}
                  {paste.remaining_views}
                </div>
              )}
              {paste.expires_at && (
                <div>
                  <span className=''>Expires:</span>{' '}
                  {new Date(paste.expires_at).toLocaleString()}
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
              Created: {createdAt.toLocaleString()}
            </p>
          </CardFooter>
        </Card>
      </Container>
    </div>
  );
}
