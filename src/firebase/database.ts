import { doc, setDoc } from 'firebase/firestore';
import { BasicUser } from '../utils/types';
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
  })
    .then(onSuccess)
    .catch(onFailure);
};

export const addHotel = ({
  hotel,
  onSuccess,
  onFailure,
}: {
  hotel: any;
  onSuccess: () => void;
  onFailure: (error: any) => void;
}) => {};
