import { useEffect, useState } from 'react';

import { Button } from '@src/components/Button';
import { InputBox } from '@src/components/InputBox';

import { Loader } from '@components';
import styles from './EstimationJIRA.styles.module.scss';

interface EstimationJIRAProps {
  onSubmitHandler: React.FormEventHandler<HTMLFormElement>;
  nextLoader: boolean;
}

export const EstimationJIRA = ({
  onSubmitHandler,
  nextLoader,
}: EstimationJIRAProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => setLoading(nextLoader), [nextLoader]);
  return (
    <form
      className={`w-75 m-5 p-4 bg-white rounded-3 ${styles.game__choice}`}
      onSubmit={onSubmitHandler}
    >
      <h4 className='my-4 text-center'>Sync on JIRA</h4>
      <div className='mb-3'>
        <label className='form-label'>Final Estimate</label>
        <InputBox
          id='estimate'
          type='number'
          className='form-control'
          required
          max={20}
          min={1}
        />
        <div className='form-text'>Same points will appear on JIRA</div>
      </div>
      <div className='mb-3'>
        <label className='form-label'>Comments (if any)</label>
        <textarea id='comment' className='form-control' maxLength={1000} />
      </div>
      <div className='d-flex justify-content-center'>
        {!loading ? (
          <Button type='submit' className='btn btn-primary'>
            Next
          </Button>
        ) : (
          <Loader />
        )}
      </div>
    </form>
  );
};
