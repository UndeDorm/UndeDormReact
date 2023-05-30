import Head from 'next/head';
import { provider, auth, firebaseDb, storage } from '../src/firebase/firebase';
import styles from '../styles/Hotels.module.css';
import { useContext, useEffect, useRef, useState } from 'react';
import router from 'next/router';
import { BasicUser, Hotel } from '../src/utils/types';
import { addHotel } from '../src/firebase/database';
import { AuthContext } from '../src/providers/auth/AuthProvider';
import { collection, doc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import ImagePicker from '../src/components/ImagePicker/ImagePicker';

export default function AddHotelPage() {
  const { state } = useContext(AuthContext);
  const name = useRef<string>('');
  const location = useRef<string>('');
  const description = useRef<string>('');
  const uniqueImages = useRef<string[]>([]);
  const imagesUploaded = useRef<File[]>([]);

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
    const myCollection = collection(firebaseDb, 'hotels');
    const myDocRef = doc(myCollection);
    const hotelId = myDocRef.id;

    imagesUploaded.current.forEach((image) => {
      const uniqueId = image.name + Date.now().toString();
      uniqueImages.current.push(uniqueId);
      const imageRef = ref(storage, `hotels/${hotelId}/${uniqueId}`);
      uploadBytes(imageRef, image);
    });

    const hotel: Hotel = {
      id: hotelId,
      name: name.current,
      location: location.current,
      description: description.current,
      images: uniqueImages.current,
      ownerId: state.user?.id ?? '',
    };

    if (!hotel.name || !hotel.location || !hotel.description) {
      alert('Please fill in all the fields');
      return;
    }

    const onSuccess = () => {
      alert('Hotel added successfully');
      router.push('/owner-hotels');
    };
    const onFailure = (error: any) => {
      alert('Error adding hotel');
      console.log(error);
    };

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
      <ImagePicker imagesUploadedRef={imagesUploaded} />
      <div className={styles.grid}>
        <button onClick={addHotelToDatabase} className={styles.card}>
          {'Add Hotel'}
        </button>
      </div>
    </main>
  );
}
