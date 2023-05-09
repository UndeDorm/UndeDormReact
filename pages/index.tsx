import Head from 'next/head';
import { auth } from '../src/firebase/firebase';
import styles from '../styles/Home.module.css';
import { useContext } from 'react';
import router from 'next/router';
import Link from 'next/link';
import { AuthContext } from '../src/providers/auth/AuthProvider';

export default function Home() {
  const {
    dispatch,
    state: { isUserLoggedIn, user },
  } = useContext(AuthContext);

  const onSignIn = () => {
    router.push('/sign-in');
  };

  const onSignUp = () => {
    router.push('/sign-up');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Unde Dorm</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {!user && isUserLoggedIn ? (
          <h1 className={styles.title}>{'Loading...'}</h1>
        ) : (
          <>
            {
              <h1 className={styles.title}>
                {user?.firstName
                  ? `Hello, ${user.firstName}! Welcome to `
                  : 'Welcome to '}
                <Link href="">{'UndeDorm'}</Link>
              </h1>
            }

            {user && isUserLoggedIn && (
              <div className={styles.grid}>
                <Link href="/profile" className={styles.card}>
                  <h2>{'Profil'} &rarr;</h2>
                </Link>

                <Link href="/reservations" className={styles.card}>
                  <h2>{'Rezervari'} &rarr;</h2>
                </Link>

                <Link href="/hotels" className={styles.card}>
                  <h2>{'Cauta hotel'} &rarr;</h2>
                </Link>
              </div>
            )}

            <div className={styles.grid}>
              {!isUserLoggedIn && (
                <button onClick={onSignIn} className={styles.card}>
                  <p>Sign In</p>
                </button>
              )}
              {!isUserLoggedIn && (
                <button onClick={onSignUp} className={styles.card}>
                  <p>Sign Up</p>
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
