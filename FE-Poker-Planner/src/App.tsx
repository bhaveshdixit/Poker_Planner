import { useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { RootState, selectLoginState } from '@src/store';

import { APP_ROUTES } from '@constants/appRoutes';

import { Navbar } from '@layouts/Navbar';
import { GuardedRoute } from '@components';
import {
  Dashboard,
  EstimationGame,
  ForgotPassword,
  CreateGroup,
  JiraAuth,
  PokerBoardDetails,
  PokerConfig,
  PokerJiraTickets,
  PokerUserInvite,
  ResetPassword,
  UserLogin,
  UserSignup,
  UserVerification,
} from '@containers';

function App() {
  const { token } = selectLoginState();
  const { has_jira_credentials } = selectLoginState();
  const isAuthenticated = Boolean(token);

  return (
    <div className='bg-light'>
      <Navbar />
      <ToastContainer />
      <Routes>
        <Route
          element={
            <GuardedRoute
              isRouteAccessible={isAuthenticated}
              redirectRoute={APP_ROUTES.LOGIN}
            />
          }
        >
          <Route path={APP_ROUTES.HOME_PATH} element={<Dashboard />} />
        </Route>
        <Route
          element={
            <GuardedRoute
              isRouteAccessible={!isAuthenticated}
              redirectRoute={APP_ROUTES.HOME}
            />
          }
        >
          <Route path={APP_ROUTES.LOGIN_PATH} element={<UserLogin />} />
        </Route>
        <Route
          element={
            <GuardedRoute
              isRouteAccessible={!isAuthenticated}
              redirectRoute={APP_ROUTES.HOME}
            />
          }
        >
          <Route path={APP_ROUTES.SIGNUP_PATH} element={<UserSignup />} />
        </Route>
        <Route
          element={
            <GuardedRoute
              isRouteAccessible={!isAuthenticated}
              redirectRoute={APP_ROUTES.HOME}
            />
          }
        >
          <Route
            path={APP_ROUTES.FORGOT_PASSWORD}
            element={<ForgotPassword />}
          />
        </Route>
        <Route
          element={
            <GuardedRoute
              isRouteAccessible={!isAuthenticated}
              redirectRoute={'/'}
            />
          }
        >
          <Route
            path={APP_ROUTES.RESET_PASSWORD_PATH}
            element={<ResetPassword />}
          />
        </Route>

        <Route
          element={
            <GuardedRoute
              isRouteAccessible={isAuthenticated}
              redirectRoute={APP_ROUTES.LOGIN}
            />
          }
        >
          <Route
            path={APP_ROUTES.POKER_INVITES}
            element={<PokerUserInvite />}
          />
        </Route>
        <Route
          element={
            <GuardedRoute
              isRouteAccessible={!isAuthenticated}
              redirectRoute={APP_ROUTES.HOME}
            />
          }
        >
          <Route path={APP_ROUTES.VERIFY_PATH} element={<UserVerification />} />
        </Route>
        <Route
          element={
            <GuardedRoute
              isRouteAccessible={isAuthenticated && has_jira_credentials}
              redirectRoute={APP_ROUTES.JIRA_AUTH}
            />
          }
        >
          <Route path={APP_ROUTES.POKER_CONFIGURE} element={<PokerConfig />} />
        </Route>
        <Route
          element={
            <GuardedRoute
              isRouteAccessible={isAuthenticated}
              redirectRoute={APP_ROUTES.LOGIN}
            />
          }
        >
          <Route
            path={APP_ROUTES.POKER_TICKETS}
            element={<PokerJiraTickets />}
          />
        </Route>
        <Route
          element={
            <GuardedRoute
              isRouteAccessible={isAuthenticated && !has_jira_credentials}
              redirectRoute={APP_ROUTES.LOGIN}
            />
          }
        >
          <Route path={APP_ROUTES.JIRA_AUTH} element={<JiraAuth />} />
        </Route>
        <Route
          element={
            <GuardedRoute
              isRouteAccessible={isAuthenticated}
              redirectRoute={APP_ROUTES.LOGIN}
            />
          }
        >
          <Route
            path={APP_ROUTES.ESTIMATION_GAME_PATH}
            element={<EstimationGame />}
          />
        </Route>
        <Route
          element={
            <GuardedRoute
              isRouteAccessible={isAuthenticated}
              redirectRoute={APP_ROUTES.LOGIN}
            />
          }
        >
          <Route path={APP_ROUTES.CREATE_GROUP} element={<CreateGroup />} />
        </Route>
        <Route
          element={
            <GuardedRoute
              isRouteAccessible={isAuthenticated}
              redirectRoute={APP_ROUTES.LOGIN}
            />
          }
        >
          <Route
            path={APP_ROUTES.POKERBOARD_PATH}
            element={<PokerBoardDetails />}
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
