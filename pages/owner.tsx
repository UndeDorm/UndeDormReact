import styles from '../styles/Home.module.css';
import { useContext } from 'react';
import { AuthContext } from '../src/providers/auth/AuthProvider';
import Link from 'next/link';
import { upgradeToOwner } from '../src/firebase/database';


export default function BecomeOwner() {
    const { state } = useContext(AuthContext);

    const Upgrade = () => {
        upgradeToOwner(state.user!.id);
    };

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                {(!state.isUserLoggedIn || state.user!.isOwner) && (<div className={styles.grid}>
                    <h1 className={styles.title}>Cannot upgrade to owner</h1>
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
                {(state.isUserLoggedIn && !state.user!.isOwner) && (
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
