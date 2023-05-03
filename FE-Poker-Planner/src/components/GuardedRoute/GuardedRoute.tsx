import { Navigate, Outlet, useParams } from 'react-router-dom';

interface GuardedRouteProps {
  isRouteAccessible?: boolean;
  redirectRoute?: string;
}

export const GuardedRoute = ({
  isRouteAccessible = false,
  redirectRoute = '/',
}: GuardedRouteProps): JSX.Element => {
  const params = useParams();
  return (
    <>
      {isRouteAccessible ? (
        <Outlet />
      ) : (
        <Navigate to={redirectRoute + (params.key ? params.key : '')} />
      )}
    </>
  );
};
