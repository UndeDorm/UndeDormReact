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
import { useContext, useEffect, useRef, useState } from 'react';
import { editHotel, getHotel, getRooms } from '../../src/firebase/database';
import { firebaseDb, storage } from '../../src/firebase/firebase';
import { AuthContext } from '../../src/providers/auth/AuthProvider';
import styles from '../../styles/Home.module.css';
import { Hotel, Room } from '../../src/utils/types';
import { ref, uploadBytes } from 'firebase/storage';

export default function HotelPage({ id }: { id: string }) {
  const { state } = useContext(AuthContext);

  const router = useRouter();
  const hotelData = useRef<Hotel>();
  const originalHotelData = useRef<Hotel>();
  const roomsData = useRef<Room[]>([]);
  const hotelNameRef = useRef<string>(hotelData.current?.name ?? '');
  const hotelLocationRef = useRef<string>(hotelData.current?.location ?? '');
  const hotelDescriptionRef = useRef<string>(
    hotelData.current?.description ?? ''
  );
  const images = useRef<File[]>([]);
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    if (!state.isUserLoggedIn) {
      console.log('You are not logged in!');
      router.push('/');
      return;
    } else {
      getHotel(id)
        .then((data) => {
          hotelData.current = data;
          originalHotelData.current = data;
          hotelDescriptionRef.current = hotelData.current.description;
          hotelLocationRef.current = hotelData.current.location;
          hotelNameRef.current = hotelData.current.name;
          if (hotelData.current) {
            getRooms()
              .then((data) => {
                roomsData.current =
                  data?.filter((room) => room.hotelId === id) ?? [];

                console.log('TEST', roomsData.current);
              })
              .catch((error) => {
                console.error('Error getting rooms', error);
              })
              .finally(() => setIsLoading(false));
          } else {
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error('Error getting hotel', error);
          setIsLoading(false);
        });
    }
  }, [id, router, state.isUserLoggedIn]);

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

  const handleAddRoom = async () => {
    router.push(`/hotel/add-room/${id}`);
  };

  const handleViewRoom = async (roomId: string) => {
    router.push(`/hotel/view-room/${roomId}`);
  };

  const addImage = () => {
    if (imageUpload == null) {
      alert("Please select an image!");
      return;
    }
    images.current.push(imageUpload);
    alert("Image uploaded successfully!");
  };

  const onSave = () => {
    const onSuccess = async () => {
      alert('Hotel updated successfully!');
      router.push('/owner-hotels');
    };

    const onFailure = (error: any) => {
      console.log(error);
      alert('Error updating hotel!');
    };

    if (!hotelNameRef.current) {
      alert('Hotel name cannot be empty!');
      return;
    }

    if (!hotelLocationRef.current) {
      alert('Hotel location cannot be empty!');
      return;
    }

    if (!hotelDescriptionRef.current) {
      alert('Hotel description cannot be empty!');
      return;
    }

    let newData = {};

    if (hotelNameRef.current !== originalHotelData.current?.name) {
      newData = { ...newData, name: hotelNameRef.current };
    }

    if (hotelLocationRef.current !== originalHotelData.current?.location) {
      newData = { ...newData, location: hotelLocationRef.current };
    }

    if (hotelDescriptionRef.current !== originalHotelData.current?.description) {
      newData = { ...newData, description: hotelDescriptionRef.current };
    }

    if (images.current.length > 0) {
      const updatedImages = [...originalHotelData.current?.images || []];

      images.current.forEach((image) => {
        const uniqueId = image.name + Date.now().toString();
        updatedImages.push(uniqueId);
        const imageRef = ref(storage, `hotels/${id}/${uniqueId}`);
        uploadBytes(imageRef, image);
      });

      newData = { ...newData, images: updatedImages};
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

  const renderOwner = () => {
    return (
      <>
        <Head>
          <title>Unde Dorm</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <h1 className={styles.title}>{'Your Hotel'}</h1>
          <input
            type="text"
            className={styles.input}
            defaultValue={originalHotelData.current?.name}
            onChange={(e) => (hotelNameRef.current = e.target.value)}
          />
          <h2>{'Location:'}</h2>
          <input
            type="text"
            className={styles.input}
            defaultValue={hotelLocationRef.current}
            onChange={(e) => (hotelLocationRef.current = e.target.value)}
          />
          <h2>{'Description:'}</h2>
          <input
            type="text"
            className={styles.input}
            defaultValue={hotelDescriptionRef.current}
            onChange={(e) => (hotelDescriptionRef.current = e.target.value)}
          />
          <input
            type="file"
            onChange={(e) => {
              setImageUpload(e.target.files?.[0] ?? null);
            }}
            className={styles.input}
          />

          <button onClick={addImage} className={styles.card}>
           {'Upload Image'}
          </button>

          <button className={styles.card} onClick={onSave}>
            {'Update Hotel'}
          </button>

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
              {roomsData.current.map((room) => (
                <tr key={room.id}>
                  <td className={styles.td}>{room.name}</td>
                  <td className={styles.td}>{room.beds}</td>
                  <td className={styles.td}>{room.pricePerNight}</td>
                  <td className={styles.td}>{room.benefits}</td>
                  <td className={styles.td}>
                    <button
                      className={styles.card}
                      onClick={() => handleModifyRoom(room.id)}
                    >
                      Modify
                    </button>
                  </td>
                  <td className={styles.td}>
                    <button
                      className={styles.card}
                      onClick={() => handleDeleteRoom(room.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className={styles.card} onClick={handleAddRoom}>
            Add room
          </button>
        </main>
      </>
    );
  };

  const renderUser = () => {
    return (
      <>
        <Head>
          <title>Unde Dorm</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <h1 className={styles.title}>Hotel {hotelData.current?.name}</h1>
          <p className={styles.description}>
            Location: {hotelData.current?.location}
          </p>
          <p className={styles.description}>
            Description: {hotelData.current?.description}
          </p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Number Of Beds</th>
                <th>Price</th>
                <th>Benefits</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {roomsData.current.map((room) => (
                <tr key={room.id}>
                  <td className={styles.td}>{room.name}</td>
                  <td className={styles.td}>{room.beds}</td>
                  <td className={styles.td}>{room.pricePerNight}</td>
                  <td className={styles.td}>{room.benefits}</td>
                  <td className={styles.td}>
                    <button
                      className={styles.card}
                      onClick={() => handleViewRoom(room.id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </>
    );
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Unde Dorm</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <>
          <h1 className={styles.title}>{'View Hotel'}</h1>
          {isLoading ? (
            <h1 className={styles.title}>{'Loading...'}</h1>
          ) : (
            <>
              {state.user?.isOwner &&
              state.user.id === hotelData.current?.ownerId
                ? renderOwner()
                : renderUser()}
            </>
          )}
        </>
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
