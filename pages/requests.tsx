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

export default function Profile() {
  const { state } = useContext(AuthContext);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDataReady, setIsDataReady] = useState<boolean>(false); // New state to track if data is ready

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

  const renderSentRequests = () => {
    if (isLoading) {
      return <p>Loading...</p>;
    }

    if (!isDataReady) {
      return <p>Waiting for data...</p>;
    }
    return (
      <>
        {sentRequestsData.current.map((request) => {
          const room = roomsData.current.find((room) => room.id === request.roomId);
          const hotel = hotelsData.current.find((hotel) => hotel.id === room?.hotelId);
  
          if (!room || !hotel) {
            // Data not available yet, return null or a placeholder if desired
            return null;
          }
  
          return (
            <div key={request.id} className={styles.card}>
              <h3>{hotel.name}: {room.name}</h3>
              <p>📅Arrival: {convertMillisecondsToDate(request.startDate)}</p>
              <p>📅Departure: {convertMillisecondsToDate(request.endDate)}</p>
              <p>📍Location: {hotel.location}</p>
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
    if (isLoading) {
      return <p>Loading...</p>;
    }

    if (!isDataReady) {
      return <p>Waiting for data...</p>;
    }
    return (
      <>
        {receivedRequestsData.current.map((request) => {
          const room = roomsData.current.find((room) => room.id === request.roomId);
          const hotel = hotelsData.current.find((hotel) => hotel.id === room?.hotelId);
  
          if (!room || !hotel) {
            // Data not available yet, return null or a placeholder if desired
            return null;
          }
  
          return (
            <div key={request.id} className={styles.card}>
              <h3>{hotel.name}: {room.name}</h3>
              <p>📅Arrival: {convertMillisecondsToDate(request.startDate)}</p>
              <p>📅Departure: {convertMillisecondsToDate(request.endDate)}</p>
              <p>📍Location: {hotel.location}</p>
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
      router.reload();
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
      router.reload();
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
      router.reload();
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
