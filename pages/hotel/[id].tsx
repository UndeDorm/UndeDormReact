import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { editHotel } from '../../src/firebase/database';
import { firebaseDb } from '../../src/firebase/firebase';
import { AuthContext } from '../../src/providers/auth/AuthProvider';
import styles from '../../styles/Home.module.css';

export default function HotelPage({ id }: { id: string }) {
  const { state } = useContext(AuthContext);
  const [hotelName, setHotelName] = useState<string>();
  const [hotelLocation, setHotelLocation] = useState<string>();
  const [hotelDescription, setHotelDescription] = useState<string>();
  const [hotelOwnerId, setHotelOwnerId] = useState<string>();
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const [roomnoBeds, setRoomnoBeds] = useState<number[]>([]);
  const [roomprice, setRoomprice] = useState<number[]>([]);
  const [roomBenefits, setRoomBenefits] = useState<string[]>([]);
  const [roomNames, setRoomNames] = useState<string[]>([]);
  const [originalHotelName, setOriginalHotelName] = useState<string>();
  const [originalHotelLocation, setOriginalHotelLocation] = useState<string>();
  const [originalhotelDescription, setOriginalHotelDescription] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    if (!state.isUserLoggedIn) {
      console.log('You are not logged in!');
      router.push('/');
      return;
    }

    async function fetchHotel() {
      const hotelRef = doc(firebaseDb, 'hotels', id);
      const hotelSnapshot = await getDoc(hotelRef);

      if (hotelSnapshot.exists()) {
        const hotelData = hotelSnapshot.data();
        setHotelName(hotelData?.name);
        setHotelLocation(hotelData?.location);
        setHotelDescription(hotelData?.description);
        setHotelOwnerId(hotelData?.ownerId);
        setOriginalHotelName(hotelData?.name);
        setOriginalHotelLocation(hotelData?.location);
        setOriginalHotelDescription(hotelData?.description);
      } else {
        console.log('Hotel not found!');
        router.push('/');
      }
    }

    const fetchRooms = async () => {
      const roomsRef = collection(firebaseDb, 'rooms');
      const roomsSnapshot = await getDocs(roomsRef);
      const roomsData = roomsSnapshot.docs
        .map((doc) => doc.data())
        .filter(
          (data) =>
            data.id !== undefined && data.id !== null && data.hotelId === id
        );

      const roomIds = roomsData.map((data) => data.id);
      const roomnoBeds = roomsData.map((data) => data.beds);
      const roomprice = roomsData.map((data) => data.pricePerNight);
      const roomBenefits = roomsData.map((data) => data.benefits);
      const roomNames = roomsData.map((data) => data.name);

      setRoomIds(roomIds);
      setRoomnoBeds(roomnoBeds);
      setRoomprice(roomprice);
      setRoomBenefits(roomBenefits);
      setRoomNames(roomNames);
    };

    fetchHotel();
    fetchRooms();
  }, [id, router, state]);

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteDoc(doc(firebaseDb, 'rooms', roomId));
      console.log('Room deleted successfully!');
      router.reload();
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  const handleModifyRoom = async (roomId: string) => {
    router.push(`/hotel/modify-room/${roomId}`);
  };

  async function handleAddRoom() {
    router.push(`/hotel/add-room/${id}`);
  }

  const onSave = () => {
    const onSuccess = async () => {
      const hotelRef = doc(firebaseDb, 'hotels', id);
      await updateDoc(hotelRef, {
        name: hotelName,
        location: hotelLocation,
        description: hotelDescription,
      });
      alert('Hotel updated successfully!');
      router.push('/owner-hotels');
    };

    const onFailure = (error: any) => {
      console.log(error);
      alert('Error updating hotel!');
    };

    if (!hotelName) {
      alert('Hotel name cannot be empty!');
      return;
    }

    if (!hotelLocation) {
      alert('Hotel location cannot be empty!');
      return;
    }

    if (!hotelDescription) {
      alert('Hotel description cannot be empty!');
      return;
    }

    let newData = {};

    if (hotelName !== originalHotelName) {
      newData = { ...newData, name: hotelName };
    }

    if (hotelLocation !== originalHotelLocation) {
      newData = { ...newData, location: hotelLocation };
    }

    if (hotelDescription !== originalhotelDescription) {
      newData = { ...newData, description: hotelDescription };
    }

    if (Object.keys(newData).length === 0) {
      alert('No changes were made!');
      return;
    }

    editHotel({
      hotelId: id,
      newData,
      onSuccess,
      onFailure,
    });
  };

  return (
    <div className={styles.container}>
      {state.user?.isOwner && state.user?.id === hotelOwnerId ? (
        <>
          <Head>
            <title>Unde Dorm</title>
            <meta name="description" content="Generated by create next app" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <main className={styles.main}>
            <h1 className={styles.title}>
              {'Your Hotel'}
            </h1>
            <input
                type="text"
                className={styles.input}
                defaultValue={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
              />
            <h2>
              {'Location:'}
            </h2>
              <input
                type="text"
                className={styles.input}
                defaultValue={hotelLocation}
                onChange={(e) => setHotelLocation(e.target.value)}
              />
            <h2>
              Description:
            </h2>
              <input
                type="text"
                className={styles.input}
                defaultValue={hotelDescription}
                onChange={(e) => setHotelDescription(e.target.value)}
              />
            <button className={styles.card} onClick={onSave}>Update Hotel</button>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Number Of Beds</th>
                  <th>Price</th>
                  <th>Benefits</th>
                  <th>Modify</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {roomIds.map((roomId, index) => (
                  <tr key={roomId}>
                    <td className={styles.td}>{roomNames[index]}</td>
                    <td className={styles.td}>{roomnoBeds[index]}</td>
                    <td className={styles.td}>{roomprice[index]}</td>
                    <td className={styles.td}>{roomBenefits[index]}</td>
                    <td className={styles.td}>
                      <button className={styles.card} onClick={() => handleModifyRoom(roomId)}>
                        Modify
                      </button>
                    </td>
                    <td className={styles.td}>
                      <button className={styles.card} onClick={() => handleDeleteRoom(roomId)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className={styles.card} onClick={handleAddRoom}>Add room</button>
          </main>
        </>
      ) : (
        <>
          <Head>
            <title>Unde Dorm</title>
            <meta name="description" content="Generated by create next app" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <main className={styles.main}>
            <h1 className={styles.title}>Hotel {hotelName}</h1>
            <p className={styles.description}>Location: {hotelLocation}</p>
            <p className={styles.description}>
              Description: {hotelDescription}
            </p>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Number Of Beds</th>
                  <th>Price</th>
                  <th>Benefits</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {roomIds &&
                  roomIds.map((roomId, index) => (
                    <tr key={roomId}>
                      <td className={styles.td}>{roomId}</td>
                      <td className={styles.td}>
                        {roomnoBeds && roomnoBeds[index]}
                      </td>
                      <td className={styles.td}>
                        {roomprice && roomprice[index]}
                      </td>
                      <td className={styles.td}>
                        {roomBenefits && roomBenefits[index]}
                      </td>
                      <td className={styles.td}>
                        <button>View</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </main>
        </>
      )}
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
