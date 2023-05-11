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
import { firebaseDb } from '../../../src/firebase/firebase';
import { AuthContext } from '../../../src/providers/auth/AuthProvider';
import { Room } from '../../../src/utils/types';
import styles from '../../../styles/Home.module.css';

export default function ModifyRoom({ id }: { id: string }) {
  const { state } = useContext(AuthContext);
  const [roomName, setRoomName] = useState<string>();
  const [roomnoBeds, setRoomnoBeds] = useState<number>();
  const [roomprice, setRoomprice] = useState<number>();
  const [roomBenefits, setRoomBenefits] = useState<string>();
  const [hotelId, setHotelId] = useState<string>();
  const [hotelOwnerId, setHotelOwnerId] = useState<string>();
  const [originalRoomName, setOriginalRoomName] = useState<string>();
  const [originalRoomnoBeds, setOriginalRoomnoBeds] = useState<number>();
  const [originalRoomprice, setOriginalRoomprice] = useState<number>();
  const [originalRoomBenefits, setOriginalRoomBenefits] = useState<string>();
  const router = useRouter();

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
        setHotelId(roomData?.hotelId);
        setRoomName(roomData?.name);
        setRoomnoBeds(roomData?.beds);
        setRoomprice(roomData?.pricePerNight);
        setRoomBenefits(roomData?.benefits);
        setOriginalRoomName(roomData?.name);
        setOriginalRoomnoBeds(roomData?.beds);
        setOriginalRoomprice(roomData?.pricePerNight);
        setOriginalRoomBenefits(roomData?.benefits);
      } else {
        console.log('Room not found!');
        router.push('/');
      }
    }
    fetchRoom();

    const fetchHotels = async () => {
      const hotelsRef = collection(firebaseDb, 'hotels');
      const hotelsSnapshot = await getDocs(hotelsRef);
      const hotelsData = hotelsSnapshot.docs
        .map((doc) => doc.data())
        .filter(
          (data) =>
            data.id !== undefined && data.id !== null && data.id === hotelId
        );

      const hotelOwnerId = hotelsData.map((data) => data.ownerId)[0];

      setHotelOwnerId(hotelOwnerId);
    };

    fetchHotels();
  }, [id, state, router, hotelId]);

  const onSave = () => {
    const onSuccess = async () => {
      const roomRef = doc(firebaseDb, 'rooms', id);
      await updateDoc(roomRef, {
        name: roomName,
        beds: roomnoBeds,
        pricePerNight: roomprice,
        benefits: roomBenefits,
      });
      alert('Room updated successfully!');
      router.back();
    };

    const onFailure = (error: any) => {
      console.log(error);
      alert('Error updating room!');
    };

    if (!roomName) {
      alert('Room name cannot be empty!');
      return;
    }

    if (!roomnoBeds) {
      alert('Room number of beds cannot be empty!');
      return;
    }

    if (!roomprice) {
      alert('Room price cannot be empty!');
      return;
    }

    if (!roomBenefits) {
      alert('Room benefits cannot be empty!');
      return;
    }

    let newData = {};

    if (roomName !== originalRoomName) {
      newData = { ...newData, name: roomName };
    }

    if (roomnoBeds !== originalRoomnoBeds) {
      newData = { ...newData, noBeds: roomnoBeds };
    }

    if (roomprice !== originalRoomprice) {
      newData = { ...newData, price: roomprice };
    }

    if (roomBenefits !== originalRoomBenefits) {
      newData = { ...newData, benefits: roomBenefits };
    }

    if (Object.keys(newData).length === 0) {
      alert('No changes were made!');
      return;
    }

    editRoom({
      roomId: id,
      newData,
      onSuccess,
      onFailure,
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Modify Room</title>
        <meta name="description" content="Modify Room" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {
          <>
            {state.user?.isOwner && state.user?.id === hotelOwnerId ? (
              <main className={styles.main}>
                <h1>{'Room name'}</h1>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
                <h1>{'Room number of beds'}</h1>
                <input
                  type="number"
                  value={roomnoBeds}
                  onChange={(e) => setRoomnoBeds(parseInt(e.target.value))}
                />
                <h1>{'Room price'}</h1>
                <input
                  type="number"
                  value={roomprice}
                  onChange={(e) => setRoomprice(parseInt(e.target.value))}
                />
                <h1>{'Room benefits'}</h1>
                <input
                  type="text"
                  value={roomBenefits}
                  onChange={(e) => setRoomBenefits(e.target.value)}
                />
                <button onClick={onSave}>Save</button>
              </main>
            ) : (
              <main className={styles.main}>
                <h1>You are not authorized to modify this room!</h1>
              </main>
            )}
          </>
        }
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