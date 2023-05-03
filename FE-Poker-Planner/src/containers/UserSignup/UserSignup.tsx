import type { ChangeEvent, Dispatch } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAppDispatch } from '@src/store';

import { getEmailForNotification, signUp } from '@services/backend';
import { loginUser } from '@features/login/loginSlice';
import { APP_ROUTES } from '@constants/appRoutes';
import { CONSTANTS } from '@constants/constants';
import { toastConfigs } from '@constants/toastConfig';

import { Button, InputBox } from '@components';
import styles from './UserSignup.styles.module.scss';

export const UserSignup = () => {
  const initialErrors: Record<string, string> = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    message: '',
  };

  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useAppDispatch();

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errors, setErrors] = useState(initialErrors);
  const [loading, setLoading] = useState<boolean>(false);
  const [fixMail, setFixMail] = useState<boolean>(false);

  const changeHandler = (
    event: ChangeEvent<HTMLInputElement>,
    setFunction: Dispatch<React.SetStateAction<string>>
  ) => {
    setFunction(event.target.value);
  };

  const logInUser = () => {
    navigate(APP_ROUTES.LOGIN + (params.key ? params.key : ''));
  };

  const registerUser = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setErrors({
        ...errors,
        confirm_password: 'Password and Confirm Password do not match',
      });
      return;
    }
    const body: Record<string, string> = {
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      password,
    };
    if (params.key) body['key'] = params.key;

    setLoading(true);
    const response = await signUp(body);

    if (!response) {
      setLoading(false);
      const newError = { ...initialErrors };
      newError.message = 'Signup failed';
      setErrors(newError);
    } else if (response.status === 201) {
      if (response.data.message === 'Verification mail queued') {
        toast.success('Verification mail sent', toastConfigs);
        navigate(APP_ROUTES.LOGIN);
      } else {
        dispatch(loginUser({ email, password }));
      }
    } else {
      const errorFields = Object.keys(response.data);
      let newError = { ...initialErrors };
      errorFields.map((field) => {
        newError[field] = response.data[field][0];
      });
      setErrors(newError);
    }
    setLoading(false);
  };

  const getEmail = async () => {
    if (!params.key) return;
    const response = await getEmailForNotification(params.key);
    if (response.status === 200) {
      setEmail(response.data.email);
      setFixMail(true);
    } else {
      navigate(APP_ROUTES.SIGNUP);
    }
  };

  useEffect(() => {
    getEmail();
  }, []);

  return (
    <div
      className='mx-auto bg-white shadow d-flex border rounded overflow-hidden'
      style={{
        width: '700px',
        marginTop: '100px',
        marginBottom: '100px',
      }}
    >
      <div className='bg-link' style={{ width: '400px' }}>
        <h1 style={{ marginTop: '30px', marginLeft: '40px' }}>Sign Up</h1>
        <p
          className='text-primary'
          style={{ marginLeft: '40px', marginTop: '5px' }}
        >
          Sign up to Poker Planner app
        </p>

        <form onSubmit={registerUser} className='form'>
          <div style={{ width: '320px', marginLeft: '40px', marginTop: '5px' }}>
            <div className='input-group'>
              <span className='input-group-text'>f</span>
              <InputBox
                type='text'
                placeholder='First Name'
                className='form-control'
                onChange={(event) => changeHandler(event, setFirstName)}
                required
                maxLength={CONSTANTS.USER_FIRST_NAME_MAX_LENGTH}
              />
            </div>
            <div className='small text-danger'>&nbsp;{errors.first_name}</div>
          </div>
          <div
            style={{ width: '320px', marginLeft: '40px', marginTop: '15px' }}
          >
            <div className='input-group'>
              <span className='input-group-text'>g</span>
              <InputBox
                type='text'
                placeholder='Last Name'
                className='form-control'
                onChange={(event) => changeHandler(event, setLastName)}
                required
                maxLength={CONSTANTS.USER_LAST_NAME_MAX_LENGTH}
              />
            </div>
            <div className='small text-danger'>&nbsp;{errors.last_name}</div>
          </div>
          <div
            style={{ width: '320px', marginLeft: '40px', marginTop: '15px' }}
          >
            <div className='input-group'>
              <span className='input-group-text'>e</span>
              <InputBox
                type='email'
                placeholder='Email'
                className='form-control'
                name='Email'
                onChange={(event) => changeHandler(event, setEmail)}
                disabled={fixMail}
                required
                value={email}
              />
            </div>
            <div className='small text-danger'>&nbsp;{errors.email}</div>
          </div>
          <div
            style={{ width: '320px', marginLeft: '40px', marginTop: '15px' }}
          >
            <div className='input-group'>
              <span className='input-group-text'>#</span>
              <InputBox
                type='password'
                placeholder='Password'
                className='form-control'
                onChange={(event) => changeHandler(event, setPassword)}
                required
                minLength={CONSTANTS.USER_PASSWORD_MIN_LENGTH}
                maxLength={CONSTANTS.USER_LAST_NAME_MAX_LENGTH}
              />
            </div>
            <div className={`small text-danger ${styles.error_field}`}>
              &nbsp;{errors.password}
            </div>
          </div>
          <div
            style={{ width: '320px', marginLeft: '40px', marginTop: '15px' }}
          >
            <div className='input-group'>
              <span className='input-group-text'>#</span>
              <InputBox
                type='password'
                placeholder='Confirm Password'
                className='form-control'
                onChange={(event) => changeHandler(event, setConfirmPassword)}
                required
                minLength={CONSTANTS.USER_PASSWORD_MIN_LENGTH}
                maxLength={CONSTANTS.USER_PASSWORD_MAX_LENGTH}
              />
            </div>
            <div className={`small text-danger ${styles.error_field}`}>
              &nbsp;{errors.confirm_password}
            </div>
          </div>
          <div
            className='text-center d-flex align-item-center py-3'
            style={{ marginTop: '10px' }}
          >
            <Button
              type='submit'
              className={`btn btn-primary active ${
                loading ? 'disabled ms-auto' : 'mx-auto'
              }`}
            >
              Register
            </Button>
            {loading ? (
              <div
                className='spinner-border me-auto text-secondary'
                role='status'
              >
                <span className='visually-hidden'>Loading...</span>
              </div>
            ) : null}
          </div>
        </form>
        {errors.message ? (
          <div className='mb-0 text-center alert alert-danger' role='alert'>
            {errors.message}
          </div>
        ) : null}
      </div>
      <div className='bg-primary d-flex' style={{ width: '300px' }}>
        <div className='m-auto text-center text-light'>
          <h2 className='mb-4'>Log in</h2>
          <p>
            Already have a account in the Poker Planner? Log in yourself by
            clicking on the below button
          </p>

          <Button
            type='button'
            className='btn btn-primary active mt-3'
            onClick={logInUser}
          >
            Log in
          </Button>
        </div>
      </div>
    </div>
  );
};
