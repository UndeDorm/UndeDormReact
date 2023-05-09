import { FormEvent, useContext, useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import { passwordReset } from '../src/firebase/firebase';
import { AuthContext } from '../src/providers/auth/AuthProvider';
import router from 'next/router';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState(false);
  const { state } = useContext(AuthContext);

  useEffect(() => {
    if (state.isUserLoggedIn) {
      console.log('You are currently logged in!');
      router.push('/');
      return;
    }
  }, [state]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await passwordReset(email);
      setEmailMessage(true);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        alert('User not found, try again!');
        setEmail('');
      }
    }
  };

  // For a second in the beginning, isUserLoggedIn will be undefined
  // This fixes a flicker that makes the page render for a fraction of a second before redirecting
  if (!!state.isUserLoggedIn) {
    return;
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {emailMessage ? (
          <h3 className={styles.title}>
            {'The Email has been sent. Check your Inbox!'}
          </h3>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              className={styles.input}
              type="email"
              name="email"
              placeholder="name@email.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div>
              <button type="submit" className={styles.card}>
                {'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
