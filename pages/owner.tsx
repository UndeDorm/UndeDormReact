import styles from '../styles/Home.module.css';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../src/providers/auth/AuthProvider';
import Link from 'next/link';
import { upgradeToOwner } from '../src/firebase/database';
import router from 'next/router';

export default function BecomeOwner() {
  const { state, dispatch } = useContext(AuthContext);

  useEffect(() => {
    if (!state.isUserLoggedIn) {
      console.log('You are not logged in!');
      router.push('/');
      return;
    }
  }, [state]);

  const onClick = () => {
    upgradeToOwner(state.user!.id)
      .then(() => {
        console.log('You are now an owner!');
        dispatch({ type: 'become-owner' });
      })
      .catch((error) => {
        alert('Something went wrong!');
        console.log(error.message);
      });
  };

  if (!state.isUserLoggedIn) {
    return;
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {state.user!.isOwner && (
          <div className={styles.grid}>
            <h1 className={styles.title}>{'You already are an owner'}</h1>
            <Link rel="icon" href="/" className={styles.card}>
              <h2>{'Back '}&rarr;</h2>
            </Link>
          </div>
        )}
        {state.isUserLoggedIn && !state.user?.isOwner && (
          <button onClick={onClick} className={styles.card}>
            <p>{'Click here to become an owner'}</p>
          </button>
        )}
      </main>
    </div>
  );
}
