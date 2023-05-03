import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { sendResetPasswordMail } from '@services/backend';
import { APP_ROUTES } from '@constants/appRoutes';
import { toastConfigs } from '@constants/toastConfig';

import { Button, InputBox, Loader } from '@components';
import styles from './ForgotPassword.styles.module.css';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  const signUpUser = () => {
    navigate(APP_ROUTES.SIGNUP);
  };

  const showSuccessToast = () => {
    toast.success('Sent a Password Reset Mail', toastConfigs);
  };

  const showErrortoast = () => {
    toast.error(error, toastConfigs);
  };

  const sendPasswordResetMail = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    const response = await sendResetPasswordMail({ email: email });
    if (response.status === 201) {
      setLoading(false);
      showSuccessToast();
    } else {
      setLoading(false);
      setError(response.data.message[0]);
      setTimeout(() => setError(''), 3000);
    }
  };

  useEffect(() => {
    if (error !== '') {
      showErrortoast();
    }
  }, [error]);

  return (
    <div
      className={`${styles.user_forgot_pass_container} mx-auto shadow d-flex border rounded overflow-hidden`}
    >
      <div
        className={`${styles.div_left} bg-link d-flex flex-column justify-content-around align-items-center`}
      >
        <div>
          <h1 className={`${styles.heading_left_div}`}>New Password</h1>
          <p className={`${styles.title_left_div} text-primary`}>
            Fill these details to set new password
          </p>
        </div>

        <form
          name='UserForgotPasswordForm'
          onSubmit={sendPasswordResetMail}
          method='post'
          className={`${styles.user_forgot_password_form} d-flex flex-column justify-content-between mb-5`}
        >
          <div className={`${styles.email_field} input-group`}>
            <span className='input-group-text'>@</span>
            <InputBox
              type='email'
              placeholder='naveen.agarwal@gmail.com'
              className='form-control'
              name='Email'
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div
            className={`${styles.submit_button} d-flex justify-content-center`}
          >
            <Button
              type='submit'
              className='btn btn-primary active mt-3'
              disabled={loading}
            >
              Update
            </Button>
            {loading ? (
              <Loader className='mt-3' />
            ) : (
              <div className='btn mt-3'></div>
            )}
          </div>
        </form>
      </div>

      <div
        className={`${styles.div_right} bg-primary d-flex flex-column align-items-center`}
      >
        <h2 className={`${styles.heading_div_right} text-light`}>Sign up</h2>
        <p className={`${styles.title_div_right} text-light mx-auto`}>
          Want to create new account. Click on the button below to sign up
          yourself
        </p>
        <div className='text-center'>
          <Button
            type='button'
            className='btn btn-primary active m-3'
            onClick={signUpUser}
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};
