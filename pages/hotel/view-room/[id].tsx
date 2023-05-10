import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import Head from 'next/head';
import router, { useRouter } from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  addRoom,
  editRoom,
  getHotel,
  getRoom,
} from '../../../src/firebase/database';
import { firebaseDb } from '../../../src/firebase/firebase';
import { AuthContext } from '../../../src/providers/auth/AuthProvider';
import { Room } from '../../../src/utils/types';
import styles from '../../../styles/Home.module.css';

export default function ModifyRoom({ id }: { id: string }) {
  const { state } = useContext(AuthContext);
  const [roomName, setRoomName] = useState<string>();
  const [roomnoBeds, setRoomnoBeds] = useState<number>();
  const [roomprice, setRoomprice] = useState<number>();
  const [roomBenefits, setRoomBenefits] = useState<string>();
  const [hotelId, setHotelId] = useState<string>();
  const [hotelOwnerId, setHotelOwnerId] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    if (!state.isUserLoggedIn) {
      console.log('You are not logged in!');
      router.push('/');
      return;
    }

    async function fetchRoom() {
      const roomRef = doc(firebaseDb, 'rooms', id);
      const roomSnapshot = await getDoc(roomRef);

      if (roomSnapshot.exists()) {
        const roomData = roomSnapshot.data();
        setHotelId(roomData?.hotelId);
        setRoomName(roomData?.name);
        setRoomnoBeds(roomData?.beds);
        setRoomprice(roomData?.pricePerNight);
        setRoomBenefits(roomData?.benefits);
      } else {
        console.log('Room not found!');
        router.push('/');
      }
    }
    fetchRoom();

    const fetchHotels = async () => {
      const hotelsRef = collection(firebaseDb, 'hotels');
      const hotelsSnapshot = await getDocs(hotelsRef);
      const hotelsData = hotelsSnapshot.docs
        .map((doc) => doc.data())
        .filter(
          (data) =>
            data.id !== undefined && data.id !== null && data.id === hotelId
        );

      const hotelOwnerId = hotelsData.map((data) => data.ownerId)[0];

      setHotelOwnerId(hotelOwnerId);
    };

    fetchHotels();
  }, [id, state, router, hotelId]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Modify Room</title>
        <meta name="description" content="Modify Room" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {
          <>
            {state.user?.isOwner && state.user?.id === hotelOwnerId ? (
              <main className={styles.main}>
                <h1>{'Room name'}</h1>
                <h2>{roomName}</h2>

                <h2>
                  {'Room number of beds: '}
                  {roomnoBeds}
                </h2>

                <h2>
                  {'Price per night: '}
                  {roomprice}
                </h2>

                <h2>
                  {'Room benefits: '}
                  {roomBenefits}
                </h2>
              </main>
            ) : (
              <main className={styles.main}>
                <h1>{'Room name'}</h1>
                <h2>{roomName}</h2>

                <h2>
                  {'Room number of beds: '}
                  {roomnoBeds}
                </h2>

                <h2>
                  {'Price per night: '}
                  {roomprice}
                </h2>

                <h2>
                  {'Room benefits: '}
                  {roomBenefits}
                </h2>
              </main>
            )}
          </>
        }
      </main>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const { id } = context.query;
  return {
    props: {
      id,
    },
  };
}
