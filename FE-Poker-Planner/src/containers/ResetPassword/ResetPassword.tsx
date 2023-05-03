import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { resetPassword, resetPasswordAccessible } from '@services/backend';
import { APP_ROUTES } from '@constants/appRoutes';
import { toastConfigs } from '@constants/toastConfig';

import { Button, InputBox, Loader } from '@components';
import styles from './ResetPassword.styles.module.scss';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [match, setMatch] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isAccessible, setIsAccessible] = useState<boolean>(true);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const firstRender = useRef(true);

  const signUpUser = () => {
    navigate(APP_ROUTES.SIGNUP);
  };

  const changePassword = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMatch(false);
      return;
    }
    setLoading(true);
    const response = await resetPassword({
      key: params.token as string,
      password: password,
    });
    if (response.status === 200) {
      setLoading(false);
      toast.success('Reset Successful', toastConfigs);
      navigate(APP_ROUTES.LOGIN);
    } else {
      setLoading(false);
      toast.error(response.data.message[0], toastConfigs);
    }
  };

  useEffect(() => {
    (async () => {
      const key = params.token ?? '';
      const response = await resetPasswordAccessible(key);
      if (response.status === 200) {
        setPageLoading(false);
      } else {
        setPageLoading(false);
        setError(response.data.message[0]);
        setIsAccessible(false);
      }
    })();
  }, []);

  if (pageLoading)
    return (
      <div className='d-flex justify-content-center align-items-center m-5'>
        <Loader />
      </div>
    );

  return (
    <>
      {!isAccessible ? (
        <div className='mx-auto bg-white shadow d-flex justify-content-center align-items-center flex-column border rounded mt-5 w-25 p-5'>
          <h4 className='text-center'>{error}</h4>
        </div>
      ) : (
        <div
          className={`${styles.user_forgot_pass_container} mx-auto d-flex border rounded shadow overflow-hidden`}
        >
          <div
            className={`${styles.div_left} bg-link d-flex flex-column justify-content-around align-items-center`}
          >
            <div>
              <h1 className={styles.heading_left_div}>New Password</h1>
              <p className={`${styles.title_left_div} text-primary`}>
                Fill these details to set new password
              </p>
            </div>

            <form
              name='UserForgotPasswordForm'
              onSubmit={changePassword}
              method='post'
              className={`${styles.user_forgot_password_form} d-flex flex-column justify-content-between mb-5`}
            >
              <div
                className={`${styles.password_old_new_field} input-group m-2`}
              >
                <span className='input-group-text'>#</span>
                <InputBox
                  type='password'
                  placeholder='New Password'
                  className='form-control'
                  name='NewPassword'
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div
                className={`${styles.password_old_new_field} input-group m-2`}
              >
                <span className='input-group-text'>#</span>
                <InputBox
                  type='password'
                  placeholder='Confirm new password'
                  className='form-control'
                  name='ConfirmNewPassword'
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {!match && (
                  <div className='text-danger'>
                    Password and Confirm Password do not match
                  </div>
                )}
              </div>

              <div className={`${styles.submit_button} text-center`}>
                <Button
                  type='submit'
                  className='btn btn-primary active mt-3'
                  disabled={loading}
                >
                  Update
                </Button>
              </div>
              <div className='d-flex justify-content-center'>
                {loading && <Loader />}
              </div>
            </form>
          </div>

          <div className={`${styles.div_right} bg-primary`}>
            <h2 className={`${styles.heading_div_right} text-light`}>
              Sign up
            </h2>
            <p className={`${styles.title_div_right} text-light mx-auto`}>
              Want to create new account. Click on the button below to sign up
              yourself
            </p>
            <div className='text-center'>
              <Button
                type='button'
                className='btn btn-primary active mt-3'
                onClick={signUpUser}
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
