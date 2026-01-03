import Container from '@/components/Container';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <Container>
      <div className='flex min-h-[70vh] flex-col items-center justify-center py-20 text-center'>
        <h1 className='text-4xl font-extrabold'>404</h1>
        <p className=''>Paste Not Found</p>
        <p className='mb-8 text-slate-600'>
          This paste may have expired, reached its view limit, or never existed.
        </p>
        <Link href='/'>
          <Button>Create a New Paste</Button>
        </Link>
      </div>
    </Container>
  );
}
