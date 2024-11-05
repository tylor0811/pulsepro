/**
 * Function to validate email address
 */
export function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return email.match(emailRegex) !== null;
}

/**
 * Function to add error state to an error message element parent and to
 * add a message to an error message element
 */
export function addErrorState(errorMessageElementSelector, errorMessageElementText) {
    const errorMessageElement = document.querySelector(errorMessageElementSelector);
    errorMessageElement.parentElement.classList.add('error-state');
    errorMessageElement.textContent = errorMessageElementText;
}

/**
 * Function to remove error state on all input's parent element if a
 * navigation form link is clicked or any submit button
 */
export function removeErrorStateFromFormInputContainers(formElement) {
    const formInputs = formElement.querySelectorAll('[data-form-input]');
    formInputs.forEach(function(formInput) {
        if (formInput.parentElement.classList.contains('error-state')) {
            formInput.parentElement.classList.remove('error-state');
        }
    });
}

/**
 * Function to remove data from all input elements
 */
export function removeValueFromFormInputs(formElement) {
    const formInputs = formElement.querySelectorAll('[data-form-input]');
    formInputs.forEach(function(formInput) {
        if (formInput.value !== '') {
            formInput.value = '';
        }
    });
}

/**
 * Remove error state from an input's parent element if the parent element 
 * has the class 'error-state' and the user starts entering data in its 
 * child input
 */
export function removeErrorStateOnInput(formElement) {
    const formInputs = formElement.querySelectorAll('[data-form-input]');
    formInputs.forEach(function(formInput) {
        formInput.addEventListener('input', function () {
            if (formInput.parentElement.classList.contains('error-state')) {
                formInput.parentElement.classList.remove('error-state');
            }
        });
    });
}

/**
 * Function to display a message to the user to specify if the email was
 * successfully sent or not
 */
export async function displayFormResponseMessage(formElement, status, icon, message) {
    const formResponseMessageContainer = formElement.querySelector('[data-form-response-message-container]');
    const formResponseIcon = formResponseMessageContainer.querySelector('i');
    const formResponseMessage = formResponseMessageContainer.querySelector('p');

    formResponseMessageContainer.classList.add(status);
    formResponseIcon.classList.add(icon);
    formResponseMessage.textContent = message;

    await new Promise(function (resolve) { setTimeout(resolve, 5000) });//wait 5 seconds before removing the form response message

    formResponseMessageContainer.classList.remove(status);
    formResponseIcon.classList.remove(icon);
    formResponseMessage.textContent = '';
}

/**
 * Function to change the toggle show password button icon back to the eye closed
 * if it was changed to eye opened icon and change the related input 'type' attribute
 * value back to password if it was changed to text
 */
export function resetAllToggleShowBtnsAndRelatedInputsToDefault(formElement) {
    const toggleShowPasswordBtns = formElement.querySelectorAll('[data-toggle-show-password-btn]');
    toggleShowPasswordBtns.forEach(function(toggleShowPasswordBtn) {
        const buttonIcon = toggleShowPasswordBtn.querySelector('i');
        if (buttonIcon.getAttribute('class') === 'ri-eye-line') {
            buttonIcon.classList.replace('ri-eye-line', 'ri-eye-off-line');
        }


        const relatedInputId = toggleShowPasswordBtn.getAttribute('data-related-input-id');
        const relatedInput = formElement.querySelector(`input[id='${relatedInputId}']`);
        if (relatedInput.getAttribute('type') === 'text') {
            relatedInput.setAttribute('type', 'password');
        }
    });
}

/**
 * Hide/Show a form password when the user clicks on the toggle
 * show password button and toggle the toggle show password button
 * icon so that the user will know if the password is visible or
 * not
 */
export function handleToggleShowPasswordButtonClick(formElement) {
    const toggleShowPasswordBtns = formElement.querySelectorAll('[data-toggle-show-password-btn]');
    toggleShowPasswordBtns.forEach(function(toggleShowPasswordBtn) {
        toggleShowPasswordBtn.addEventListener('click', function () {
            const buttonIcon = toggleShowPasswordBtn.querySelector('i');
            buttonIcon.setAttribute(
                'class',
                buttonIcon.classList.contains('ri-eye-line')
                ? 'ri-eye-off-line'
                : 'ri-eye-line'
            );

            const relatedInputId = toggleShowPasswordBtn.getAttribute('data-related-input-id');
            const relatedInput = formElement.querySelector(`input[id='${relatedInputId}']`);
            relatedInput.setAttribute(
                'type',
                relatedInput.getAttribute('type') === 'password'
                ? 'text'
                : 'password'
            );
        });
    });
}

/**
 * Function to convert first letter of a string to
 * upper case
 */
export function convertFirstLetterToUpperCase(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
}

/**
 * Function to encrypt password
 */
export function encryptPassword(password) {
    const passwordLength = password.length;
    let encryptedPassword = '';

    //encrypt password
    for (let i = 0; i < passwordLength; i++) {
        encryptedPassword += (i !== (passwordLength - 1))
            ? ((password.charCodeAt(i) - 5) * 3) + '-'
            : (password.charCodeAt(i) - 5) * 3;
    }

    return encryptedPassword;
}

/**
 * Function to decrypt password
 */
export function decryptPassword(encryptedPassword) {
    const encryptedPasswordLettersCode = encryptedPassword.split('-');
    const encryptedPasswordLettersCodeLength = encryptedPasswordLettersCode.length;
    let decryptedPassword = '';

    //decrypt password
    for (let i = 0; i < encryptedPasswordLettersCodeLength; i++) {
        const originalLetterCode = (encryptedPasswordLettersCode[i] / 3) + 5;
        decryptedPassword += String.fromCharCode(originalLetterCode);
    }

    return decryptedPassword;
}

/**
 * Function to go to navigate between the webpages for the project
 * when being hosted on github
 */
export function goToPage(path, target) {
    window.open(path, target);
}