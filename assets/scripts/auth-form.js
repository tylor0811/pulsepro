"use strict";

import {
    isValidEmail, addErrorState, removeErrorStateFromFormInputContainers,
    removeValueFromFormInputs, removeErrorStateOnInput, displayFormResponseMessage,
    resetAllToggleShowBtnsAndRelatedInputsToDefault, handleToggleShowPasswordButtonClick,
    convertFirstLetterToUpperCase, decryptPassword, encryptPassword
} from './utility/utility.js';

import {
    isEmailInUse, createUserAccount, signInUser, signInAdmin, signInDoctor
} from './database/database.js';

/**
 * All selectors object
 */
const selectors = {
    authFormsWrapper: document.querySelector('[data-auth-forms-wrapper]'),
    loginFormContainer: document.querySelector('[data-login-form-container]'),
    loginFormElement: document.querySelector('[data-login-form]'),
    signUpFormElement: document.querySelector('[data-signup-form]'),
    signUpFormLink: document.querySelector('[data-signup-form-link]'),
    loginFormLink: document.querySelector('[data-login-form-link]'),
    authFormsCloseBtn: document.querySelector('[data-auth-forms-close-btn]'),
    forgotPasswordLink: document.querySelector('[data-forgot-password-link]'),
    backToUserLoginFormBtn: document.querySelector('[data-back-to-user-login-form-btn]'),
    adminLoginLink: document.querySelector('[data-admin-login-link]'),
    doctorLoginLink: document.querySelector('[data-doctor-login-link]'),
    toggleShowPasswordBtns: document.querySelectorAll('[data-toggle-show-password-btn]'),
    loginFormSubmitBtn: document.querySelector('[data-login-form-submit-btn]'),
    signUpFormSubmitBtn: document.querySelector('[data-signup-form-submit-btn]')
};

/**
 * Function to validate if the login credential provided by the user
 * is valid or not
 */
function isValidLoginCredential(credential) {
    if (!credential.email) {
        addErrorState(
            '[data-login-form-email-error-text]',
            'Email field must not be empty'
        );
        return false;
    }

    if (!isValidEmail(credential.email)) {
        addErrorState(
            '[data-login-form-email-error-text]',
            'Invalid email format'
        );
        return false;
    }

    if (!credential.password) {
        addErrorState(
            '[data-login-form-password-error-text]',
            'Password field must not be empty'
        );
        return false;
    }

    return true;//login credentials are valid
}

/**
 * Function to validate if the sign up credential provided by the user
 * is valid or not
 */
function isValidSignUpCredential(credential) {
    if (!credential.firstName) {
        addErrorState(
            '[data-signup-form-first-name-error-text]',
            'First name field must not be empty'
        );
        return false;
    }

    if (!credential.lastName) {
        addErrorState(
            '[data-signup-form-last-name-error-text]',
            'Last name field must not be empty'
        );
        return false;
    }

    if (!credential.email) {
        addErrorState(
            '[data-signup-form-email-error-text]',
            'Email field must not be empty'
        );
        return false;
    }

    if (!isValidEmail(credential.email)) {
        addErrorState(
            '[data-signup-form-email-error-text]',
            'Invalid email format'
        );
        return false;
    }

    if (!credential.password) {
        addErrorState(
            '[data-signup-form-password-error-text]',
            'Password field must not be empty'
        );
        return false;
    }

    if (credential.password.length < 8) {
        addErrorState(
            '[data-signup-form-password-error-text]',
            'Password length must be atleast 8 characters'
        );
        return false;
    }

    if (!credential.confirmPassword) {
        addErrorState(
            '[data-signup-form-confirm-password-error-text]',
            'Confirm password field must not be empty'
        );
        return false;
    }

    if (credential.confirmPassword !== credential.password) {
        addErrorState(
            '[data-signup-form-confirm-password-error-text]',
            'Confirm password must be the same as the password'
        );
        return false;
    }

    return true;//sign up credentials are valid
}

/**
 * Function to check if credential exist in local
 * storage
 */
export function isCredentialInLocalStorage(credentialName) {
    return localStorage.getItem(credentialName) !== null;
}

/**
 * Function to automatically add credentials to login form
 */
export function automaticallyAddCredentialToLoginForm(credentialName) {
    let credential = JSON.parse(localStorage.getItem(credentialName));

    const loginFormInputs = selectors.loginFormElement.querySelectorAll('input');
    loginFormInputs[0].value = credential.email;
    loginFormInputs[1].value = decryptPassword(credential.password);
}

/**
 * Function to get login user type
 */
function getLoginUserType() {
    return selectors.loginFormContainer.getAttribute('data-login-user-type');
}

/**
 * Function to set login user type
 */
function setLoginUserType(userType) {
    selectors.loginFormContainer.setAttribute('data-login-user-type', userType);
}

/**
 * Function to set which form should be displayed on the browser
 */
export function setVisibleForm(formName) {
    selectors.authFormsWrapper.setAttribute('data-show-form', formName);
}

/**
 * Function to get login credential from form that was entered
 */
function getLoginCredentialEntered() {
    const credentialEntered = new FormData(selectors.loginFormElement);
    return {
        email: credentialEntered.get('login-form-user-email'),
        password: credentialEntered.get('login-form-user-password')
    };
}

/**
 * Function to get sign up credential from form that was entered
 */
function getSignUpCredentialEntered() {
    const credentialEntered = new FormData(selectors.signUpFormElement);
    return {
        firstName: convertFirstLetterToUpperCase(credentialEntered.get('signup-form-user-first-name')),
        lastName: convertFirstLetterToUpperCase(credentialEntered.get('signup-form-user-last-name')),
        email: credentialEntered.get('signup-form-user-email'),
        password: credentialEntered.get('signup-form-user-password'),
        confirmPassword: credentialEntered.get('signup-form-user-confirm-password')
    };
}

/**
 * Function to get credential from session storage
 */
function getCredentialFromLocalStorage(credentialName) {
    return JSON.parse(localStorage.getItem(credentialName));
}

/**
 * Function to add credential to local storage
 */
export function addCredentialToLocalStorage(credentialName, credential) {
    localStorage.setItem(credentialName, JSON.stringify({
        email: credential.email,
        password: encryptPassword(credential.password)
    }));
}

/**
 * Function to update credential password in local storage
 */
export function updateCredentialPasswordInLocalStorage(credentialName, newPassword) {
    const credential = getCredentialFromLocalStorage(credentialName);
    credential.password = newPassword;
    addCredentialToLocalStorage(credentialName, credential);
}

/**
 * Function to check if a credential password in local storage
 * has been outdated.
 * 
 * If the login credential password and the credential password
 * in the local storage are different, this means the credential
 * password in the local storage is outdated
 */
export function isCredentialPasswordInLocalStorageOutdated(credentialName, password) {
    let isOutdatedPassword = false;

    const credential = getCredentialFromLocalStorage(credentialName);
    if (decryptPassword(credential.password) !== password) {
        isOutdatedPassword = true; //credential password in local storage was reset by user
    }

    return isOutdatedPassword;
}
//================================================


window.addEventListener('DOMContentLoaded', function() {
    if (isCredentialInLocalStorage('user-credential')) {
        automaticallyAddCredentialToLoginForm('user-credential');
    }
});

if (selectors.adminLoginLink) {
    selectors.adminLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
    
        removeErrorStateFromFormInputContainers(selectors.loginFormElement);
        removeValueFromFormInputs(selectors.loginFormElement);
        resetAllToggleShowBtnsAndRelatedInputsToDefault(selectors.loginFormElement);
    
        setLoginUserType('admin');
        if (isCredentialInLocalStorage('admin-credential')) {
            automaticallyAddCredentialToLoginForm('admin-credential');
        }
    });
}

if (selectors.doctorLoginLink) {
    selectors.doctorLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
    
        removeErrorStateFromFormInputContainers(selectors.loginFormElement);
        removeValueFromFormInputs(selectors.loginFormElement);
        resetAllToggleShowBtnsAndRelatedInputsToDefault(selectors.loginFormElement);
    
        setLoginUserType('doctor');
        if (isCredentialInLocalStorage('doctor-credential')) {
            automaticallyAddCredentialToLoginForm('doctor-credential');
        }
    });
}

if (selectors.backToUserLoginFormBtn) {
    selectors.backToUserLoginFormBtn.addEventListener('click', function () {
        removeErrorStateFromFormInputContainers(selectors.loginFormElement);
        removeValueFromFormInputs(selectors.loginFormElement);
        resetAllToggleShowBtnsAndRelatedInputsToDefault(selectors.loginFormElement);
    
        setLoginUserType('user');
        if (isCredentialInLocalStorage('user-credential')) {
            automaticallyAddCredentialToLoginForm('user-credential');
        }
    });
}

if (selectors.signUpFormLink) {
    selectors.signUpFormLink.addEventListener('click', function(e) {
        e.preventDefault();
    
        removeErrorStateFromFormInputContainers(selectors.loginFormElement);
        removeValueFromFormInputs(selectors.loginFormElement);
        resetAllToggleShowBtnsAndRelatedInputsToDefault(selectors.loginFormElement);
    
        setVisibleForm('signup-form');
    });
}

if (selectors.loginFormLink) {
    selectors.loginFormLink.addEventListener('click', function(e) {
        e.preventDefault();
    
        removeErrorStateFromFormInputContainers(selectors.signUpFormElement);
        removeValueFromFormInputs(selectors.signUpFormElement);
        resetAllToggleShowBtnsAndRelatedInputsToDefault(selectors.signUpFormElement);
    
        setVisibleForm('login-form');
        if (isCredentialInLocalStorage('user-credential')) {
            automaticallyAddCredentialToLoginForm('user-credential');
        }
    });
}

if (selectors.forgotPasswordLink) {
    selectors.forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.open('/pulsepro-reset-user-password-form.html', '_blank');
    });
}

if (selectors.authFormsCloseBtn) {
    selectors.authFormsCloseBtn.addEventListener('click', function () {
        window.close();
    });
}

if (selectors.loginFormSubmitBtn) {
    selectors.loginFormSubmitBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        const credentialEntered = getLoginCredentialEntered();
        if (isValidLoginCredential(credentialEntered)) {
            const loginUserType = getLoginUserType();
            switch (loginUserType) {
                case 'user': {
                    await signInUser(selectors.loginFormElement, credentialEntered);
                    break;
                }
                case 'admin': {
                    await signInAdmin(selectors.loginFormElement, credentialEntered);
                    break;
                }
                case 'doctor': {
                    await signInDoctor(selectors.loginFormElement, credentialEntered);
                    break;
                }
            }
        }
    });
}

if (selectors.signUpFormSubmitBtn) {
    selectors.signUpFormSubmitBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        const credentialEntered = getSignUpCredentialEntered();
        if (isValidSignUpCredential(credentialEntered)) {
            if (await isEmailInUse(credentialEntered.email, 'user')) {    
                await displayFormResponseMessage(
                    selectors.signUpFormElement,
                    'failed',
                    'ri-close-line',
                    'Email already in use. Use a different email'
                );
            } else {
                await createUserAccount(selectors.signUpFormElement, credentialEntered);
            }
        }
    });
}
//================================================

if (selectors.loginFormElement && selectors.signUpFormElement) {
    handleToggleShowPasswordButtonClick(selectors.loginFormElement);
    handleToggleShowPasswordButtonClick(selectors.signUpFormElement);
    
    removeErrorStateOnInput(selectors.loginFormElement);
    removeErrorStateOnInput(selectors.signUpFormElement);
}