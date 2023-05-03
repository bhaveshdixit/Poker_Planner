import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { selectLoginState } from '@src/store';

import { createPokerBoard } from '@services/backend';
import { APP_ROUTES } from '@constants/appRoutes';
import { CONSTANTS } from '@constants/constants';

import { Button, InputBox, Loader } from '@components';
import styles from './PokerCreateConfig.styles.module.scss';

export const PokerConfig = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | undefined>(undefined);
  const { token } = selectLoginState();
  const [formInput, setFormInput] = useState({
    name: '',
    description: '',
    timer: 45,
    type: 4,
  });
  const [loading, setLoading] = useState(false);
  const [submitDisable, setSubmitDisable] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const createPokerboard = async () => {
    setLoading(true);
    const response = await createPokerBoard(
      {
        name: formInput.name,
        description: formInput.description,
        estimation_type: formInput.type.toString(),
        estimation_time: formInput.timer.toString(),
      },
      token
    );
    setLoading(false);
    return response;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await createPokerboard();
    if (!response || response.status !== 201) {
      setError('Unable to create Pokerboard!');
      timer.current = setTimeout(() => {
        setError(undefined);
      }, 3500);
    } else navigate(APP_ROUTES.POKERBOARD + response.data.id + '/tickets');
  };

  useEffect(() => {
    const isValid = () => {
      return (
        formInput.description === '' ||
        formInput.name === '' ||
        formInput.type === 4
      );
    };
    setSubmitDisable(isValid());
    return () => {
      clearTimeout(timer.current);
    };
  }, [formInput]);

  return (
    <div
      className={`${styles.board__container} bg-white rounded shadow p-5 mt-5`}
    >
      <h3 className='px-3'>Board Configuration</h3>
      <form onSubmit={handleSubmit}>
        <div className='form-floating m-3'>
          <InputBox
            type='text'
            id='boardName'
            name='boardName'
            className='form-control'
            placeholder='Team Name or sprint name or specific name'
            maxLength={CONSTANTS.POKERBOARD_NAME_MAX_LENGTH}
            required
            onChange={(e) =>
              setFormInput({ ...formInput, name: e.target.value })
            }
          />
          <label htmlFor='boardName'>Board Name</label>
        </div>
        <div className='form-floating m-3'>
          <textarea
            className='form-control h-100'
            placeholder='Describe your pokerboard, such as team members, sprint name or specifications of tickets, etc'
            rows={4}
            required
            onChange={(e) =>
              setFormInput({ ...formInput, description: e.target.value })
            }
          ></textarea>
          <label>Board Description</label>
        </div>
        <div className='form-floating m-3'>
          <InputBox
            type='number'
            className='form-control'
            placeholder='45 sec'
            required
            min={CONSTANTS.ESTIMATION_TIME_MIN_LIMIT}
            max={CONSTANTS.ESTIMATION_TIME_MAX_LIMIT}
            value={formInput.timer}
            onChange={(e) =>
              setFormInput({ ...formInput, timer: Number(e.target.value) })
            }
          />
          <label>Estimation time per ticket (in seconds)</label>
        </div>
        <div className='form-floating m-3'>
          <select
            className='form-select'
            required
            onChange={(e) =>
              setFormInput({ ...formInput, type: Number(e.target.value) })
            }
            defaultValue={formInput.type}
          >
            <option value='4'>Select Estimation Type</option>
            <option value='0'>Odd</option>
            <option value='1'>Even</option>
            <option value='2'>Fibonacci</option>
            <option value='3'>Custom</option>
          </select>
          <label>Estimation Input Type</label>
        </div>
        {loading ? (
          <div className='d-flex mt-5 justify-content-center'>
            <Button
              type='submit'
              className='btn btn-primary btn-lg m-2 mw-25'
              disabled={true}
            >
              Create
            </Button>
            <div className='my-3'>
              <Loader />
            </div>
          </div>
        ) : (
          <div className='d-flex mt-5 justify-content-center'>
            <Button
              type='submit'
              className='btn btn-primary btn-lg m-2 mw-25'
              disabled={submitDisable}
            >
              Create
            </Button>
          </div>
        )}
        {error ? (
          <div className='d-flex justify-content-center mt-3'>
            <div
              className='alert mb-0 text-center alert-danger w-25'
              role='alert'
            >
              {error}
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
};
