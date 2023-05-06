import styles from '../styles/Home.module.css';
import { auth, firebaseDb } from '../src/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { app } from '../src/firebase/firebase';
import { getUser } from '../src/firebase/database';
import { updateDoc } from 'firebase/firestore';


export default function BecomeOwner() {
    const [, setIsUserLoaded] = useState(false);
    const [, setUsername] = useState('Guest');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setIsUserLoaded(false);
            if (user) {
                try {
                    const data = await getUser(user.uid);
                    setUsername(data ? data.firstName : 'Guest');
                } catch (error) {
                    console.warn('[Home]', error);
                    setUsername('Guest');
                }
            } else {
                setUsername('Guest');
            }
            setIsUserLoaded(true);
        });

        return unsubscribe;
    }, []);

    const userID = getAuth(app).currentUser?.uid;

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                {userID && (
                    <div className={styles.grid}>
                        <Link
                            rel="icon"
                            href="/"
                            className={styles.card}
                            onClick={() => {
                                if (userID)
                                    updateDoc(doc(firebaseDb, 'users', userID), { isOwner: true }).then(response => {
                                        alert("User updated")
                                    }).catch(error => {
                                        console.log(error.message)
                                    })
                            }} > <h2>Proprietar &rarr;</h2>
                            <p>
                                Click here to become an owner.
                            </p>
                        </Link>
                    </div>
                )}
            </main>
        </div >
    );
}
