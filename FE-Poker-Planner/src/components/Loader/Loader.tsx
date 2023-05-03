interface LoaderProps {
  className?: string;
}

export const Loader = ({ className = '' }: LoaderProps) => (
  <div className={`spinner-border ${className}`} role='status'>
    <span className='visually-hidden'>Loading...</span>
  </div>
);
