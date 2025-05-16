// Rooster/js/profielKaarten.js
// Placeholder for profile card logic
console.log("profielKaarten.js geladen");

let profileCardTimeout = null;
const PROFILE_CARD_DELAY = 300; // ms

// Function to get profile photo URL
function getProfilePhotoUrl(medewerker, size = 'M') {
    console.log('[getProfilePhotoUrl] Called with medewerker:', medewerker, 'size:', size);
    let profielFotoFinalUrl = 'Icoon/default-profile.svg'; // Default fallback

    if (!medewerker) {
        console.error("[getProfilePhotoUrl] Medewerker object is null or undefined.");
        return profielFotoFinalUrl;
    }

    const accountIdentifier = medewerker.Username || medewerker.E_x002d_mail;

    if (!accountIdentifier) {
        console.warn(`[getProfilePhotoUrl] Geen Username of E_x002d_mail gevonden voor medewerker: ${medewerker.Naam || JSON.stringify(medewerker)}. Gebruik standaardicoon.`);
    }

    if (accountIdentifier && typeof window.spWebAbsoluteUrl === 'string' && window.spWebAbsoluteUrl) {
        const baseUrl = window.spWebAbsoluteUrl.endsWith('/') ? window.spWebAbsoluteUrl.slice(0, -1) : window.spWebAbsoluteUrl;
        profielFotoFinalUrl = `${baseUrl}/_layouts/15/userphoto.aspx?size=${size}&accountname=${encodeURIComponent(accountIdentifier)}`;
        console.log(`[getProfilePhotoUrl] Generated SharePoint URL: ${profielFotoFinalUrl}`);
    } else if (!accountIdentifier) {
        // Warning already logged above
    } else {
        console.warn(`[getProfilePhotoUrl] window.spWebAbsoluteUrl ('${window.spWebAbsoluteUrl}') is niet ingesteld of geen string. Kan geen SharePoint foto URL genereren voor ${accountIdentifier}. Gebruik standaardicoon.`);
    }
    console.log(`[getProfilePhotoUrl] Returning URL: ${profielFotoFinalUrl}`);
    return profielFotoFinalUrl;
}

// Functie om de profielkaart te tonen
// Parameter 'medewerker' is nu het volledige medewerker object
function showProfileCard(medewerker, targetElement) { 
    clearTimeout(profileCardTimeout); 

    const cardContainer = document.getElementById('profile-card-container');
    if (!targetElement) {
        console.warn("[ProfielKaart] TargetElement niet gevonden voor showProfileCard.");
        return;
    }
    if (!cardContainer) {
        console.warn("[ProfielKaart] Card container niet gevonden.");
        return;
    }

    let contentHtml;
    let cardIdentifierLog = 'onbekende medewerker';

    if (!medewerker || typeof medewerker !== 'object' || Object.keys(medewerker).length === 0) {
        console.warn("[ProfielKaart] Geen of ongeldige medewerker data ontvangen.", medewerker);
        // Gebruik p-2 zoals in het originele bestand voor de content div
        contentHtml = '<div class="profile-card-content p-2 text-red-500">Profielinformatie niet beschikbaar.</div>';
        cardIdentifierLog = 'data niet beschikbaar';
    } else {
        cardIdentifierLog = medewerker.Naam || medewerker.Username || medewerker.ID || 'medewerker';
        console.log(`[ProfielKaart] Profielkaart data voorbereiden voor: ${cardIdentifierLog}`);

        const profielFotoFinalUrl = getProfilePhotoUrl(medewerker, 'M'); // Use the new utility function with size 'M'
        
        // Gebruik p-2 zoals in het originele bestand voor de content div
        // De classes bg-white rounded-lg shadow-xl border border-gray-200 zijn toegevoegd voor styling.
        contentHtml = `
            <div class="profile-card-content p-2 bg-white rounded-lg shadow-xl border border-gray-200">
                <img src="${profielFotoFinalUrl}" 
                     alt="Profielfoto van ${medewerker.Naam || 'medewerker'}" 
                     class="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-gray-300 object-cover" 
                     onerror="this.onerror=null; this.src='Icoon/default-profile.svg';">
                <h3 class="text-lg font-semibold text-center text-gray-800">${medewerker.Naam || 'N/A'}</h3>
                <p class="text-sm text-gray-600 text-center">${medewerker.E_x002d_mail || 'E-mail niet beschikbaar'}</p>
                <p class="text-sm text-gray-600 text-center mt-1">Horen: ${medewerker.Horen === true ? 'Ja' : (medewerker.Horen === false ? 'Nee' : 'N/B')}</p>
            </div>
        `;
    }

    cardContainer.innerHTML = contentHtml;

    // Positioning logic (single pass)
    const rect = targetElement.getBoundingClientRect();
    let cardLeft = window.scrollX + rect.right + 10; 
    let cardTop = window.scrollY + rect.top;      

    // Make it visible at 0,0 to measure its dimensions correctly
    cardContainer.style.left = '0px'; 
    cardContainer.style.top = '0px';
    cardContainer.classList.remove('hidden');

    const cardWidth = cardContainer.offsetWidth;
    const cardHeight = cardContainer.offsetHeight;

    // Adjust if it goes off screen right
    if ((cardLeft + cardWidth) > window.innerWidth) {
        cardLeft = window.scrollX + rect.left - cardWidth - 10; // Try to the left of target
    }
    // Adjust if it goes off screen bottom
    if ((cardTop + cardHeight) > window.innerHeight) {
        cardTop = window.scrollY + window.innerHeight - cardHeight - 10; // Align to bottom edge - 10px
    }
    // Ensure it doesn't go above the viewport top
    if (cardTop < window.scrollY) {
        cardTop = window.scrollY + 10; // Align to top edge + 10px
    }
    // Ensure it doesn't go off screen left (especially if switched to left of target or initial position was too far left)
    if (cardLeft < window.scrollX) { 
        cardLeft = window.scrollX + 10; // Align to left edge + 10px
    }
    
    cardContainer.style.left = `${cardLeft}px`;
    cardContainer.style.top = `${cardTop}px`;

    cardContainer.removeEventListener('mouseleave', delayedHideProfileCard);
    cardContainer.addEventListener('mouseleave', delayedHideProfileCard);
    cardContainer.removeEventListener('mouseenter', cancelHideProfileCard);
    cardContainer.addEventListener('mouseenter', cancelHideProfileCard);

    if (!medewerker || typeof medewerker !== 'object' || Object.keys(medewerker).length === 0) {
        // If data was invalid, set a timeout to hide the error message
        profileCardTimeout = setTimeout(hideProfileCard, 3000); 
    }
    console.log(`[ProfielKaart] Profielkaart getoond en gepositioneerd voor: ${cardIdentifierLog}`);
}

function cancelHideProfileCard() {
    clearTimeout(profileCardTimeout);
}

function delayedHideProfileCard() {
    clearTimeout(profileCardTimeout);
    profileCardTimeout = setTimeout(hideProfileCard, PROFILE_CARD_DELAY / 2); // Kortere delay als muis van kaart af gaat
}

// Functie om de profielkaart te verbergen
function hideProfileCard() {
    clearTimeout(profileCardTimeout);
    const cardContainer = document.getElementById('profile-card-container');
    if (cardContainer) {
        cardContainer.classList.add('hidden');
        // cardContainer.innerHTML = ''; // Optioneel: leegmaken bij verbergen
    }
    console.log("[ProfielKaart] Kaart verborgen.");
}

// Eventueel een hoofdfunctie om alles te starten na het laden van de DOM
// document.addEventListener('DOMContentLoaded', function() {
//     initProfileCardEventListeners(); // Wordt nu afgehandeld in verlofrooster_logic.js
// });

// Globale functies beschikbaar maken indien nodig (als ze nog niet globaal zijn)
window.showProfileCard = showProfileCard;
window.hideProfileCard = hideProfileCard;
window.delayedHideProfileCard = delayedHideProfileCard;
window.cancelHideProfileCard = cancelHideProfileCard;
window.getProfilePhotoUrl = getProfilePhotoUrl; // Make the new function globally available

console.log("[ProfielKaart] Functies (show, hide, delayedHide, cancelHide, getProfilePhotoUrl) zijn nu globaal beschikbaar.");
