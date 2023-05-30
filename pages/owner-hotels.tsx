import Head from 'next/head';
import styles from '../styles/Hotels.module.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../src/providers/auth/AuthProvider';
import { useRouter } from 'next/router';
import { firebaseDb, storage, storageRef } from '../src/firebase/firebase';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { getOwnedHotels } from '../src/firebase/database';
import { Hotel } from '../src/utils/types';

export default function HotelList() {
  const { state } = useContext(AuthContext);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const hotelsData = useRef<Hotel[]>([]);

  useEffect(() => {
    if (!state.isUserLoggedIn) {
      console.log('You are not logged in!');
      router.push('/');
    } else if (!state.user?.isOwner) {
      console.log('You are not an owner!');
      router.push('/');
      return;
    } else if (state.isUserLoggedIn) {
      getOwnedHotels(state.user?.id)
        .then((data) => {
          hotelsData.current = data ?? [];
        })
        .catch((error) => {
          console.error('Error getting hotels:', error);
        })
        .finally(() => setIsLoading(false));
    }
  }, [state, router]);

  const handleDelete = async (hotelId: string) => {
    try {
      deleteDoc(doc(firebaseDb, 'hotels', hotelId))
        .then(() => {
          router.reload();
          console.log('Hotel deleted successfully!');
          hotelsData.current = hotelsData.current.filter(
            (hotel) => hotel.id !== hotelId
          );
        })
        .catch((error) => {
          return Promise.reject(error);
        });
    } catch (error) {
      console.error('Error deleting hotel:', error);
    }
  };

  const handleModify = async (hotelId: string) => {
    try {
      router.push('/hotel/' + hotelId);
    } catch (error) {
      console.error('Error modifying hotel:', error);
    }
  };

  const renderHotels = () => {
    return (
      <>
        {hotelsData.current.map((hotel) => {
          return (
            <div
              key={hotel.id}
              className={styles.card + ' ' + styles.row}
              onClick={() => handleModify(hotel.id)}
            >
              <div>
                <h3>{hotel.name}</h3>
                <p>{hotel.description}</p>
                <p>📍 {hotel.location}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(hotel.id);
                }}
                className={styles.deleteButton}
              >
                {'Delete'}
              </button>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Unde Dorm</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>{'Owned hotels'}</h1>
        {isLoading ? (
          <h1 className={styles.title}>{'Loading...'}</h1>
        ) : (
          renderHotels()
        )}
      </main>
    </div>
  );
}
