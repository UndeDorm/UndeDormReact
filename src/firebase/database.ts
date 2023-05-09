import { doc, getDoc, setDoc } from 'firebase/firestore';
import { BasicUser, Hotel, Room, ReservationRequest } from '../utils/types';
import { firebaseDb } from './firebase';

export const addUser = ({
  user,
  onSuccess,
  onFailure,
}: {
  user: BasicUser;
  onSuccess: () => void;
  onFailure: (error: any) => void;
}) => {
  setDoc(doc(firebaseDb, 'users', user.id), {
    firstName: user.firstName,
    lastName: user.lastName,
    isOwner: user.isOwner,
    id: user.id,
    dateOfBirth: user.dateOfBirth,
    email: user.email,
  })
    .then(onSuccess)
    .catch(onFailure);
};

export const getUser = async (id: string) => {
  const docRef = doc(firebaseDb, 'users', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as BasicUser;
  } else {
    return null;
  }
};

export const addHotel = ({
  hotel,
  onSuccess,
  onFailure,
}: {
  hotel: Hotel;
  onSuccess: () => void;
  onFailure: (error: any) => void;
}) => {
  setDoc(doc(firebaseDb, 'hotels', hotel.id), {
    name: hotel.name,
    location: hotel.location,
    images: hotel.images,
    description: hotel.description,
    ownerId: hotel.ownerId,
  })
    .then(onSuccess)
    .catch(onFailure);
};

export const addRoom = ({
  room,
  onSuccess,
  onFailure,
}: {
  room: Room;
  onSuccess: () => void;
  onFailure: (error: any) => void;
}) => {
  setDoc(doc(firebaseDb, 'rooms', room.id), {
    benefits: room.benefits,
    pricePerNight: room.pricePerNight,
    beds: room.beds,
    hotelId: room.hotelId,
  })
    .then(onSuccess)
    .catch(onFailure);
};

export const addReservationRequest = ({
  reservationRequest,
  onSuccess,
  onFailure,
}: {
  reservationRequest: ReservationRequest;
  onSuccess: () => void;
  onFailure: (error: any) => void;
}) => {
  Promise.all([
    setDoc(doc(firebaseDb, 'reservationRequests', reservationRequest.id), {
      requestStatus: reservationRequest.requestStatus,
      roomId: reservationRequest.roomId,
      hotelId: reservationRequest.hotelId,
      userId: reservationRequest.userId,
      startDate: reservationRequest.startDate,
      endDate: reservationRequest.endDate,
    }),
    setDoc(doc(firebaseDb, 'reservations', reservationRequest.id), {
      reservationStatus: reservationRequest.requestStatus,
      reservationRequestId: reservationRequest.id,
    }),
  ])
    .then(onSuccess)
    .catch(onFailure);
};
