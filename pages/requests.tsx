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
  getRooms,
} from '../src/firebase/database';
import { deleteDoc, doc } from 'firebase/firestore';
import { firebaseDb } from '../src/firebase/firebase';

export default function Profile() {
  const { state } = useContext(AuthContext);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const receivedRequestsData = useRef<ReservationRequest[]>([]);
  const roomsData = useRef<Room[]>([]);
  const hotelsData = useRef<Hotel[]>([]);

  useEffect(() => {
    if (!state.isUserLoggedIn) {
      console.log('You are not logged in!');
      router.push('/');
    } else {
      if (state.user?.isOwner) {
        getReservationRequestsByOwner(state.user?.id ?? '')
          .then((data) => {
            receivedRequestsData.current = data ?? [];
            Promise.all([getRooms(), getHotels()]) // Fetch rooms and hotels simultaneously
              .then(([rooms, hotels]) => {
                roomsData.current = rooms ?? [];
                hotelsData.current = hotels ?? [];
              })
              .catch((error) => {
                console.error('Error getting rooms and hotels:', error);
              })
              .finally(() => {
                setIsLoading(false);
              });
          })
          .catch((error) => {
            console.error('Error getting reservation requests:', error);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    }
  }, [router, state]);

  const convertMillisecondsToDate = (milliseconds: number) => {
    const dateObject = new Date(milliseconds);
    return dateObject.toLocaleString().split(',')[0];
  };

  const handleAcceptRequest = async (reqId: any) => {
    const onSuccess = () => {
      console.log('Reservation accepted!');
      router.reload();
    };
    const onFailure = (error: any) => {
      console.log('Error accepting reservation!');
    };
    let newData = {};
    newData = { ...newData, requestStatus: 'accepted' };
    editReservationRequest({
      requestId: reqId,
      newData,
      onSuccess,
      onFailure,
    });
  };

  const handleDeclineRequest = async (reqId: any) => {
    const onSuccess = () => {
      console.log('Reservation declined!');
      router.reload();
    };
    const onFailure = (error: any) => {
      console.log('Error declining reservation!');
    };
    let newData = {};
    newData = { ...newData, requestStatus: 'declined' };
    editReservationRequest({
      requestId: reqId,
      newData,
      onSuccess,
      onFailure,
    });
  };

  const handleDeleteRequest = async (reqId: string) => {
    try {
      await deleteDoc(doc(firebaseDb, 'reservationRequests', reqId));
      await deleteDoc(doc(firebaseDb, 'reservations', reqId));
      console.log('Reservation request deleted successfully!');
      router.reload();
    } catch (error) {
      console.error('Error deleting reservation request:', error);
    }
  };

  const handleCancelRequest = async (reqId: any) => {
    const onSuccess = () => {
      console.log('Reservation cancelled!');
      router.reload();
    };
    const onFailure = (error: any) => {
      console.log('Error cancelling reservation!');
    };
    let newData = {};
    newData = { ...newData, requestStatus: 'cancelled' };
    editReservationRequest({
      requestId: reqId,
      newData,
      onSuccess,
      onFailure,
    });
  };

  const renderReceivedRequests = () => {
    if (isLoading) {
      return <p>{'Loading...'}</p>;
    }

    return (
      <>
        {receivedRequestsData.current.map((request) => {
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

          return (
            <div key={request.id} className={styles.card}>
              <h3>
                {hotel.name}: {room.name}
              </h3>
              <p>{`📅Arrival: ${convertMillisecondsToDate(
                request.startDate
              )}`}</p>
              <p>{`📅Departure: ${convertMillisecondsToDate(
                request.endDate
              )}`}</p>
              <p>{`📍Location: ${hotel.location}`}</p>
              {request.requestStatus === 'pending' ? (
                <>
                  <p className={styles.highlight}>
                    {`Status: ${request.requestStatus}`}
                  </p>
                  <button onClick={() => handleAcceptRequest(request.id)}>
                    {'Accept'}
                  </button>
                  <button onClick={() => handleDeclineRequest(request.id)}>
                    {'Decline'}
                  </button>
                </>
              ) : request.requestStatus === 'accepted' ? (
                <>
                  <p className={styles.greenText}>
                    Status: {request.requestStatus}
                  </p>
                  <button onClick={() => handleCancelRequest(request.id)}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <p className={styles.redText}>
                    {`Status: ${request.requestStatus}`}
                  </p>
                  <button onClick={() => handleDeleteRequest(request.id)}>
                    {'Delete'}
                  </button>
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
        <h1 className={styles.title}>{'Requests'}</h1>
        {isLoading ? (
          <p>{'Loading...'}</p>
        ) : (
          <>
            <h1>{'Received requests:'}</h1>
            {renderReceivedRequests()}
          </>
        )}
      </main>
    </div>
  );
}
