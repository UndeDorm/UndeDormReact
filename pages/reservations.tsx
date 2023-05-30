import Head from 'next/head';
import { useRouter } from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../src/providers/auth/AuthProvider';
import styles from '../styles/Requests.module.css';
import { Hotel, ReservationRequest, Room } from '../src/utils/types';
import {
  editReservationRequest,
  getHotels,
  getReservationRequestsByOwner,
  getReservationRequestsByUser,
  getRooms,
} from '../src/firebase/database';
import { deleteDoc, doc } from 'firebase/firestore';
import { firebaseDb } from '../src/firebase/firebase';

export default function Profile() {
  const { state } = useContext(AuthContext);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDataReady, setIsDataReady] = useState<boolean>(false); // New state to track if data is ready

  const myReservations = useRef<ReservationRequest[]>([]);
  const roomsData = useRef<Room[]>([]);
  const hotelsData = useRef<Hotel[]>([]);

  useEffect(() => {
    if (!state.isUserLoggedIn) {
      console.log('You are not logged in!');
      router.push('/');
    } else {
      getReservationRequestsByUser(state.user?.id ?? '')
        .then((data) => {
          myReservations.current = data ?? [];
          if (myReservations.current) {
            Promise.all([getRooms(), getHotels()]) // Fetch rooms and hotels simultaneously
              .then(([rooms, hotels]) => {
                roomsData.current = rooms ?? [];
                hotelsData.current = hotels ?? [];
                setIsDataReady(true); // Data is ready, update the state
              })
              .catch((error) => {
                console.error('Error getting rooms and hotels:', error);
              })
              .finally(() => setIsLoading(false));
          } else {
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error('Error getting reservation requests:', error);
          setIsLoading(false);
        });
    }
  }, [router, state]);

  const convertMillisecondsToDate = (milliseconds: number) => {
    const dateObject = new Date(milliseconds);
    return dateObject.toLocaleString().split(',')[0];
  };

  const renderMyReservations = () => {
    if (isLoading) {
      return <p>Loading...</p>;
    }

    if (!isDataReady) {
      return <p>Waiting for data...</p>;
    }
    return (
      <>
        {myReservations.current.map((request) => {
          const room = roomsData.current.find(
            (room) => room.id === request.roomId
          );
          const hotel = hotelsData.current.find(
            (hotel) => hotel.id === room?.hotelId
          );

          if (!room || !hotel) {
            // Data not available yet, return null or a placeholder if desired
            return null;
          }

          const onClick = () => {
            router.push(`/request/${request.id}`);
          };

          return (
            <div key={request.id} className={styles.card} onClick={onClick}>
              <h3>
                {hotel.name}: {room.name}
              </h3>
              <p>📅Arrival: {convertMillisecondsToDate(request.startDate)}</p>
              <p>📅Departure: {convertMillisecondsToDate(request.endDate)}</p>
              <p>📍Location: {hotel.location}</p>
              {request.requestStatus === 'accepted' ? (
                <>
                  <p className={styles.greenText}>
                    Status: {request.requestStatus}
                  </p>
                </>
              ) : request.requestStatus === 'pending' ? (
                <>
                  <p className={styles.highlight}>
                    Status: {request.requestStatus}
                  </p>
                </>
              ) : (
                <>
                  <p className={styles.redText}>
                    Status: {request.requestStatus}
                  </p>
                </>
              )}
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
        <h1 className={styles.title}>Reservations</h1>
        {isLoading ? <p>Loading...</p> : <>{renderMyReservations()}</>}
      </main>
    </div>
  );
}
