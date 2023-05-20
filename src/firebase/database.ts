import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { BasicUser, Hotel, Room, ReservationRequest } from '../utils/types';
import { firebaseDb } from './firebase';
import { useContext } from 'react';
import { AuthContext } from '../providers/auth/AuthProvider';
import exp from 'constants';

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

export const editUser = ({
  userId,
  newData,
  onSuccess,
  onFailure,
}: {
  userId: string;
  newData: Partial<BasicUser>;
  onSuccess: () => void;
  onFailure: (error: any) => void;
}) => {
  updateDoc(doc(firebaseDb, 'users', userId), newData)
    .then(onSuccess)
    .catch(onFailure);
};

export const upgradeToOwner = async (uid: string) => {
  let user = await getDoc(doc(firebaseDb, 'users', uid));

  if (!user.data()?.isOwner) {
    return updateDoc(doc(firebaseDb, 'users', uid), { isOwner: true });
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
    id: hotel.id,
  })
    .then(onSuccess)
    .catch(onFailure);
};

export const editHotel = ({
  hotelId,
  newData,
  onSuccess,
  onFailure,
}: {
  hotelId: string;
  newData: Partial<Hotel>;
  onSuccess: () => void;
  onFailure: (error: any) => void;
}) => {
  updateDoc(doc(firebaseDb, 'hotels', hotelId), newData)
    .then(onSuccess)
    .catch(onFailure);
};

export const getHotel = async (id: string) => {
  const docRef = doc(firebaseDb, 'hotels', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Hotel;
  } else {
    return Promise.reject('Hotel not found');
  }
};

export const getHotels = async () => {
  const hotelsRef = collection(firebaseDb, 'hotels');

  const hotelsSnap = await getDocs(hotelsRef);

  if (hotelsSnap) {
    return hotelsSnap.docs
      .map((doc) => doc.data())
      .filter((data) => !!data.name) as Hotel[];
  } else {
    return null;
  }
};

export const getRooms = async () => {
  const roomsRef = collection(firebaseDb, 'rooms');

  const roomsSnap = await getDocs(roomsRef);

  if (roomsSnap) {
    return roomsSnap.docs
      .map((doc) => doc.data())
      .filter((data) => !!data.name) as Room[];
  } else {
    return null;
  }
};

export const getOwnedHotels = async (ownerId: string) => {
  const hotelsRef = collection(firebaseDb, 'hotels');
  const hotelsSnap = await getDocs(hotelsRef);

  if (hotelsSnap) {
    return hotelsSnap.docs
      .map((doc) => doc.data())
      .filter((data) => data.ownerId === ownerId) as Hotel[];
  } else {
    return null;
  }
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
    name: room.name,
    benefits: room.benefits,
    pricePerNight: room.pricePerNight,
    beds: room.beds,
    hotelId: room.hotelId,
    id: room.id,
  })
    .then(onSuccess)
    .catch(onFailure);
};

export const getRoom = async (id: string) => {
  const docRef = doc(firebaseDb, 'rooms', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Room;
  } else {
    return Promise.reject('Room not found');
  }
};

export const editRoom = ({
  roomId,
  newData,
  onSuccess,
  onFailure,
}: {
  roomId: string;
  newData: Partial<Room>;
  onSuccess: () => void;
  onFailure: (error: any) => void;
}) => {
  updateDoc(doc(firebaseDb, 'rooms', roomId), newData)
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
      ownerId: reservationRequest.ownerId,
      userId: reservationRequest.userId,
      startDate: reservationRequest.startDate,
      endDate: reservationRequest.endDate,
      id: reservationRequest.id,
    }),
    setDoc(doc(firebaseDb, 'reservations', reservationRequest.id), {
      reservationStatus: reservationRequest.requestStatus,
      reservationRequestId: reservationRequest.id,
    }),
  ])
    .then(onSuccess)
    .catch(onFailure);
};

export const getReservationRequestsByRoom = async (roomId : String) => {
  const reservationRequestsRef = collection(firebaseDb, 'reservationRequests');
  const reservationRequestsSnap = await getDocs(reservationRequestsRef);

  if (reservationRequestsSnap) {
    return reservationRequestsSnap.docs
      .map((doc) => doc.data())
      .filter((data) => data.roomId === roomId) as ReservationRequest[];
  } else {  
    return null;
  }
};

export const getReservationRequestsByUser = async (userId : String) => {
  const reservationRequestsRef = collection(firebaseDb, 'reservationRequests');
  const reservationRequestsSnap = await getDocs(reservationRequestsRef);

  if (reservationRequestsSnap) {
    return reservationRequestsSnap.docs
      .map((doc) => doc.data())
      .filter((data) => data.userId === userId) as ReservationRequest[];
  } else {  
    return null;
  }
}

export const getReservationRequestsByOwner = async (ownerId : String) => {
  const reservationRequestsRef = collection(firebaseDb, 'reservationRequests');
  const reservationRequestsSnap = await getDocs(reservationRequestsRef);

  if (reservationRequestsSnap) {
    return reservationRequestsSnap.docs
      .map((doc) => doc.data())
      .filter((data) => data.ownerId === ownerId) as ReservationRequest[];
  } else {  
    return null;
  }
}

export const editReservationRequest = ({
  requestId,
  newData,
  onSuccess,
  onFailure,
}: {
  requestId: string;
  newData: Partial<ReservationRequest>;
  onSuccess: () => void;
  onFailure: (error: any) => void;
}) => {
  updateDoc(doc(firebaseDb, 'reservationRequests', requestId), newData)
    .then(onSuccess)
    .catch(onFailure);
  updateDoc(doc(firebaseDb, 'reservations', requestId), {
    reservationStatus: newData.requestStatus,
  })
    .then(onSuccess)
    .catch(onFailure);
};