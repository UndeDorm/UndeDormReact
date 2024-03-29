import { ChangeEvent, FormEvent, useContext, useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import { useRouter } from 'next/router';
import { confirmThePasswordReset } from '../src/firebase/firebase';
import { AuthContext } from '../src/providers/auth/AuthProvider';

const defaultFormFields = {
  password: '',
  confirmPassword: '',
};

export default function ResetPassword() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [formFields, setFormFields] = useState(defaultFormFields);
  const router = useRouter();
  const { oobCode } = router.query;
  const { state } = useContext(AuthContext);

  useEffect(() => {
    if (state.isUserLoggedIn) {
      console.log('You are currently logged in!');
      router.push('/');
    }

    if (!oobCode) {
      console.log('No oobCode found!');
      router.push('/');
    }
  }, [state, router, oobCode]);

  const resetFormFields = () => {
    return setFormFields(defaultFormFields);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formFields.password !== formFields.confirmPassword) {
      alert('Password do not match');
      return;
    }

    if (formFields.password.length < 6) {
      alert('Please enter a password with at least 6 characters.');
      return;
    }

    confirmThePasswordReset(oobCode as string, formFields.confirmPassword)
      .then(() => {
        setSuccessMessage(true);
        resetFormFields();
      })
      .catch((error) => {
        if (error.code === 'auth/invalid-action-code') {
          alert(
            'The action code is invalid. This can happen if the code is malformed, expired, or has already been used.'
          );
        }
        console.log(error.message);
      });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormFields({ ...formFields, [name]: value });
  };

  if (state.isUserLoggedIn || !oobCode) {
    return;
  }

  return (
    <div>
      <main className={styles.main}>
        {successMessage ? (
          <>
            <h3 className={styles.title}>{'Your password has been reset!'}</h3>
            <button
              onClick={() => router.push('/sign-in')}
              className={styles.card}
            >
              {'Sign In'}
            </button>
          </>
        ) : (
          <div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div>
                <input
                  className={styles.input}
                  type="password"
                  name="password"
                  value={formFields.password}
                  onChange={handleChange}
                  placeholder="New Password"
                  required
                />
              </div>
              <div>
                <input
                  className={styles.input}
                  type="password"
                  name="confirmPassword"
                  value={formFields.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  required
                />
              </div>
              <div>
                <input type="submit" className={styles.input} />
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
