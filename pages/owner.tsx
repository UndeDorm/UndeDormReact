import styles from '../styles/Home.module.css';
import { auth, firebaseDb, app } from '../src/firebase/firebase';
import { useContext, useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';
import { AuthContext } from '../src/providers/auth/AuthProvider';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { getUser, upgradeToOwner } from '../src/firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { updateDoc, getDoc } from 'firebase/firestore';


export default function BecomeOwner() {
    const { state } = useContext(AuthContext);

    const Upgrade = () => {
        upgradeToOwner(state.user!.id);
    };

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                {!state.isUserLoggedIn && (<div className={styles.grid}>
                    <h1 className={styles.title}>You are not logged in to become an owner</h1>
                    <Link
                        rel="icon"
                        href="/"
                        className={styles.card}
                    >
                        <h2>Back &rarr;</h2>
                        <div>
                            Click here
                        </div>
                    </Link>
                </div>)}
                {state.isUserLoggedIn && (
                    <div onClick={Upgrade} className={styles.grid}>
                        <Link
                            rel="icon"
                            href="/"
                            className={styles.card}
                        > <h2>Proprietar &rarr;</h2>
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
