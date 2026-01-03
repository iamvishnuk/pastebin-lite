import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

const Container = ({ children, className }: Props) => {
  return (
    <div className={cn('container mx-auto w-full max-w-3xl', className)}>
      {children}
    </div>
  );
};

export default Container;
