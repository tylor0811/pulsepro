"use strict";

import { 
    isValidEmail, addErrorState, removeValueFromFormInputs, 
    removeErrorStateOnInput, displayFormResponseMessage,
    goToPage 
} from './utility/utility.js';


/**
 * All selectors object
 */
const selectors = {
    primaryHeader: document.querySelector('[data-primary-header]'),
    navMenu: document.querySelector('[data-nav-menu]'),
    navMenuLinks: document.querySelectorAll('[data-nav-menu-link]'),
    navMenuCloseBtn: document.querySelector('[data-nav-menu-close-btn]'),
    navMenuOpenBtn: document.querySelector('[data-nav-menu-open-btn]'),
    sections: document.querySelectorAll('[data-section]'),
    backToTopBtn: document.querySelector('[data-back-to-top-btn]'),
    topDoctorsItemsContainer: document.querySelector('[data-top-doctors-items-container]'),
    contactForm: document.querySelector('[data-contact-form]'),
    contactFormSubmitBtn: document.querySelector('[data-contact-form-submit-btn]'),
    contactFormInputAreas: document.querySelectorAll('[data-contact-form-input-area]')
};

/**
 * Function to add 'scrolled' class to the primary header
 * element
 */
function addScrolledClassToPrimaryHeader() {
    selectors.primaryHeader.classList.add('scrolled');
}

/**
 * Function to remove 'scrolled' class from the primary header
 * element
 */
function removeScrolledClassToPrimaryHeader() {
    selectors.primaryHeader.classList.remove('scrolled');
}

/**
 * Function to determine which navigation menu link should be
 * active whenever the window is being scrolled or when
 * the browser is refreshed
 */
function changeActiveNavMenuLink() {
    selectors.sections.forEach(function (section) {
        const sectionId = section.getAttribute('id');
        const sectionTop = section.offsetTop - 105;
        const sectionHeight = sectionTop + section.clientHeight;

        const sectionRelatedNavMenuLink =
            document.querySelector(`[data-nav-menu-link][href='#${sectionId}']`);
        if (window.scrollY >= sectionTop
            && window.scrollY <= sectionHeight) {
            sectionRelatedNavMenuLink.classList.add('active-link');
        } else {
            if (sectionRelatedNavMenuLink.classList.contains('active-link')) {
                sectionRelatedNavMenuLink.classList.remove('active-link');
            }
        }
    });
}

/**
 * Function to extract the the user data from the contact form
 * when the contact form submit button is clicked
 */
function getUserDataFromContactForm() {
    const contactFormData = new FormData(selectors.contactForm);
    return {
        name: contactFormData.get('contact__form-user-name'),
        email: contactFormData.get('contact__form-user-email'),
        message: contactFormData.get('contact__form-user-message')
    };
}

/**
 * Function to validate whether or not the data provided by the user in the
 * contact form is valid data for the email to be sent
 */
function isValidContactData(contactData) {
    if (!contactData.name) {
        addErrorState(
            '[data-contact-form-name-error-message]',
            'Name field must not be empty'
        );
        return false;
    }

    if (!contactData.email) {
        addErrorState(
            '[data-contact-form-email-error-message]',
            'Email field must not be empty'
        );
        return false;
    }

    if (!isValidEmail(contactData.email)) {
        addErrorState(
            '[data-contact-form-email-error-message]',
            'Email format is incorrect'
        );
        return false;
    }

    if (!contactData.message) {
        addErrorState(
            '[data-contact-form-details-error-message]',
            'Message field must not be empty'
        );
        return false;
    }

    return true; //valid user data
}

/**
 * Function to retrieve all the doctors data from the doctors-data.json file
 * and to convert the data into a javascript object so that the data is able
 * to be displayed in the browser
 */
async function getDoctorsData() {
    const response = await fetch('./assets/scripts/doctors-json/doctors-data.json');
    const data = await response.json();
    return data;
}

/**
 * Function to render the number of rating stars for a doctor on the
 * webpage
 */
function renderStars(ratings) {
    let starsString = '';
    for (let i = 0; i < ratings; i++) {
        starsString += '<i class="ri-star-fill rating-star"></i>';
    }
    return starsString;
}

/**
 * Function to render/display top doctors info on page
 */
async function displayTopDoctorsOnPage() {
    const doctorsData = await getDoctorsData();
    const topDoctors = doctorsData.filter(function (doctorData) { return doctorData.ratings === 5 });
    const topDoctorsItemsContainer = document.querySelector('[data-top-doctors-items-container]');

    let topDoctorsHtml = ``;

    topDoctors.forEach(function (topDoctor, index) {
        topDoctorsHtml += `
            <div class="top-doctors__item">
                <div class="top-doctors__item-img-container">
                    <img
                        src="./assets/images/doctor-${index + 1}.jpg"
                        alt="Top Doctor Image"
                        class="top-doctors__item-img"
                        loading="lazy"
                    >
                </div>
                <div class="top-doctors__item-content">
                    <p class="top-doctors__item-availability-text">
                        ${topDoctor.status}
                    </p>
                    <div class="top-doctors__item-doctor-ratings">
                        ${renderStars(topDoctor.ratings)}
                    </div>
                    <h3 class="top-doctors__item-doctor-name">
                        Dr. ${topDoctor.name}
                    </h3>
                    <span class="top-doctors__item-doctor-specialty">
                        ${topDoctor.specialty}
                    </span>
                </div>
            </div>
        `;
    });

    topDoctorsItemsContainer.innerHTML = topDoctorsHtml;
}

if (selectors.navMenuOpenBtn) {
    selectors.navMenuOpenBtn.addEventListener('click', function () {
        selectors.navMenu.classList.add('show-menu');
    
        if (window.scrollY > 0) {
            removeScrolledClassToPrimaryHeader();
        }
    });
}

if (selectors.navMenuCloseBtn) {
    selectors.navMenuCloseBtn.addEventListener('click', function () {
        selectors.navMenu.classList.remove('show-menu');
    
        if (window.scrollY > 0) {
            addScrolledClassToPrimaryHeader();
        }
    });
}

window.addEventListener('scroll', function () {
    if (window.scrollY > 0) {
        addScrolledClassToPrimaryHeader();
    } else {
        removeScrolledClassToPrimaryHeader();
    }
});


window.addEventListener('DOMContentLoaded', function () {
    if (window.scrollY > 0) {
        addScrolledClassToPrimaryHeader();
    }
});

if (selectors.navMenuLinks) {
    selectors.navMenuLinks.forEach(function(link) {
        link.addEventListener('click', function () {
            if (!link.classList.contains('active-link')) {
                const currentActiveNavMenuLink = document.querySelector('[data-nav-menu-link].active-link');
                currentActiveNavMenuLink.classList.remove('active-link');
    
                link.classList.add('active-link');
                selectors.navMenu.classList.remove('show-menu');
    
                if (window.scrollY > 0) {
                    addScrolledClassToPrimaryHeader();
                }
            }
        });
    });
}

window.addEventListener('resize', function () {
    if (window.matchMedia('(min-width: 992px)').matches
        && selectors.navMenu.classList.contains('show-menu')) {
        selectors.navMenu.classList.remove('show-menu')

        if (window.scrollY > 0) {
            addScrolledClassToPrimaryHeader();
        }
    }
});

window.addEventListener('scroll', function () {
    if (selectors.navMenu.classList.contains('show-menu')) {
        selectors.navMenu.classList.remove('show-menu');
    }
});

window.addEventListener('scroll', function () { changeActiveNavMenuLink() });

window.addEventListener('DOMContentLoaded', function () { changeActiveNavMenuLink() });

window.addEventListener('DOMContentLoaded', function () {
    if (window.scrollY >= 150) {
        selectors.backToTopBtn.classList.add('show-btn');
    } else {
        selectors.backToTopBtn.classList.remove('show-btn');
    }
});

window.addEventListener('scroll', function () {
    if (window.scrollY >= 150) {
        selectors.backToTopBtn.classList.add('show-btn');
    } else {
        selectors.backToTopBtn.classList.remove('show-btn');
    }
});

if (selectors.contactFormSubmitBtn) {
    selectors.contactFormSubmitBtn.addEventListener('click', async function(event) {
        event.preventDefault();
        const contactData = getUserDataFromContactForm();
        if (isValidContactData(contactData)) {
            emailjs.init({ publicKey: 'bRyWlDYiDLORIU7gv' });
            try {
                await emailjs.send('service_d1s3by2', 'template_txw512s', contactData);
                removeValueFromFormInputs(selectors.contactForm);
                displayFormResponseMessage(
                    selectors.contactForm, 
                    'successful', 
                    'ri-check-line', 
                    'Email sent successfully'
                );
            }
            catch (error) {
                displayFormResponseMessage(
                    selectors.contactForm, 
                    'failed', 
                    'ri-close-line', 
                    'Email cannot be sent at this time. Try again later'
                );
            }
        }
    });
}

/**
 * Testimonials Swiper
 */
new Swiper('[data-testimonial-swiper]', {
    direction: 'horizontal',
    loop: true,
    spaceBetween: 20,
    slidesPerView: 1,

    navigation: {
        prevEl: '[data-testimonials-navigation-prev-btn]',
        nextEl: '[data-testimonials-navigation-next-btn]'
    }
});
//================================================================


displayTopDoctorsOnPage();

if (selectors.contactForm) {
    removeErrorStateOnInput(selectors.contactForm);
}