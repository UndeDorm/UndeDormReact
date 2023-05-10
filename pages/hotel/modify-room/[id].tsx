import { collection, doc, getDoc } from 'firebase/firestore';
import Head from 'next/head';
import router from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { addRoom, getHotel, getRoom } from '../../../src/firebase/database';
import { firebaseDb } from '../../../src/firebase/firebase';
import { AuthContext } from '../../../src/providers/auth/AuthProvider';
import { Room } from '../../../src/utils/types';
import styles from '../../../styles/Home.module.css';

export default function ModifyRoom({ id }: { id: string }) {
  const { state } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const roomDetails = useRef<Room>();
  const [hotelOwnerId, setHotelOwnerId] = useState<string>();

  useEffect(() => {
    if (!state.isUserLoggedIn) {
      console.log('You are not logged in!');
      router.push('/');
      return;
    }
    getRoom(id)
      .then((data) => {
        roomDetails.current = data;
        getHotel(data.hotelId)
          .then((hotelData) => {
            setHotelOwnerId(hotelData?.ownerId);
            console.log(hotelData);
          })
          .catch((error) => {
            Promise.reject(error);
          });
      })
      .catch((error) => {
        console.error('Error getting room:', error);
      })
      .finally(() => setIsLoading(false));
  }, [id, state.isUserLoggedIn]);

  if (!state.user?.isOwner || !(state.user?.id === hotelOwnerId)) {
    router.back();
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Modify Room</title>
        <meta name="description" content="Modify Room" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {isLoading ? (
          <h2>Loading...</h2>
        ) : (
          <>
            {state.user?.isOwner && state.user?.id === hotelOwnerId ? (
              <h2>you re the owner</h2>
            ) : (
              <h2>you re not the owner</h2>
            )}
          </>
        )}
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
