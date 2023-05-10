import { collection, doc, getDoc } from 'firebase/firestore';
import router from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { addRoom } from '../../../src/firebase/database';
import { firebaseDb } from '../../../src/firebase/firebase';
import { AuthContext } from '../../../src/providers/auth/AuthProvider';
import { Room } from '../../../src/utils/types';
import styles from '../../../styles/Home.module.css';

export default function AddRoomPage({ id }: { id: string }) {
  const { state } = useContext(AuthContext);
  const [hotelOwnerId, setHotelOwnerId] = useState<string>();
  const roomName = useRef<string>('');
  const myCollection = collection(firebaseDb, 'rooms');
  const myDocRef = doc(myCollection);
  const noBeds = useRef<number>();
  const price = useRef<number>();
  const benefits = useRef<string>();

  useEffect(() => {
    if (!state.isUserLoggedIn) {
      console.log('You are not logged in!');
      router.push('/');
      return;
    }

    async function fetchHotel() {
      const hotelRef = doc(firebaseDb, 'hotels', id);
      const hotelSnapshot = await getDoc(hotelRef);

      if (hotelSnapshot.exists()) {
        const hotelData = hotelSnapshot.data();
        setHotelOwnerId(hotelData?.ownerId);
        if (hotelOwnerId != null && hotelOwnerId !== state.user?.id) {
          console.log('You are not the owner of this hotel!');
          router.push('/');
        }
      } else {
        console.log('Hotel not found!');
        router.push('/');
      }
    }

    fetchHotel();
  }, [hotelOwnerId, id, state]);

  const addRoomToDatabase = () => {
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

  return (
    <main className={styles.main}>
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
