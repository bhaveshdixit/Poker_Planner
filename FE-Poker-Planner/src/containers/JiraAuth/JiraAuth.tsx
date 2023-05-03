import type { ChangeEventHandler } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  faLink,
  faUser,
  faHashtag,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { selectLoginState } from '@src/store';
import { useAppDispatch } from '@src/store';

import { createJiraUser } from '@services/backend';
import { addJira } from '@features/login/loginSlice';
import { APP_ROUTES } from '@constants/appRoutes';
import { toastConfigs } from '@constants/toastConfig';

import { Button, InputBox, Loader } from '@components';
import styles from './JiraAuth.styles.module.scss';

export const JiraAuth = () => {
  const { token } = selectLoginState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [errors, setError] = useState('');
  const [baseurl, setBaseurl] = useState('');
  const [username, SetUsername] = useState('');
  const [jiratoken, SetJiratoken] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  const setBaseUrl: ChangeEventHandler<HTMLInputElement> = (event) => {
    setBaseurl(event.target.value);
  };

  const setUserName: ChangeEventHandler<HTMLInputElement> = (event) => {
    SetUsername(event.target.value);
  };

  const setToken: ChangeEventHandler<HTMLInputElement> = (event) => {
    SetJiratoken(event.target.value);
  };

  const addUser = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setLoading(true);
    const body = {
      baseurl,
      username,
      token: jiratoken,
    };
    const response = await createJiraUser(token, body);
    if (!response) {
      setError('Something went wrong! Try again later');
    }
    if (response.status == 201) {
      await dispatch(addJira());
      toast.success('Jira authtentication completed', toastConfigs);
      navigate(APP_ROUTES.POKER_CONFIGURE);
    } else {
      setError(response.data.message[0]);
    }
    setLoading(false);
  };

  const openJiraPage = () => {
    window.open(
      'https://id.atlassian.com/manage-profile/security/api-tokens',
      '_blank',
      'noreferrer'
    );
  };

  return (
    <div
      className={`${styles.login_page_parent_div} shadow mx-auto d-flex border rounded overflow-hidden`}
    >
      <div
        className={`${styles.div_left_side_of_parent} bg-white div_left_side_of_parent`}
      >
        <h3 className={`${styles.about_left_div}`}>JIRA Authentication</h3>
        <p className={`${styles.title_left_div} text-primary`}>
          Add your jira credentials
        </p>

        <form
          name='UserAddInJiraForm'
          onSubmit={addUser}
          className={`${styles.user_login_form}`}
        >
          <div className={`${styles.email_field} my-3 input-group`}>
            <span className='input-group-text'>
              <FontAwesomeIcon icon={faLink} />
            </span>
            <InputBox
              type='url'
              placeholder='Baseurl'
              className='form-control'
              onChange={setBaseUrl}
              name='BaseUrl'
              required
            />
          </div>

          <div className={`${styles.email_field} my-3 input-group`}>
            <span className='input-group-text'>
              <FontAwesomeIcon icon={faUser} />
            </span>
            <InputBox
              type='email'
              placeholder='Jira Username'
              className='form-control'
              name='JiraUserName'
              onChange={setUserName}
              required
            />
          </div>

          <div className={`${styles.email_field} my-3 input-group`}>
            <span className='input-group-text'>
              <FontAwesomeIcon icon={faHashtag} />
            </span>
            <InputBox
              type='text'
              placeholder='token'
              className='form-control'
              name='Token'
              onChange={setToken}
              required
            />
          </div>

          <div className={`${styles.submit_field} d-flex`}>
            <Button
              type='submit'
              className='btn btn-primary me-3'
              disabled={loading}
            >
              Add
            </Button>
            {loading ? <Loader className='my-auto' /> : null}
          </div>

          <p
            className={`text-center text-danger my-4 fw-bold ${styles.errors_middle}`}
          >
            {errors}
          </p>
        </form>
      </div>

      <div className={`${styles.div_left} bg-primary`}>
        <h2 className={`${styles.heading_div_left} text-light`}>Jira</h2>
        <p className={`${styles.about_div_left} text-light mx-auto`}>
          Do not have Jira API token? Create an API token from your Atlassian
          account.
        </p>
        <div className='text-center'>
          <Button
            type='button'
            className='btn btn-primary active mt-3'
            onClick={openJiraPage}
            icon={faArrowUpRightFromSquare}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
};
