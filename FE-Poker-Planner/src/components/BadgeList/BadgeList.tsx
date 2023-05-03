import styles from './BadgeList.styles.module.scss';

export const Badge = ({
  text,
  remove,
}: {
  text: string;
  remove: (listItem: string) => void;
}) => {
  return (
    <p className='badge py-2 mb-2 px-3 bg-secondary'>
      {text}
      <span
        onClick={() => remove(text)}
        className={`d-inline-block ms-3 border border-white rounded rounded-circle ${styles.cross}`}
      >
        x
      </span>
    </p>
  );
};

export const BadgeList = ({
  list,
  remove,
}: {
  list: string[];
  remove: (listItem: string) => void;
}) => {
  return (
    <span>
      {list.map((item, index) => (
        <span key={index} className='me-2'>
          <Badge text={item} remove={remove} />
        </span>
      ))}
    </span>
  );
};
