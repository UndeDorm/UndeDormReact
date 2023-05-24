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
import { firebaseDb, storage } from '../../../src/firebase/firebase';
import { AuthContext } from '../../../src/providers/auth/AuthProvider';
import { Room } from '../../../src/utils/types';
import styles from '../../../styles/Home.module.css';
import { error } from 'console';
import { getDownloadURL, ref } from 'firebase/storage';

export default function ModifyRoom({ id }: { id: string }) {
  const { state } = useContext(AuthContext);

  const [hotelId, setHotelId] = useState<string>();
  const router = useRouter();
  const roomData = useRef<Room>();
  const imageURLs = useRef<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!state.isUserLoggedIn) {
      console.log('You are not logged in!');
      router.push('/');
      return;
    } else {
      getRoom(id)
        .then((data) => {
          roomData.current = data;
          if (roomData.current?.images && roomData.current?.images.length > 0) {
            const imageUrlsPromises = roomData.current?.images.map((imageId) => {
              const imageRef = ref(storage, `rooms/${id}/${imageId}`);
              return getDownloadURL(imageRef);
            });
    
            Promise.all(imageUrlsPromises)
              .then((imageUrls) => {
                imageURLs.current = imageUrls;
                setIsLoading(false);
              })
              .catch((error) => {
                console.error('Error getting image URLs', error);
                setIsLoading(false);
              })
          } else {
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error('Error getting room', error);
          setIsLoading(false);
        });
    }
  }, [id, state, router, hotelId]);

  const handleRequest = () => {
    router.push(`/request/create-request/${id}`);
  };

  const renderPage = () => {
    const handlePreviousImage = () => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? imageURLs.current.length - 1 : prevIndex - 1
      );
    };
  
    const handleNextImage = () => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === imageURLs.current.length - 1 ? 0 : prevIndex + 1
      );
    };

    return (
      <>
        <h1>{'Room name'}</h1>
        <h2>{roomData.current?.name}</h2>

        <h2>
          {'Room number of beds: '}
          {roomData.current?.beds}
        </h2>

        <h2>
          {'Price per night: '}
          {roomData.current?.pricePerNight}
        </h2>

        <h2>
          {'Room benefits: '}
          {roomData.current?.benefits}
        </h2>

        <div className={styles.imageContainer}>
          <button className={styles.previousButton} onClick={handlePreviousImage}>
            Previous
          </button>
          <img
            className={styles.image}
            src={imageURLs.current[currentImageIndex]}
          />
          <button className={styles.nextButton} onClick={handleNextImage}>
            Next
          </button>
        </div>
        <button className={styles.card} onClick={handleRequest}>
          Make reservation
        </button>
      </>
    );
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Modify Room</title>
        <meta name="description" content="View Room" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <>
          <h1 className={styles.title}>{'Room'}</h1>
          {isLoading ? (
            <h1 className={styles.title}>{'Loading...'}</h1>
          ) : (
            renderPage()
          )}
        </>
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
