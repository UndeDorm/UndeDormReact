import { collection, doc, getDoc } from 'firebase/firestore';
import router from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { addRoom, getHotel } from '../../../src/firebase/database';
import { firebaseDb } from '../../../src/firebase/firebase';
import { AuthContext } from '../../../src/providers/auth/AuthProvider';
import { Hotel, Room } from '../../../src/utils/types';
import styles from '../../../styles/Home.module.css';

export default function AddRoomPage({ id }: { id: string }) {
  const { state } = useContext(AuthContext);
  const roomName = useRef<string>('');
  const noBeds = useRef<number>();
  const price = useRef<number>();
  const benefits = useRef<string>();
  const hotelOwnerId = useRef<string>();
  const hotelData = useRef<Hotel>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!state.isUserLoggedIn) {
      console.log('You are not logged in!');
      router.push('/');
      return;
    } else {
      getHotel(id)
        .then((data) => {
          hotelData.current = data;
          hotelOwnerId.current = data.ownerId;
        })
        .catch((error) => {
          console.log('Error getting hotel:', error);
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, state.isUserLoggedIn]);

  const addRoomToDatabase = () => {
    const myCollection = collection(firebaseDb, 'rooms');
    const myDocRef = doc(myCollection);
    const room: Room = {
      id: myDocRef.id,
      name: roomName.current,
      benefits: benefits.current ?? '',
      pricePerNight: price.current ?? 0,
      beds: noBeds.current ?? 0,
      hotelId: id,
    };

    const onSuccess = () => {
      console.log('Room added successfully');
      router.back();
    };
    const onFailure = (error: any) => {
      console.log(error);
      alert('Error adding room!');
    };

    addRoom({ room, onSuccess, onFailure });
  };

  const renderPage = () => {
    return (
      <>
        <h1 className={styles.title}>Add a room</h1>
        <input
          placeholder="Name"
          onChange={(e) => (roomName.current = e.target.value)}
          className={styles.input}
        />
        <input
          placeholder="Number of beds"
          onChange={(e) => (noBeds.current = parseInt(e.target.value))}
          className={styles.input}
        />
        <input
          placeholder="Price per night"
          className={styles.input}
          onChange={(e) => (price.current = parseInt(e.target.value))}
        />
        <input
          placeholder="Benefits"
          className={styles.input}
          onChange={(e) => (benefits.current = e.target.value)}
        />
        <button className={styles.card} onClick={addRoomToDatabase}>
          Add Room
        </button>
      </>
    );
  };

  return (
    <main className={styles.main}>
      {!isLoading ? (
        renderPage()
      ) : (
        <h1 className={styles.title}>{'Loading...'}</h1>
      )}
    </main>
  );
}

export async function getServerSideProps(context: any) {
  const { id } = context.query;
  return {
    props: {
      id: id,
    },
  };
}
