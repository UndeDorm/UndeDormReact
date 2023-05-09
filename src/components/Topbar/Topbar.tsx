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

  return (
    <div className={styles.topbar}>
      <Link href="/">
        <h2>{'Unde Dorm'}</h2>
      </Link>
      <div>
        <TopbarButton onClick={onSearch} title={'Cauta'} />
        <TopbarButton onClick={onReservations} title={'Rezervari'} />
        {state.user?.isOwner && (
          <TopbarButton title={'Adauga hotel'} onClick={onAddHotel} />
        )}
        {state.user?.isOwner && (
          <TopbarButton title={'Cereri'} onClick={onRequests} />
        )}
        {state.isUserLoggedIn ? (
          <TopbarButton title={'Profil'} onClick={onProfile} />
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
