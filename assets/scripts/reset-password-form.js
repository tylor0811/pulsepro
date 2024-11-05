"use strict";

/**
 * IMPORTS
 */
import {
    addErrorState, removeErrorStateOnInput, displayFormResponseMessage, isValidEmail
} from './utility/utility.js';

import {
    sendPasswordResetEmailToPerson, isEmailInUse
} from './database/database.js';

/**
 * ALL SELECTORS OBJECT
 */
const selectors = {
    resetPasswordFormCloseBtn: document.querySelector('[data-reset-password-form-close-btn]'),
    resetPasswordFormElement: document.querySelector('[data-reset-password-form]'),
    resetPasswordFormSubmitBtn: document.querySelector('[data-reset-password-form-submit-btn]')
};

/**
 * Function to get reset password form email email
 */
function getEmail() {
    const resetEmailFormData = new FormData(selectors.resetPasswordFormElement);
    return resetEmailFormData.get('reset-password-form-user-email');
}

/**
 * Function to fully validate email provided
 */
function isValidResetPasswordEmail(email) {
    if (!email) {
        addErrorState(
            '[data-reset-password-form-error-text]',
            'Email field must not be empty'
        );
        return false;
    }

    if (!isValidEmail(email)) {
        addErrorState(
            '[data-reset-password-form-error-text]',
            'Invalid email format'
        );
        return false;
    }

    return true;//valid email
}

if (selectors.resetPasswordFormCloseBtn) {
    selectors.resetPasswordFormCloseBtn.addEventListener('click', function () {
        window.close();
    });
}

if (selectors.resetPasswordFormSubmitBtn) {
    selectors.resetPasswordFormSubmitBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        const email = getEmail();
        if (isValidResetPasswordEmail(email)) {
            if (!await isEmailInUse(email, 'user')) {
                await displayFormResponseMessage(
                    selectors.resetPasswordFormElement,
                    'failed',
                    'ri-close-line',
                    'Cannot send password reset link to email that does not exist in database'
                )
            } else {
                await sendPasswordResetEmailToPerson(selectors.resetPasswordFormElement, email);
            }
        }
    });
}
//==================================================

if (selectors.resetPasswordFormElement) {
    removeErrorStateOnInput(selectors.resetPasswordFormElement);
}