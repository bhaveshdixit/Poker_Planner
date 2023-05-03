import type { InputHTMLAttributes } from 'react';

export const InputBox = ({
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) => {
  return <input {...rest} />;
};
