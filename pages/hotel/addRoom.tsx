import Head from 'next/head';
import { provider, auth, firebaseDb } from '../src/firebase/firebase';
import styles from '../styles/Hotels.module.css';
import { useContext, useEffect, useRef } from 'react';
import router from 'next/router';
import { BasicUser, Hotel } from '../src/utils/types';
import { addHotel } from '../src/firebase/database';
import { AuthContext } from '../src/providers/auth/AuthProvider';
import { collection, doc } from 'firebase/firestore';

export default function AddHotelPage() {
  const { state } = useContext(AuthContext);
  const name = useRef<string>('');
  const location = useRef<string>('');
  const description = useRef<string>('');
  const images = useRef<string[]>(['']);
  const myCollection = collection(firebaseDb, 'hotels');
  const myDocRef = doc(myCollection);

  useEffect(() => {
    if (!state.isUserLoggedIn) {
      console.log('You are not logged in!');
      router.push('/');
      return;
    } else {
      if (!state.user?.isOwner) {
        console.log('You are not an owner!');
        router.push('/');
        return;
      }
    }
  }, [state]);

  const addHotelToDatabase = () => {
    const hotel: Hotel = {
      id: myDocRef.id,
      name: name.current,
      location: location.current,
      description: description.current,
      images: images.current,
      ownerId: state.user?.id ?? '',
    };

    const onSuccess = () => {
      console.log('Hotel added successfully');
      router.push('/');
    };
    const onFailure = (error: any) => {};

    addHotel({ hotel, onSuccess, onFailure });
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Add a hotel</h1>
      <input
        placeholder="Name"
        onChange={(e) => (name.current = e.target.value)}
        className={styles.input}
      />
      <input
        placeholder="Location"
        onChange={(e) => (location.current = e.target.value)}
        className={styles.input}
      />
      <input
        placeholder="Description"
        className={styles.input}
        onChange={(e) => (description.current = e.target.value)}
      />
      <input
        placeholder="Image URL"
        className={styles.input}
        onChange={(e) => (images.current = [...images.current, e.target.value])}
      />
      <button onClick={addHotelToDatabase} className={styles.button}>
        Add Hotel
      </button>
    </main>
  );
}
