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
import Calendar from 'react-calendar';
import styles from '../../../styles/Requests.module.css';

export default function AddRoomPage({ id }: { id: string }) {
  const { state } = useContext(AuthContext);
  const hotelOwnerId = useRef<string>();
  const hotelData = useRef<Hotel>();
  const hotelId = useRef<string>();
  const roomName = useRef<string>();
  const requests = useRef<ReservationRequest[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!state.isUserLoggedIn) {
      console.log('You are not logged in!');
      router.push('/');
      return;
    } else {
      getRoom(id)
        .then((data) => {
          roomName.current = data.name;
          hotelId.current = data.hotelId;
          if (hotelId.current !== undefined) {
            getHotel(hotelId.current)
              .then((data) => {
                hotelData.current = data;
                hotelOwnerId.current = data.ownerId;
                fetchReservationRequests();
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

    const fetchReservationRequests = async () => {
      const existingRequests = await getReservationRequestsByRoom(id);
      requests.current = existingRequests ?? [];
    };
  }, [id, state.isUserLoggedIn]);

  const createRequest = async () => {
    if (selectedDates.length !== 2) {
      alert('Please select a period!');
      return;
    }

    if (selectedDates[0].getTime() === selectedDates[1].getTime()) {
      alert('You need to make a reservation for at least 2 days!');
      return;
    }

    const existingRequests = await getReservationRequestsByRoom(id);
    requests.current = existingRequests ?? [];
    if (existingRequests !== undefined) {
      let isPeriodAvailable = true;
      requests.current.forEach((request) => {
        if (
          request.requestStatus.toString() === 'pending' ||
          request.requestStatus.toString() === 'accepted'
        ) {
          if (
            request.startDate <= selectedDates[0].getTime() &&
            request.endDate >= selectedDates[1].getTime()
          ) {
            isPeriodAvailable = false;
            return;
          }
          if (
            request.startDate >= selectedDates[0].getTime() &&
            request.startDate < selectedDates[1].getTime()
          ) {
            isPeriodAvailable = false;
            return;
          }
          if (
            request.endDate > selectedDates[0].getTime() &&
            request.endDate <= selectedDates[1].getTime()
          ) {
            isPeriodAvailable = false;
            return;
          }
        }
      });

      if (!isPeriodAvailable) {
        alert('Period is not available! You are trying to reserve a period that overlaps with an existing reservation.');
        return;
      }
    }

    const myCollection = collection(firebaseDb, 'reservationRequests');
    const myDocRef = doc(myCollection);
    const reservationRequest: ReservationRequest = {
      id: myDocRef.id,
      startDate: selectedDates[0].getTime(),
      endDate: selectedDates[1].getTime(),
      roomId: id,
      ownerId: hotelOwnerId.current ?? '',
      userId: state.user?.id ?? '',
      requestStatus: 'pending',
    };

    const onSuccess = () => {
      alert('Request added successfully!');
      router.back();
    };
    const onFailure = (error: any) => {
      console.log(error);
      alert('Error adding request!');
    };

    addReservationRequest({ reservationRequest, onSuccess, onFailure });
  };

  const handleDateClick = (date: Date) => {
    if (selectedDates.length === 2) {
      setSelectedDates([date]);
    } else if (selectedDates.length === 1) {
      if (date > selectedDates[0]) {
        setSelectedDates([selectedDates[0], date]);
      } else {
        setSelectedDates([date, selectedDates[0]]);
      }
    } else {
      setSelectedDates([date]);
    }
  };

  const tileClassName = ({ date }: { date: Date }) => {
    if (selectedDates.length === 2) {
      if (date >= selectedDates[0] && date <= selectedDates[1]) {
        return styles.highlight;
      }
    }
    return '';
  };

  const tileDisabled = ({ date }: { date: Date }) => {
    const today = new Date();
    const isPastDate = date < today;

    if (isPastDate) {
      return true;
    }

    const isReservedDate = requests.current.some((request) => {
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);

      // Check if the current date is within the reserved period
      return date >= startDate && date <= endDate && (request.requestStatus.toString() === 'pending' || request.requestStatus.toString() === 'accepted');
    });

    return isReservedDate;
  };

  const renderPage = () => {
    return (
      <>
        <h1 className={styles.title}>Create a request</h1>
        <h2>Hotel: {hotelData.current?.name}</h2>
        <h2>Room: {roomName.current}</h2>
        <h2>
          Selected Arrival: {
            selectedDates[0] ?
            selectedDates[0]?.toLocaleDateString('en-US')
            :
            'No date selected'}
        </h2>
        <h2>
          Selected Departure: {
            selectedDates[1] ?
            selectedDates[1]?.toLocaleDateString('en-US')
            :
            'No date selected'}
        </h2>
        <h2>Select arrival and departure dates:</h2>
        <div className="calendar">
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
            tileDisabled={tileDisabled}
            selectRange={true}
          />
        </div>
        <div className={styles.grid}>
          <button className={styles.card} onClick={createRequest}>
            Send Request
          </button>
        </div>
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
