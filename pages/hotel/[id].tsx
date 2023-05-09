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

  async function handleUpdateHotel() {
    const hotelRef = doc(firebaseDb, 'hotels', id);
    await updateDoc(hotelRef, {
      name: hotelName,
      location: hotelLocation,
      description: hotelDescription,
    });
    router.push('/ownerHotels');
  }

  async function handleAddRoom() {
    router.push(`/hotel/addRoom/${id}`);
  }

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
              Your Hotel
              <br />
              <input
                type="text"
                defaultValue={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
              />
            </h1>
            <label className={styles.description}>
              Location:
              <br />
              <input
                type="text"
                defaultValue={hotelLocation}
                onChange={(e) => setHotelLocation(e.target.value)}
              />
            </label>
            <label className={styles.description}>
              Description:
              <br />
              <input
                type="text"
                defaultValue={hotelDescription}
                onChange={(e) => setHotelDescription(e.target.value)}
              />
            </label>
            <button onClick={handleUpdateHotel}>Update Hotel</button>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
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
                    <td className={styles.td}>{roomId}</td>
                    <td className={styles.td}>{roomNames[index]}</td>
                    <td className={styles.td}>{roomnoBeds[index]}</td>
                    <td className={styles.td}>{roomprice[index]}</td>
                    <td className={styles.td}>{roomBenefits[index]}</td>
                    <td className={styles.td}>
                      <button>Modify</button>
                    </td>
                    <td className={styles.td}>
                      <button onClick={() => handleDeleteRoom(roomId)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleAddRoom}>Add room</button>
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
