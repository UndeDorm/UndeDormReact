import { collection, doc, getDoc } from 'firebase/firestore';
import router from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  addReservationRequest,
  addRoom,
  getHotel,
  getReservationRequestsByRoom,
  getRoom,
} from '../../../src/firebase/database';
import { firebaseDb } from '../../../src/firebase/firebase';
import { AuthContext } from '../../../src/providers/auth/AuthProvider';
import { Hotel, ReservationRequest, Room } from '../../../src/utils/types';
import styles from '../../../styles/Home.module.css';
import { get } from 'http';

export default function AddRoomPage({ id }: { id: string }) {
  const { state } = useContext(AuthContext);
  const arrivalDate = useRef<Date>(new Date());
  const departureDate = useRef<Date>(new Date());
  const hotelOwnerId = useRef<string>();
  const hotelData = useRef<Hotel>();
  const hotelId = useRef<string>();
  const requests = useRef<ReservationRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!state.isUserLoggedIn) {
      console.log('You are not logged in!');
      router.push('/');
      return;
    } else {
      getRoom(id)
        .then((data) => {
          hotelId.current = data.hotelId;
          if (hotelId.current !== undefined) {
            getHotel(hotelId.current)
              .then((data) => {
                hotelData.current = data;
                hotelOwnerId.current = data.ownerId;
              })
              .catch((error) => {
                console.log('Error getting hotel:', error);
              })
              .finally(() => setIsLoading(false));
          } else {
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.log('Error getting hotel:', error);
          setIsLoading(false);
        });
    }
  }, [id, state.isUserLoggedIn]);

  const createRequest = async () => {
    // verify that arrival date is before departure date
    if (arrivalDate.current.getTime() > departureDate.current.getTime()) {
      alert('Arrival date must be before departure date!');
      return;
    }
    // verify that arrival date is not in the past
    if (arrivalDate.current.getTime() < new Date().getTime()) {
      alert('Arrival date must be in the future!');
      return;
    }

    // verify availability
    const existingRequests = await getReservationRequestsByRoom(id);
    requests.current = existingRequests ?? [];
    console.log(requests.current);
    console.log(existingRequests);
    if (existingRequests !== undefined) {
      let isPeriodAvailable = true;
      requests.current.forEach((request) => {
        if (
          request.startDate <= arrivalDate.current.getTime() &&
          request.endDate >= departureDate.current.getTime()
        ) {
          isPeriodAvailable = false;
          return;
        }
        if (
          request.startDate >= arrivalDate.current.getTime() &&
          request.startDate < departureDate.current.getTime()
        ) {
          isPeriodAvailable = false;
          return;
        }
        if (
          request.endDate > arrivalDate.current.getTime() &&
          request.endDate <= departureDate.current.getTime()
        ) {
          isPeriodAvailable = false;
          return;
        }
      });

      if (!isPeriodAvailable) {
        alert('Period is not available!');
        return;
      }
    }

    const myCollection = collection(firebaseDb, 'reservationRequests');
    const myDocRef = doc(myCollection);
    const reservationRequest: ReservationRequest = {
      id: myDocRef.id,
      startDate: arrivalDate.current.getTime(),
      endDate: departureDate.current.getTime(),
      roomId: id,
      ownerId: hotelOwnerId.current ?? '',
      userId: state.user?.id ?? '',
      requestStatus: 'pending',
    };

    const onSuccess = () => {
      console.log('Request added successfully');
      router.back();
    };
    const onFailure = (error: any) => {
      console.log(error);
      alert('Error adding request!');
    };

    addReservationRequest({ reservationRequest, onSuccess, onFailure });
  };

  const renderPage = () => {
    return (
      <>
        <h1 className={styles.title}>Create a request</h1>
        <h2>Arrival date:</h2>
        <input
          type="date"
          placeholder="Date Of Birth"
          className={styles.input}
          onChange={(e) => (arrivalDate.current = new Date(e.target.value))}
        />
        <h2>Departure date:</h2>
        <input
          type="date"
          placeholder="Date Of Birth"
          className={styles.input}
          onChange={(e) => (departureDate.current = new Date(e.target.value))}
        />
        <button className={styles.card} onClick={createRequest}>
          Send Request
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
