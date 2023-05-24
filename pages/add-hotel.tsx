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

export default function AddHotelPage() {
  const { state } = useContext(AuthContext);
  const name = useRef<string>('');
  const location = useRef<string>('');
  const description = useRef<string>('');
  const images = useRef<File[]>([]);
  const uniqueImages = useRef<string[]>([]);
  const [imageUpload, setImageUpload] = useState<File | null>(null);

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

  const addImage = () => {
    if (imageUpload == null) {
      alert("Please select an image!");
      return;
    }
    images.current.push(imageUpload);
    alert("Image uploaded successfully!");
  };

  const addHotelToDatabase = () => {
    const myCollection = collection(firebaseDb, 'hotels');
    const myDocRef = doc(myCollection);
    const hotelId = myDocRef.id;

    images.current.forEach((image) => {
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

    const onSuccess = () => {
      alert('Hotel added successfully');
      router.push('/owner-hotels');
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
        type="file"
        onChange={(e) => {
          setImageUpload(e.target.files?.[0] ?? null);
        }}
        className={styles.input}
      />
      <div className={styles.grid}>
        <button onClick={addImage} className={styles.card}>
          {'Upload Image'}
        </button>

        <button onClick={addHotelToDatabase} className={styles.card}>
          {'Add Hotel'}
        </button>
      </div>
    </main>
  );
}
