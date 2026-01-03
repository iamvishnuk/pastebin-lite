import Container from './Container';

const Header = () => {
  return (
    <header className='border-b'>
      <Container className='py-2'>
        <div>
          <h1 className='mb-1 text-2xl font-bold capitalize md:text-3xl'>
            Pastebin Lite
          </h1>
          <p className='text-muted-foreground'>
            Share you content with a single link
          </p>
        </div>
      </Container>
    </header>
  );
};

export default Header;
