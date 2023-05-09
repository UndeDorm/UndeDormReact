import { collection, doc, getDoc } from 'firebase/firestore';
import Head from 'next/head';
import router from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { addRoom } from '../../../src/firebase/database';
import { firebaseDb } from '../../../src/firebase/firebase';
import { AuthContext } from '../../../src/providers/auth/AuthProvider';
import { Room } from '../../../src/utils/types';
import styles from '../../../styles/Home.module.css';

export default function ModifyRoom({ id }: { id: string }) {
  const { state } = useContext(AuthContext);
  const [roomName, setRoomName] = useState<string>();
  const [roomnoBeds, setRoomnoBeds] = useState<number>();
  const [roomprice, setRoomprice] = useState<number>();
  const [roomBenefits, setRoomBenefits] = useState<string[]>([]);
  const [hotelId, setHotelId] = useState<string>();
  const [hotelOwnerId, setHotelOwnerId] = useState<string>();

  useEffect(() => {
    if (!state.isUserLoggedIn) {
      console.log('You are not logged in!');
      router.push('/');
      return;
    }

    async function fetchRoom() {
      const roomRef = doc(firebaseDb, 'rooms', id);
      const roomSnapshot = await getDoc(roomRef);

      if (roomSnapshot.exists()) {
        const roomData = roomSnapshot.data();
        setRoomName(roomData?.name);
        setRoomnoBeds(roomData?.noBeds);
        setRoomprice(roomData?.price);
        setRoomBenefits(roomData?.benefits);
        setHotelId(roomData?.hotelId);
      }
    }

    fetchRoom();
    async function fetchHotel() {
      const hotelRef = doc(firebaseDb, 'hotels', hotelId ?? '');
      const hotelSnapshot = await getDoc(hotelRef);

      if (hotelSnapshot.exists()) {
        const hotelData = hotelSnapshot.data();
        setHotelOwnerId(hotelData?.ownerId);
      }
    }

    fetchHotel();
  }, [hotelId, id, state.isUserLoggedIn]);

  return (
    <div className={styles.container}>
      {state.user?.isOwner && state.user?.id === hotelOwnerId ? (
        <>you re the owner</>
      ) : (
        <>you re not the owner</>
      )}
    </div>
  );
}
