import { Avatar, AvatarSize } from '@components';

export interface UserProfileProps {
  firstName: string;
  lastName: string;
  email: string;
}

export const UserProfile = (props: UserProfileProps) => {
  const { firstName, lastName, email } = props;
  return (
    <div className='card shadow container-fluid shadow-sm mb-5'>
      <div className='row'>
        <div className='col-md-2 text-center p-3'>
          <Avatar {...props} size={AvatarSize.XLARGE} />
        </div>
        <div className='h-100 col-md-5 text-center'>
          <h4 className='py-md-5'>
            {firstName} {lastName}
          </h4>
        </div>
        <div className='col-md-5 text-center'>
          <h4 className='py-md-5'>{email}</h4>
        </div>
      </div>
    </div>
  );
};
