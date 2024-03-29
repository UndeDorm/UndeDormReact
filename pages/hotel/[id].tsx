import { deleteDoc, doc } from 'firebase/firestore';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { editHotel, getHotel, getRooms } from '../../src/firebase/database';
import { firebaseDb, storage } from '../../src/firebase/firebase';
import { AuthContext } from '../../src/providers/auth/AuthProvider';
import styles from '../../styles/Home.module.css';
import { Hotel, Room } from '../../src/utils/types';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import ImagePicker from '../../src/components/ImagePicker/ImagePicker';

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
  const imageURLs = useRef<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteButton, setShowDeleteButton] = useState(false);

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

                if (
                  hotelData.current?.images &&
                  hotelData.current?.images.length > 0
                ) {
                  const imageUrlsPromises = hotelData.current?.images.map(
                    (imageId) => {
                      const imageRef = ref(storage, `hotels/${id}/${imageId}`);
                      return getDownloadURL(imageRef);
                    }
                  );

                  Promise.all(imageUrlsPromises)
                    .then((imageUrls) => {
                      imageURLs.current = imageUrls;
                      setIsLoading(false);
                    })
                    .catch((error) => {
                      console.error('Error getting image URLs', error);
                      setIsLoading(false);
                    });
                } else {
                  setIsLoading(false);
                }
              })
              .catch((error) => {
                console.error('Error getting rooms', error);
                setIsLoading(false);
              });
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

    if (
      hotelDescriptionRef.current !== originalHotelData.current?.description
    ) {
      newData = { ...newData, description: hotelDescriptionRef.current };
    }

    if (images.current.length > 0) {
      const updatedImages = [...(originalHotelData.current?.images || [])];

      images.current.forEach((image) => {
        const uniqueId = image.name + Date.now().toString();
        updatedImages.push(uniqueId);
        const imageRef = ref(storage, `hotels/${id}/${uniqueId}`);
        uploadBytes(imageRef, image);
      });

      newData = { ...newData, images: updatedImages };
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
    const handlePreviousImage = () => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? imageURLs.current.length - 1 : prevIndex - 1
      );
    };

    const handleNextImage = () => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === imageURLs.current.length - 1 ? 0 : prevIndex + 1
      );
    };

    const handleDeleteImage = () => {
      console.log('deleteImage');
      const imageId = hotelData.current?.images[currentImageIndex];
      const imageRef = ref(storage, `hotels/${id}/${imageId}`);
      const updatedImages = [...(hotelData.current?.images || [])];
      updatedImages.splice(currentImageIndex, 1);
      editHotel({
        hotelId: id,
        newData: { images: updatedImages },
        onSuccess: () => {},
        onFailure: (error) => {
          console.error('Error deleting image:', error);
        },
      });
      deleteObject(imageRef)
        .then(() => {
          alert('Image deleted successfully!');
          router.reload();
        })
        .catch((error) => {
          console.error('Error deleting image:', error);
        });
    };

    return (
      <>
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
        <h2>Description:</h2>
        <input
          type="text"
          className={styles.input}
          defaultValue={hotelDescriptionRef.current}
          onChange={(e) => (hotelDescriptionRef.current = e.target.value)}
        />

        {hotelData.current?.images && hotelData.current?.images.length > 0 ? (
          <div className={styles.imageContainer}>
            <button className={styles.card} onClick={handlePreviousImage}>
              {'Previous'}
            </button>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.image}
                src={imageURLs.current[currentImageIndex]}
                onMouseEnter={() => setShowDeleteButton(true)}
                onMouseLeave={() => setShowDeleteButton(false)}
                alt="Hotel Image"
              />
              {showDeleteButton && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                  }}
                >
                  <button
                    onClick={handleDeleteImage}
                    className={styles.card}
                    onMouseEnter={() => setShowDeleteButton(true)}
                  >
                    {'Delete'}
                  </button>
                </div>
              )}
            </div>
            <button className={styles.card} onClick={handleNextImage}>
              {'Next'}
            </button>
          </div>
        ) : (
          <h1>{'No images available.'}</h1>
        )}
        <ImagePicker imagesUploadedRef={images} />

        <button className={styles.card} onClick={onSave}>
          Update Hotel
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
      </>
    );
  };

  const renderUser = () => {
    const handlePreviousImage = () => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? imageURLs.current.length - 1 : prevIndex - 1
      );
    };

    const handleNextImage = () => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === imageURLs.current.length - 1 ? 0 : prevIndex + 1
      );
    };

    return (
      <>
        <h1 className={styles.title}>Hotel {hotelData.current?.name}</h1>
        <p className={styles.description}>
          Location: {hotelData.current?.location}
        </p>
        <p className={styles.description}>
          Description: {hotelData.current?.description}
        </p>
        {hotelData.current?.images && hotelData.current?.images.length > 0 ? (
          <div className={styles.imageContainer}>
            <button onClick={handlePreviousImage} className={styles.card}>
              Previous
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.image}
              src={imageURLs.current[currentImageIndex]}
              alt="Hotel Image"
            />
            <button className={styles.card} onClick={handleNextImage}>
              Next
            </button>
          </div>
        ) : (
          <h1>{'No images available.'}</h1>
        )}
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
