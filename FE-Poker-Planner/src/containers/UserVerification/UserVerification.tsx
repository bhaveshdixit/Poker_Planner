import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { verifyUser } from '@services/backend';
import { APP_ROUTES } from '@constants/appRoutes';

import { Button } from '@components';
import styles from './UserVerification.styles.module.scss';

export const UserVerification = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [data, setData] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const callApi = async () => {
    if (token) {
      const response = await verifyUser({ token_key: token });
      if (!response) {
        setData('Oops! Something went wrong try again later');
      } else if (response.status === 200) {
        setData('You are Verified now!');
        setIsVerified(true);
      } else if (response.status === 404) {
        setData('Verification Code Not Found!');
      } else {
        setData(response.data.message[0]);
      }
    }
  };

  useEffect(() => {
    callApi();
  }, []);

  return (
    <div
      className={`
        mx-auto bg-white shadow d-flex justify-content-center
        align-items-center flex-column border rounded mt-5
        ${styles.verification_box}
      `}
    >
      <h3 className='m-3'>{data}</h3>
      {isVerified && (
        <Button
          type='submit'
          className='btn btn-success m-3'
          onClick={() => navigate(APP_ROUTES.LOGIN)}
        >
          Login Now!
        </Button>
      )}
    </div>
  );
};
