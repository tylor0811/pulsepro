"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import { getDatabase, ref, set, get, update, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
    getAuth, createUserWithEmailAndPassword,
    signInWithEmailAndPassword, sendPasswordResetEmail, deleteUser
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
    displayFormResponseMessage, encryptPassword, removeValueFromFormInputs, resetAllToggleShowBtnsAndRelatedInputsToDefault, goToPage
} from '../utility/utility.js';

import {
    setVisibleForm, automaticallyAddCredentialToLoginForm, updateCredentialPasswordInLocalStorage,
    isCredentialPasswordInLocalStorageOutdated, isCredentialInLocalStorage, addCredentialToLocalStorage
} from '../auth-form.js';

const firebaseConfig = {
    apiKey: "AIzaSyC4MfdFWWUNkSeysjLHPp41S0RcHnkBTdE",
    authDomain: "pulsepro-hospitalmanagement.firebaseapp.com",
    databaseURL: "https://pulsepro-hospitalmanagement-default-rtdb.firebaseio.com",
    projectId: "pulsepro-hospitalmanagement",
    storageBucket: "pulsepro-hospitalmanagement.appspot.com",
    messagingSenderId: "118319387755",
    appId: "1:118319387755:web:ee4107df9e13cfec4ecd2e"
};

const app = initializeApp(firebaseConfig);
const realtimeDatabase = getDatabase(app);
const authenticationService = getAuth(app);
//============================================================


/**
 * Function to get a specific record from a specific path within
 * the database
 */
async function getRecordFromDatabase(databasePath, uid) {
    const snapshot = await get(ref(realtimeDatabase, `${databasePath}/${uid}`));
    return snapshot.val();
}

/**
 * Function to get all record keys with a specific path in the
 * database
 */
async function getAllRecordsKeyFromDatabase(databasePath) {
    const snapshot = await get(ref(realtimeDatabase, databasePath));
    return (snapshot.exists())
    ? Object.keys(snapshot.val())
    : null;
}

/**
 * Function to check if an email exist with a specific database path
 * based on the user type
 */
export async function isEmailInUse(email, userType) {
    let emailExist = false;
    
    const recordsKey = await getAllRecordsKeyFromDatabase(`${userType}s`);
    if (recordsKey) {
        //loop through each record to determine if the email exists
        for (let i = 0; i < recordsKey.length; i++) {
            const record = await getRecordFromDatabase(`${userType}s`, recordsKey[i]);
            if (record.email.toLowerCase() === email.toLowerCase()) {
                emailExist = true;//email exists within the database
                break;//exit loop
            }
        }
    }

    return emailExist;
}

/**
 * Function to add data into the realtime database
 */
async function addUserDataIntoRealtimeDatabase(uid, credential) {
    await set(ref(realtimeDatabase, `users/${uid}`), {
        firstName: credential.firstName,
        lastName: credential.lastName,
        email: credential.email,
        password: encryptPassword(credential.password)
    });
}

/**
 * Function to create a user account
 */
export async function createUserAccount(formElement, credential) {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            authenticationService,
            credential.email,
            credential.password
        );

        //add credential to session storage
        addCredentialToLocalStorage('user-credential', credential);

        await addUserDataIntoRealtimeDatabase(userCredential.user.uid, credential);

        removeValueFromFormInputs(formElement);
        resetAllToggleShowBtnsAndRelatedInputsToDefault(formElement);

        await displayFormResponseMessage(
            formElement,
            'successful',
            'ri-check-line',
            'Account created successfully'
        );

        setVisibleForm('login-form');
        automaticallyAddCredentialToLoginForm('user-credential');
    } catch (error) {
        await displayFormResponseMessage(
            formElement,
            'failed',
            'ri-close-line',
            'Something went wrong while creating your account'
        );
    }
}

/**
 * Function to send password reset email
 */
export async function sendPasswordResetEmailToPerson(formElement, email) {
    try {
        await sendPasswordResetEmail(
            authenticationService,
            email
        );

        removeValueFromFormInputs(formElement);

        await displayFormResponseMessage(
            formElement,
            'successful',
            'ri-check-line',
            'Password reset email sent successfully'
        );

        window.close();
    } catch (error) {
        await displayFormResponseMessage(
            formElement,
            'failed',
            'ri-close-line',
            'Something went wrong while sending password reset link to your email'
        );
    }
}

/**
 * Function to update a specific user password within the realtime
 * database
 */
async function updateUserPasswordInRealtimeDatabase(databasePath, uid, newPassword) {
    await update(ref(realtimeDatabase, `${databasePath}/${uid}`), { password: encryptPassword(newPassword) });
}

/**
 * Function to sign in user
 */
export async function signInUser(formElement, credential) {
    try {
        const userCredential = await signInWithEmailAndPassword(
            authenticationService,
            credential.email,
            credential.password
        );

        if (!isCredentialInLocalStorage('user-credential')) {
            addCredentialToLocalStorage('user-credential', credential);
        }

        if (isCredentialPasswordInLocalStorageOutdated('user-credential', credential.password)) {
            updateCredentialPasswordInLocalStorage('user-credential', credential.password);
            updateUserPasswordInRealtimeDatabase(
                'users', 
                userCredential.user.uid, 
                credential.password
            );
        }

        removeValueFromFormInputs(formElement);
        resetAllToggleShowBtnsAndRelatedInputsToDefault(formElement);

        await displayFormResponseMessage(
            formElement,
            'successful',
            'ri-check-line',
            'Welcome User'
        );

        goToPage('pulsepro-user-home-page.html');
    } catch (error) {
        if (error.code === 'auth/invalid-credential') {
            await displayFormResponseMessage(
                formElement,
                'failed',
                'ri-close-line',
                'Invalid login credential'
            );
            return; //exit function
        }

        await displayFormResponseMessage(
            formElement,
            'failed',
            'ri-close-line',
            'Something went wrong while signing into your account'
        );
    }
}

/**
 * Function to sign in user
 */
export async function signInAdmin(formElement, credential) {
    try {
        const adminCredential = await signInWithEmailAndPassword(
            authenticationService,
            credential.email,
            credential.password
        );

        if (!isCredentialInLocalStorage('admin-credential')) {
            addCredentialToLocalStorage('admin-credential', credential);
        }

        if (isCredentialPasswordInLocalStorageOutdated('admin-credential', credential.password)) {
            updateCredentialPasswordInLocalStorage('admin-credential', credential.password);
            updateUserPasswordInRealtimeDatabase(
                'admin',
                adminCredential.user.uid,
                credential.password
            );
        }

        removeValueFromFormInputs(formElement);
        resetAllToggleShowBtnsAndRelatedInputsToDefault(formElement);

        await displayFormResponseMessage(
            formElement,
            'successful',
            'ri-check-line',
            'Welcome Admin'
        );

        goToPage('pulsepro-admin-dashboard.html');
    } catch (error) {
        if (error.code === 'auth/invalid-credential') {
            await displayFormResponseMessage(
                formElement,
                'failed',
                'ri-close-line',
                'Invalid login credential'
            );
            return; //exit function
        }

        await displayFormResponseMessage(
            formElement,
            'failed',
            'ri-close-line',
            'Something went wrong while signing into your account'
        );
    }
}

/**
 * Function to sign in user
 */
export async function signInDoctor(formElement, credential) {
    try {
        const doctorCredential = await signInWithEmailAndPassword(
            authenticationService,
            credential.email,
            credential.password
        );

        if (!isCredentialInLocalStorage('doctor-credential')) {
            addCredentialToLocalStorage('doctor-credential', credential);
        }

        if (isCredentialPasswordInLocalStorageOutdated('doctor-credential', credential.password)) {
            updateCredentialPasswordInLocalStorage('doctor-credential', credential.password);
            updateUserPasswordInRealtimeDatabase(
                'doctors',
                doctorCredential.user.uid,
                credential.password
            );
        }

        removeValueFromFormInputs(formElement);
        resetAllToggleShowBtnsAndRelatedInputsToDefault(formElement);

        await displayFormResponseMessage(
            formElement,
            'successful',
            'ri-check-line',
            'Welcome Doctor'
        );

        goToPage('pulsepro-doctor-dashboard.html');
    } catch (error) {
        if (error.code === 'auth/invalid-credential') {
            await displayFormResponseMessage(
                formElement,
                'failed',
                'ri-close-line',
                'Invalid login credential'
            );
            return; //exit function
        }

        await displayFormResponseMessage(
            formElement,
            'failed',
            'ri-close-line',
            'Something went wrong while signing into your account'
        );
    }
}