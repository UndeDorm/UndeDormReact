import Head from 'next/head';
import { useRouter } from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../src/providers/auth/AuthProvider';
import styles from '../styles/Home.module.css';
import { Hotel, ReservationRequest, Room } from '../src/utils/types';
import {
  editReservationRequest,
  getHotels,
  getReservationRequestsByOwner,
  getReservationRequestsByUser,
  getRooms,
} from '../src/firebase/database';
import { stat } from 'fs';
import { request } from 'http';

export default function Profile() {
  const { state } = useContext(AuthContext);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const sentRequestsData = useRef<ReservationRequest[]>([]);
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
            receivedRequestsData.current =
              data?.filter((request) => request.requestStatus === 'pending') ??
              [];
          })
          .catch((error) => {
            console.error('Error getting reservation requests:', error);
          });
      }
      getReservationRequestsByUser(state.user?.id ?? '')
        .then((data) => {
          sentRequestsData.current =
            data?.filter((request) => request.requestStatus === 'pending') ??
            [];
          if (sentRequestsData.current) {
            getRooms()
              .then((data) => {
                roomsData.current = data ?? [];
              })
              .catch((error) => {
                console.error('Error getting rooms:', error);
              })
              .finally(() => setIsLoading(false));

            getHotels()
              .then((data) => {
                hotelsData.current = data ?? [];
              })
              .catch((error) => {
                console.error('Error getting hotels:', error);
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

  const renderSentRequests = () => {
    return (
      <>
        {sentRequestsData.current.map((request) => {
          return (
            <div key={request.id} className={styles.card}>
              <h3>
                {
                  hotelsData.current.find(
                    (hotel) =>
                      hotel.id ===
                      roomsData.current.find(
                        (room) => room.id === request.roomId
                      )?.hotelId
                  )?.name
                }
                {': '}
                {
                  roomsData.current.find((room) => room.id === request.roomId)
                    ?.name
                }
              </h3>
              <p>📅Arrival: {convertMillisecondsToDate(request.startDate)}</p>
              <p>📅Departure: {convertMillisecondsToDate(request.endDate)}</p>
              <p>
                📍Location:{' '}
                {
                  hotelsData.current.find(
                    (hotel) =>
                      hotel.id ===
                      roomsData.current.find(
                        (room) => room.id === request.roomId
                      )?.hotelId
                  )?.location
                }
              </p>
              <p>Status: {request.requestStatus}</p>
              <button onClick={() => handleCancelRequest(request.id)}>
                Cancel
              </button>
            </div>
          );
        })}
      </>
    );
  };

  const renderReceivedRequests = () => {
    return (
      <>
        {receivedRequestsData.current.map((request) => {
          return (
            <div key={request.id} className={styles.card}>
              <h3>
                {
                  hotelsData.current.find(
                    (hotel) =>
                      hotel.id ===
                      roomsData.current.find(
                        (room) => room.id === request.roomId
                      )?.hotelId
                  )?.name
                }
                {': '}
                {
                  roomsData.current.find((room) => room.id === request.roomId)
                    ?.name
                }
              </h3>
              <p></p>
              <p>📅Arrival: {convertMillisecondsToDate(request.startDate)}</p>
              <p>📅Departure: {convertMillisecondsToDate(request.endDate)}</p>
              <p>
                📍Location:{' '}
                {
                  hotelsData.current.find(
                    (hotel) =>
                      hotel.id ===
                      roomsData.current.find(
                        (room) => room.id === request.roomId
                      )?.hotelId
                  )?.location
                }
              </p>
              <p>Status: {request.requestStatus}</p>
              <button onClick={() => handleAcceptRequest(request.id)}>
                Accept
              </button>
              <button onClick={() => handleDeclineRequest(request.id)}>
                Decline
              </button>
            </div>
          );
        })}
      </>
    );
  };

  const handleCancelRequest = async (reqId: any) => {
    const onSuccess = () => {
      alert('Reservation cancelled!');
      router.back();
    };
    const onFailure = (error: any) => {
      alert('Error cancelling reservation!');
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

  const handleAcceptRequest = async (reqId: any) => {
    const onSuccess = () => {
      alert('Reservation accepted!');
      router.back();
    };
    const onFailure = (error: any) => {
      alert('Error accepting reservation!');
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
      alert('Reservation declined!');
      router.back();
    };
    const onFailure = (error: any) => {
      alert('Error declining reservation!');
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

  return (
    <div className={styles.container}>
      <Head>
        <title>Unde Dorm</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Requests</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {state.user?.isOwner ? (
              <>
                <h1>Sent requests:</h1>
                {renderSentRequests()}
                <h1>Received requests:</h1>
                {renderReceivedRequests()}
              </>
            ) : (
              renderSentRequests()
            )}
          </>
        )}
      </main>
    </div>
  );
}
