import Link from 'next/link';
import router from 'next/router';
import React, { useContext } from 'react';
import { auth } from '../../firebase/firebase';
import { AuthContext } from '../../providers/auth/AuthProvider';
import TopbarButton from '../TopbarButton/TopbarButton';
import styles from './Topbar.module.css';

const Topbar = () => {
  const { state, dispatch } = useContext(AuthContext);

  const onSignOut = () => {
    auth.signOut().then(() => {
      dispatch({ type: 'logout' });
      router.push('/');
    });
  };

  const onSignIn = () => {
    router.push('/sign-in');
  };

  const onSignUp = () => {
    router.push('/sign-up');
  };

  const onAddHotel = () => {
    router.push('/add-hotel');
  };

  const onSearch = () => {
    router.push('/hotels');
  };
  const onReservations = () => {
    router.push('/reservations');
  };

  const onProfile = () => {
    router.push('/profile');
  };

  const onRequests = () => {
    router.push('/requests');
  };

  const onProperties = () => {
    router.push('/owner-hotels');
  };

  return (
    <div className={styles.topbar}>
      <Link href="/">
        <h2>{'Unde Dorm'}</h2>
      </Link>
      <div>
        {state.isUserLoggedIn && (
          <TopbarButton onClick={onSearch} title={'Search'} />
        )}
        {state.isUserLoggedIn && (
          <TopbarButton onClick={onReservations} title={'Reservations'} />
        )}
        {state.user?.isOwner && (
          <TopbarButton title={'Add hotel'} onClick={onAddHotel} />
        )}
        {state.isUserLoggedIn && (
          <TopbarButton title={'Requests'} onClick={onRequests} />
        )}
        {state.user?.isOwner && (
          <TopbarButton title={'Properties'} onClick={onProperties} />
        )}
        {state.isUserLoggedIn ? (
          <TopbarButton title={'Profile'} onClick={onProfile} />
        ) : (
          <TopbarButton title={'Sign In'} onClick={onSignIn} />
        )}
        {state.isUserLoggedIn ? (
          <TopbarButton title={'Sign Out'} onClick={onSignOut} />
        ) : (
          <TopbarButton title={'Sign Up'} onClick={onSignUp} />
        )}
      </div>
    </div>
  );
};

export default Topbar;
