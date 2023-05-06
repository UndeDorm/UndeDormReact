import Head from 'next/head';
import { provider, auth, firebaseDb } from '../src/firebase/firebase';
import styles from '../styles/Hotels.module.css';
import { useContext, useEffect, useRef } from 'react';
import router from 'next/router';
import { BasicUser, Hotel } from '../src/utils/types';
import { addHotel } from '../src/firebase/database';
import { AuthContext } from '../src/providers/auth/AuthProvider';

export default function AddHotelPage() {
  const { state } = useContext(AuthContext);
  const name = useRef<string>('');
  const location = useRef<string>('');
  const description = useRef<string>('');
  const images = useRef<string[]>(['']);
  const ownerId = useRef<string>('');
  const id = useRef<string>('');

  if (!state.isUserLoggedIn && !state.isUserLoaded) {
    console.log('You are not logged in!');
    router.push('/');
    return;
  }

  const addHotelToDatabase = () => {
    const hotel: Hotel = {
      id: id.current,
      name: name.current,
      location: location.current,
      description: description.current,
      images: images.current,
      ownerId: ownerId.current,
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
        placeholder="id"
        onChange={(e) => (id.current = e.target.value)}
        className={styles.input}
      />
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
      <input
        placeholder="Owner ID"
        className={styles.input}
        onChange={(e) => (ownerId.current = e.target.value)}
      />
      <button onClick={addHotelToDatabase} className={styles.button}>
        Add Hotel
      </button>
    </main>
  );
}
