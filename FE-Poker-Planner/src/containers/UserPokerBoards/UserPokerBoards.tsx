import type { BoardType } from '@components';
import { BoardCard } from '@components';

interface UserPokerBoardsProps {
  boards: BoardType[];
}

export const UserPokerBoards = ({ boards }: UserPokerBoardsProps) => {
  return (
    <>
      {boards.length ? (
        boards.map((board, index) => <BoardCard board={board} key={index} />)
      ) : (
        <div>
          <p className='m-0'>No Boards Available</p>
        </div>
      )}
    </>
  );
};
