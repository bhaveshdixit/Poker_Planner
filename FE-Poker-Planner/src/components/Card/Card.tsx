import cardImg from '@assets/card_frame.png';

import styles from './Card.styles.module.scss';

interface CardProps {
  cardValue: number;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  disabled: boolean;
}

export const Card = ({ cardValue, onClick, disabled }: CardProps) => (
  <div
    className={`position-relative ${styles.card} ${
      disabled && 'pe-none opacity-75'
    }`}
    onClick={onClick}
  >
    <img className='mw-100 mh-100' src={cardImg} alt='Poker Card' />
    <h3 className={`position-absolute user-select-none  ${styles.card__value}`}>
      {cardValue}
    </h3>
  </div>
);
