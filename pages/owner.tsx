import styles from '../styles/Home.module.css';
import { auth, firebaseDb, app } from '../src/firebase/firebase';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { getUser } from '../src/firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { updateDoc, getDoc } from 'firebase/firestore';


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

    const uid = getAuth(app).currentUser?.uid;

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                {!uid && (<div className={styles.grid}>
                    <h1 className={styles.title}>You are not logged in to become an owner</h1>
                    <Link
                        rel="icon"
                        href="\"
                        className={styles.card}
                    >
                        <h2>Back &rarr;</h2>
                        <div>
                            Click here
                        </div>
                    </Link>
                </div>)}
                {uid && (
                    <div className={styles.grid}>
                        <Link
                            rel="icon"
                            href="/"
                            className={styles.card}
                            onClick={async () => {
                                let user = await getDoc(doc(firebaseDb, 'users', uid));
                                if (user.data()!.isOwner == false)
                                    updateDoc(doc(firebaseDb, 'users', uid), { isOwner: true }).then(response => {
                                        alert("User updated")
                                    }).catch(error => {
                                        console.log(error.message)
                                    })
                            }} > <h2>Proprietar &rarr;</h2>
                            <div>
                                Click here to become an owner
                            </div>
                        </Link>
                    </div>
                )}
            </main>
        </div >
    );
}
