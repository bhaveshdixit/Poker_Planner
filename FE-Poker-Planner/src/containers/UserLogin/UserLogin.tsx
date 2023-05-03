import type { ChangeEventHandler } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import { selectLoginState } from '@src/store';
import { useAppDispatch } from '@src/store';

import { loginUser, resetError } from '@features/login/loginSlice';
import { APP_ROUTES } from '@constants/appRoutes';
import { CONSTANTS } from '@constants/constants';

import { Button, InputBox } from '@components';
import styles from './UserLogin.styles.module.scss';

export const UserLogin = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const params = useParams();
  const { error } = selectLoginState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const setEMail: ChangeEventHandler<HTMLInputElement> = (event) => {
    setEmail(event.target.value);
  };

  const setPass: ChangeEventHandler<HTMLInputElement> = (event) => {
    setPassword(event.target.value);
  };

  const logInUser = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    dispatch(loginUser({ email: email.toLowerCase(), password }));
  };

  const registerUser = () => {
    navigate(APP_ROUTES.SIGNUP + (params.key ? params.key : ''));
  };

  useEffect(() => {
    dispatch(resetError());
  }, [email, password]);

  return (
    <div
      className='mx-auto bg-white shadow d-flex border rounded overflow-hidden'
      style={{
        width: '700px',
        marginTop: '200px',
      }}
    >
      <div className={`${styles.div_left_side_of_parent} bg-white`}>
        <h1 className={`${styles.about_left_div}`}>Login</h1>
        <p className={`${styles.title_left_div} text-primary`}>
          Sign in to your account
        </p>
        <form onSubmit={logInUser}>
          <div style={{ width: '320px', marginLeft: '40px', marginTop: '5px' }}>
            <div className='input-group'>
              <span className='input-group-text'>@</span>
              <InputBox
                type='email'
                placeholder='Email'
                className='form-control'
                onChange={setEMail}
                required
              />
            </div>
          </div>

          <div
            style={{ width: '320px', marginLeft: '40px', marginTop: '20px' }}
          >
            <div className='input-group'>
              <span className='input-group-text'>#</span>
              <InputBox
                type='password'
                placeholder='Password'
                className='form-control'
                onChange={setPass}
                required
                minLength={CONSTANTS.USER_PASSWORD_MIN_LENGTH}
                maxLength={CONSTANTS.USER_PASSWORD_MAX_LENGTH}
              />
            </div>
          </div>

          <div
            className='input-group my-4 d-flex justify-content-between'
            style={{ width: '320px', marginLeft: '40px', marginTop: '30px' }}
          >
            <div className='col-6'>
              <Button type='submit' className='btn btn-primary px-4'>
                Login
              </Button>
            </div>

            <Link to='/forgotpassword' className='py-2'>
              Forgot Password
            </Link>
          </div>
          {error ? (
            <div
              className={`${styles.error_field} alert mb-0 text-center alert-danger overflow-hidden`}
              role='alert'
            >
              {error}
            </div>
          ) : null}
        </form>
      </div>

      <div className='bg-primary d-flex' style={{ width: '300px' }}>
        <div className='m-auto text-center text-light'>
          <h2 className='mb-4'>Sign Up</h2>
          <p>
            Don&apos;t have a account on the poker planner. Click on the below
            button to register yourself
          </p>
          <div>
            <Button
              type='button'
              className='btn btn-primary active mt-3'
              onClick={registerUser}
            >
              Register Now!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
