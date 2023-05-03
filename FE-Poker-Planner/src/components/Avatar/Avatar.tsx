import avatar_styles from './Avatar.styles.module.scss';

export enum AvatarSize {
  SMALL = 1,
  MEDIUM,
  LARGE,
  XLARGE,
  XXLARGE,
}

interface AvatarProps {
  firstName: string;
  lastName: string;
  size: AvatarSize;
}

export const Avatar = ({ firstName, lastName, size }: AvatarProps) => {
  return (
    <div
      className={`${avatar_styles[`avatar--size-${size}`]} ${
        avatar_styles.avatar
      } mx-auto fw-bold d-flex border border-${size} rounded text-primary-emphasis rounded-circle`}
    >
      <p className='m-auto'>
        {firstName[0]}
        {lastName[0]}
      </p>
    </div>
  );
};
