import { ChangeEvent, FormEvent, useContext, useState } from "react";
import styles from '../styles/Home.module.css';
import { useRouter } from "next/router";
import { confirmThePasswordReset } from "../src/firebase/firebase";
import { AuthContext } from "../src/providers/auth/AuthProvider";

const defaultFormFields = {
    password: '',
    confirmPassword: '',
}

export default function ResetPassword() {
    const [succesMessage, setSuccesMessage] = useState(false);
    const [formFields, setFormFields] = useState(defaultFormFields);
    const {password, confirmPassword} = formFields;
    const router = useRouter();
    const { oobCode } = router.query;
    const { state } = useContext(AuthContext);

    if (state.isUserLoggedIn) {
        console.log('You are currently logged in!');
        router.push('/');
        return;
    }

    const resetFormFields = () => {
        return (
            setFormFields(defaultFormFields)
        )
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            alert('Password do not match');
            return;
        }

        if (password.length < 6) {
            alert('Please enter a password with at least 6 characters.');
            return;
        }

        try {
            if (oobCode) {
                await confirmThePasswordReset(oobCode as string, confirmPassword);
                setSuccesMessage(true);
                resetFormFields();
            } else {
                alert('Something went wrong');
                console.log('missing oobCode');
            }
        } catch (error:any) {
            if (error.code === 'auth/invalid-action-code') {
                alert('The action code is invalid. This can happen if the code is malformed, expired, or has already been used.');
            }
            console.log(error.message);
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormFields({...formFields, [name]: value});
    }

    return (
        <div>
            <main className={styles.main}>
                {
                    succesMessage ?
                    <div>
                        <h3 className={styles.title}> Your password has been reset!</h3>
                        <button onClick={() => router.push('/sign-in')} className={styles.card}>Sign In</button>
                    </div> :
                    <div>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div>
                                <input 
                                    className={styles.input}
                                    type="password"
                                    name="password"
                                    value={password}
                                    onChange={handleChange}
                                    placeholder="New Password"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    className={styles.input}
                                    type="password"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm Password"
                                    required
                                />
                            </div>
                            <div>
                                <input type="submit" className={styles.input}/>
                            </div>
                        </form>
                    </div>
                }
            </main>
        </div>
    )
}