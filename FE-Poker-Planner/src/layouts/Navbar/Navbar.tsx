import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import logoImg from '@assets/logo.png';

import { RootState, selectLoginState } from '@src/store';
import { useAppDispatch } from '@src/store';

import { logout } from '@services/backend';
import { unsetAuthToken } from '@features/login/loginSlice';

import styles from '@layouts/Navbar/Navbar.styles.module.scss';

export const Navbar = () => {
  const dispatch = useAppDispatch();
  const { token } = selectLoginState();
  const isAuthenticated = Boolean(token);

  const logOutUser = () => {
    dispatch(unsetAuthToken());
    logout(token);
  };

  return (
    <nav className='navbar navbar-expand-lg shadow navbar-light bg-white d-flex justify-content-between'>
      <div className={`ps-3 ${styles.logo}`}>
        <NavLink to='/' className='d-flex text-decoration-none'>
          <div className={`${styles.navbar__imgBox}`}>
            <img
              src={logoImg}
              alt='Poker Planner Logo'
              className='w-100 h-100'
            />
          </div>
          <div className='my-auto px-3 navbar-brand'>
            <h1 className='mb-0'>Poker Planner</h1>
          </div>
        </NavLink>
      </div>

      {isAuthenticated ? (
        <ul className='navbar-nav d-flex justify-content-between me-3'>
          <li className='nav-item active ps-2 pe-2 mx-2'>
            <NavLink to={'/groups/create/'}>
              <span className='btn btn-primary p-2 ps-4 pe-4'>
                Create Group
              </span>
            </NavLink>
          </li>

          <li className='nav-item active ps-2 pe-2'>
            <NavLink to='/pokerboard/configure'>
              <span className='btn btn-primary p-2 ps-4 pe-4'>
                Create Board
              </span>
            </NavLink>
          </li>
          <li className='nav-item active ps-2 pe-2'>
            <NavLink onClick={logOutUser} to={'/login'}>
              <span className='btn btn-primary p-2 ps-4 pe-4'>Logout</span>
            </NavLink>
          </li>
        </ul>
      ) : (
        <ul className='navbar-nav d-flex justify-content-between me-3'>
          <li className='nav-item active ps-2 pe-2 mx-2'>
            <NavLink to={'/signup'}>
              {/* When the navlink is active i.e we are on the current page then we will not show the signup button */}
              {({ isActive }) => (
                <span
                  className={
                    isActive ? 'd-none' : 'btn btn-primary p-2 ps-4 pe-4'
                  }
                >
                  Sign up
                </span>
              )}
            </NavLink>
          </li>
          <li className='nav-item active ps-2 pe-2'>
            {/* When the navlink is active i.e we are on the current page then we will not show the login button */}
            <NavLink to={'/login'}>
              {({ isActive }) => (
                <span
                  className={
                    isActive ? 'd-none' : 'btn btn-primary p-2 ps-4 pe-4'
                  }
                >
                  Login
                </span>
              )}
            </NavLink>
          </li>
        </ul>
      )}
    </nav>
  );
};
