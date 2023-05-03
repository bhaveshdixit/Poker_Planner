import type { ButtonHTMLAttributes } from 'react';

import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: IconProp;
}

export const Button = ({ icon, children, ...rest }: ButtonProps) => {
  return (
    <button {...rest}>
      {icon ? <FontAwesomeIcon icon={icon} size='xs' className='me-2' /> : ''}
      {children}
    </button>
  );
};
