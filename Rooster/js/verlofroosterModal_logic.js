/**
 * Opent een generieke modal.
 * @param {string} titel - De titel van de modal.
 * @param {string} contentHtml - De HTML-inhoud voor de modal body.
 * @param {string} actionButtonText - Tekst voor de primaire actieknop. Null als geen actieknop.
 * @param {Function} actionCallback - Callback functie voor de primaire actieknop.
 * @param {boolean} showCancelButton - Of de annuleer/sluit knop getoond moet worden.
 * @param {boolean} showPrevButton - Of een 'Vorige' knop getoond moet worden (voor meerstaps modals).
 * @param {Function} prevButtonCallback - Callback voor de 'Vorige' knop.
 * @param {string} modalSizeClass - Optionele Tailwind class voor modal breedte.
 */

/**
 * Hulpfunctie om donker-thema toe te passen op de modal elementen indien nodig.
 */
function applyDarkThemeToModal() {
    const isDarkTheme = document.body.classList.contains('dark-theme');
    
    // Pas thema toe op modal elementen indien nodig
    const modalContentElement = window.domRefsLogic && window.domRefsLogic.modalContent ? window.domRefsLogic.modalContent : document.querySelector('.modal-content'); // Fallback als domRefsLogic niet beschikbaar is
    if (modalContentElement) {
        const inputs = modalContentElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (isDarkTheme) {
                input.classList.add('dark:bg-gray-700', 'dark:text-white', 'dark:border-gray-600');
            } else {
                input.classList.remove('dark:bg-gray-700', 'dark:text-white', 'dark:border-gray-600');
            }
        });
          const buttons = modalContentElement.querySelectorAll('button');
        buttons.forEach(button => {
            // Wees specifieker om niet alle knoppen te stylen, bijv. alleen primair/secundair
            if (button.classList.contains('modal-button-primary') || button.classList.contains('modal-button-secondary')) {
                if (isDarkTheme) {
                    // Voorbeeld: Pas aan op basis van uw daadwerkelijke knopstyling voor donkere modus
                    if (button.classList.contains('modal-button-primary')) {
                        button.classList.add('dark:bg-blue-600', 'dark:hover:bg-blue-500');
                        button.classList.remove('bg-blue-500', 'hover:bg-blue-600');
                    } else {
                         button.classList.add('dark:bg-gray-600', 'dark:hover:bg-gray-500');
                         button.classList.remove('bg-gray-200', 'hover:bg-gray-300');
                    }
                    button.classList.add('dark:text-white');
                } else {
                    if (button.classList.contains('modal-button-primary')) {
                        button.classList.remove('dark:bg-blue-600', 'dark:hover:bg-blue-500');
                        button.classList.add('bg-blue-500', 'hover:bg-blue-600');
                    } else {
                        button.classList.remove('dark:bg-gray-600', 'dark:hover:bg-gray-500');
                        button.classList.add('bg-gray-200', 'hover:bg-gray-300');
                    }
                    button.classList.remove('dark:text-white');
                }
            }
        });
    }
}

// Hulpfunctie voor spinner SVG
function getSpinnerSvg() {
    return '<svg class="animate-spin h-5 w-5 mr-2 text-white inline-block" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
}

// Zorg ervoor dat escapeHTML is gedefinieerd
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function (match) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[match];
    });
}

/**
 * Initialiseert de DOM referenties voor de modal en stelt globale event listeners in.
 * Deze functie moet aangeroepen worden zodra de DOM geladen is (bv. vanuit verlofrooster_logic.js).
 */
function initializeVerlofroosterModals() {
    console.log("[VerlofroosterModalLogic] Initializing modal DOM references and event listeners...");
    
    // Gebruik eerst de bestaande domRefsLogic als die al bestaat in verlofrooster_logic.js
    if (window.domRefsLogic && window.domRefsLogic.modalPlaceholder) {
        console.log("[VerlofroosterModalLogic] Hergebruik bestaande DOM referenties van verlofrooster_logic.js");
    } else {
        // Initialiseer nieuwe DOM referenties als ze niet bestaan
        window.domRefsLogic = window.domRefsLogic || {};
        
        // Modal elementen
        window.domRefsLogic.modalPlaceholder = document.getElementById('modal-placeholder');
        
        if (window.domRefsLogic.modalPlaceholder) {
            window.domRefsLogic.modalDialog = window.domRefsLogic.modalPlaceholder.querySelector('.modal-dialog');
            window.domRefsLogic.modalCard = window.domRefsLogic.modalPlaceholder.querySelector('.modal-card');
            window.domRefsLogic.modalTitle = document.getElementById('modal-title');
            window.domRefsLogic.modalContent = document.getElementById('modal-content');
            window.domRefsLogic.modalActionsContainer = document.getElementById('modal-actions');
            window.domRefsLogic.modalActionButton = document.getElementById('modal-action-button');
            window.domRefsLogic.modalCloseButton = document.getElementById('modal-close-button'); // Footer close button
            window.domRefsLogic.modalCloseButtonX = document.getElementById('modal-close-button-x'); // 'X' button in header
            window.domRefsLogic.modalStepNavigationContainer = document.getElementById('modal-step-navigation-container');
        }
    }for (const key in window.domRefsLogic) {
        if (!window.domRefsLogic[key]) {
            console.warn(`[VerlofroosterModalLogic] Modal DOM element '${key}' not found during initialization.`);
            // allElementsFound = false; // Optioneel: bijhouden of alle kritieke elementen zijn gevonden
        }
    }

    if (window.domRefsLogic.modalPlaceholder) {
        window.domRefsLogic.modalPlaceholder.addEventListener('click', function(event) {
            // Close if the click is directly on the placeholder (background)
            if (event.target === window.domRefsLogic.modalPlaceholder) {
                closeModal();
            }
        });
    }

    if (window.domRefsLogic.modalCloseButton) {
        window.domRefsLogic.modalCloseButton.addEventListener('click', closeModal);
    }

    if (window.domRefsLogic.modalCloseButtonX) {
        window.domRefsLogic.modalCloseButtonX.addEventListener('click', closeModal);
    }
    console.log("[VerlofroosterModalLogic] Modal initialization complete.");
}

/**
 * Opent een generieke modal.
 * @param {string} titel - De titel van de modal.
 * @param {string} contentHtml - De HTML-inhoud voor de modal body.
 * @param {string} actionButtonText - Tekst voor de primaire actieknop. Null als geen actieknop.
 * @param {Function} actionCallback - Callback functie voor de primaire actieknop.
 * @param {boolean} showCancelButton - Of de annuleer/sluit knop getoond moet worden.
 * @param {boolean} showPrevButton - Of een 'Vorige' knop getoond moet worden (voor meerstaps modals).
 * @param {Function} prevButtonCallback - Callback voor de 'Vorige' knop.
 * @param {string} modalSizeClass - Optionele Tailwind class voor modal breedte.
 */
function openModal(titel, contentHtml, actionButtonText, actionCallback, showCancelButton = true, showPrevButton = false, prevButtonCallback = null, modalSizeClass = 'max-w-md') {
    console.log("[VerlofroosterModalLogic] Openen modal met titel:", titel);    if (!window.domRefsLogic || !window.domRefsLogic.modalPlaceholder || !window.domRefsLogic.modalTitle || !window.domRefsLogic.modalContent || !window.domRefsLogic.modalActionButton || !window.domRefsLogic.modalCloseButton || !window.domRefsLogic.modalActionsContainer || !window.domRefsLogic.modalCard || !window.domRefsLogic.modalStepNavigationContainer) {
        console.error("[VerlofroosterModalLogic] Modal DOM elementen (of domRefsLogic) niet volledig geïnitialiseerd! Roep initializeVerlofroosterModals() eerst globaal aan. Kan modal niet openen.");
        if (typeof toonModalNotificatie === 'function') { 
            toonModalNotificatie("Fout: Modal kan niet worden geopend. Essentiële elementen missen.", "error");
        } else {
            alert("Fout: Modal kan niet worden geopend. Essentiële elementen missen.");
        }
        return;
    }    
    // Verwijderd: interne aanroep naar initializeVerlofroosterModals()
    // if (typeof initializeVerlofroosterModals === 'function') {
    // initializeVerlofroosterModals();
    // }
    
    window.domRefsLogic.modalTitle.textContent = titel;
    window.domRefsLogic.modalContent.innerHTML = contentHtml;
    window.currentModalActionCallback = null;
    
    const modalDialog = window.domRefsLogic.modalDialog; 
    if (modalDialog) {
        modalDialog.classList.remove('max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl');
    modalDialog.classList.add(modalSizeClass);
    }

    if (actionButtonText && typeof actionCallback === 'function') {
        window.domRefsLogic.modalActionButton.textContent = actionButtonText;
        window.domRefsLogic.modalActionButton.classList.remove('hidden');
        window.currentModalActionCallback = actionCallback; 
        
        // Verwijder bestaande listeners en voeg een nieuwe toe
        window.domRefsLogic.modalActionButton.removeEventListener('click', window.handleModalAction);
        window.handleModalAction = function() {
            if (typeof window.currentModalActionCallback === 'function') {
                window.currentModalActionCallback();
            }
        };
        window.domRefsLogic.modalActionButton.addEventListener('click', window.handleModalAction);
    } else {
        window.domRefsLogic.modalActionButton.classList.add('hidden');
    }

    window.domRefsLogic.modalCloseButton.classList.toggle('hidden', !showCancelButton);
    window.domRefsLogic.modalStepNavigationContainer.innerHTML = ''; 
    if (showPrevButton && typeof prevButtonCallback === 'function') {
        const prevButton = document.createElement('button');
        prevButton.id = 'modal-prev-step-button';
        prevButton.textContent = 'Vorige';
        prevButton.className = 'modal-button-secondary py-2 px-4 rounded-lg text-sm shadow hover:shadow-md transition-all';
        if (document.body.classList.contains('dark-theme')) {
             prevButton.classList.add('dark:bg-gray-600', 'dark:hover:bg-gray-500', 'dark:text-white');
        } else {
             prevButton.classList.add('bg-gray-200', 'hover:bg-gray-300', 'text-gray-700');
        }
        prevButton.addEventListener('click', prevButtonCallback);
        window.domRefsLogic.modalStepNavigationContainer.appendChild(prevButton);
        window.domRefsLogic.modalStepNavigationContainer.classList.remove('hidden');
    } else {
        window.domRefsLogic.modalStepNavigationContainer.classList.add('hidden');
    }

    const hasAction = actionButtonText && typeof actionCallback === 'function';
    const hasPrev = showPrevButton && typeof prevButtonCallback === 'function';
    window.domRefsLogic.modalActionsContainer.classList.toggle('hidden', !hasAction && !showCancelButton && !hasPrev);
    
    // Ensure the modal is properly shown with both CSS classes and inline styles
    window.domRefsLogic.modalPlaceholder.classList.remove('hidden');
    if (window.domRefsLogic.modalPlaceholder.style) {
        window.domRefsLogic.modalPlaceholder.style.display = 'flex';
        window.domRefsLogic.modalPlaceholder.style.opacity = '1';
        window.domRefsLogic.modalPlaceholder.style.pointerEvents = 'auto';
    }
    
    // Reset pointer events on close buttons
    if (window.domRefsLogic.modalCloseButtonX) {
        window.domRefsLogic.modalCloseButtonX.style.pointerEvents = 'auto';
    }
    if (window.domRefsLogic.modalCloseButton) {
        window.domRefsLogic.modalCloseButton.style.pointerEvents = 'auto';
    }
      void window.domRefsLogic.modalCard.offsetWidth; // Forceer reflow
    window.domRefsLogic.modalCard.classList.remove('opacity-0', 'scale-95');
    window.domRefsLogic.modalCard.classList.add('opacity-100', 'scale-100');
}

/**
 * Sluit de actieve modal.
 */
function closeModal() {
    console.log("[VerlofroosterModalLogic] Sluiten modal...");
    if (!window.domRefsLogic || !window.domRefsLogic.modalPlaceholder || !window.domRefsLogic.modalCard) { 
        console.error("[VerlofroosterModalLogic] Modal DOM elementen (of domRefsLogic) niet gevonden voor sluiten!");
        return;
    }
    
    // Immediately add fade-out classes
    window.domRefsLogic.modalCard.classList.add('opacity-0', 'scale-95');
    window.domRefsLogic.modalCard.classList.remove('opacity-100', 'scale-100');
    
    // Immediately apply opacity style to help hide the modal
    if (window.domRefsLogic.modalPlaceholder) {
        window.domRefsLogic.modalPlaceholder.style.opacity = '0';
    }
    
    // Force all close buttons to be non-interactive during animation
    if (window.domRefsLogic.modalCloseButtonX) window.domRefsLogic.modalCloseButtonX.style.pointerEvents = 'none';
    if (window.domRefsLogic.modalCloseButton) window.domRefsLogic.modalCloseButton.style.pointerEvents = 'none';
    if (window.domRefsLogic.modalPlaceholder) window.domRefsLogic.modalPlaceholder.style.pointerEvents = 'none';
    
    setTimeout(() => {
        if (window.domRefsLogic.modalPlaceholder) {
            window.domRefsLogic.modalPlaceholder.classList.add('hidden');
            window.domRefsLogic.modalPlaceholder.style.display = 'none';
            window.domRefsLogic.modalPlaceholder.style.opacity = '0';
            // Re-enable pointer events
            window.domRefsLogic.modalPlaceholder.style.pointerEvents = 'auto';
        }
        
        // Re-enable close buttons
        if (window.domRefsLogic.modalCloseButtonX) window.domRefsLogic.modalCloseButtonX.style.pointerEvents = 'auto';
        if (window.domRefsLogic.modalCloseButton) window.domRefsLogic.modalCloseButton.style.pointerEvents = 'auto';
        
        // Clear content and remove specific modal classes
        if (window.domRefsLogic.modalContent) {
            window.domRefsLogic.modalContent.innerHTML = ''; 
            window.domRefsLogic.modalContent.classList.remove('verlof-modal-body'); // Remove class specific to verlof modal
        }
        if (window.domRefsLogic.modalTitle) window.domRefsLogic.modalTitle.textContent = 'Modal Titel'; 
        
        // Reset state
        window.currentModalActionCallback = null; 
        window.huidigeRegistratieStap = 1; 
        window.registratieFormDataStap1 = {};        // Reset zittingVrijModalGeselecteerdeMedewerker indien deze bestaat
        if (window.zittingVrijModalGeselecteerdeMedewerker) {
            window.zittingVrijModalGeselecteerdeMedewerker = { gebruikersnaam: null, displayName: null };
        }
    }, 200); 
}

// --- Registratie Modal Functies ---
function openRegistratieModal() {
    console.log("[VerlofroosterModalLogic] Opening registratie modal stap 1");
    
    // Initialize state variables
    window.huidigeRegistratieStap = 1;
    window.registratieFormData = {};
    
    // Load required data first
    loadRegistrationData();
    
    // Render first step
    const modalContentHtml = renderRegistratieModalStap1();
    
    // Open the modal with the first step form
    openModal(
        'Registratie - Stap 1 van 2',
        modalContentHtml,
        'Volgende',
        () => {
            // Validate and process step 1 form
            const form = document.getElementById('registratie-form-stap1');
            if (!form) {
                console.error("[VerlofroosterModalLogic] Registratie form stap 1 niet gevonden");
                return;
            }
            
            // Validate the form
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            // Store step 1 data
            const formData = new FormData(form);
            window.registratieFormData = Object.fromEntries(formData.entries());
            
            // Normalize and merge name components
            if (window.registratieFormData.voornaam) {
                let fullName = window.registratieFormData.voornaam;
                if (window.registratieFormData.tussenvoegsel && window.registratieFormData.tussenvoegsel.trim() !== '') {
                    fullName += ' ' + window.registratieFormData.tussenvoegsel;
                }
                if (window.registratieFormData.achternaam) {
                    fullName += ' ' + window.registratieFormData.achternaam;
                }
                window.registratieFormData.Naam = fullName;
            }
            
            // Normalize username if needed
            if (window.registratieFormData.username && window.registratieFormData.username.includes('|')) {
                const parts = window.registratieFormData.username.split('|');
                if (parts.length > 1) {
                    window.registratieFormData.username = parts[1].trim();
                }
            }
            
            // Go to step 2
            navigateToRegistratieStap(2);
        },
        true, // Show cancel button
        false, // No previous button needed for step 1
        null,
        'max-w-2xl' // Make modal larger
    );
    
    // Set initial values if available
    setTimeout(() => {
        // Apply dark theme to the modal
        applyDarkThemeToModal();
        
        if (window.huidigeGebruiker) {
            // Set username from SharePoint
            const usernameField = document.getElementById('registratie-username');
            if (usernameField && window.huidigeGebruiker.loginNaam) {
                let normalizedUsername = window.huidigeGebruiker.loginNaam;
                
                // Normalize the username format if it contains org\username or similar
                if (normalizedUsername.includes('|')) {
                    const parts = normalizedUsername.split('|');
                    if (parts.length > 1) {
                        normalizedUsername = parts[1].trim();
                    }
                }
                
                usernameField.value = normalizedUsername;
            }
            
            // Set email from SharePoint
            const emailField = document.getElementById('registratie-email');
            if (emailField && window.huidigeGebruiker.Email) { // This was the bug, SP uses E_x002d_mail
                emailField.value = window.huidigeGebruiker.Email; // Corrected below if SP object has it
            }
            // Attempt to access email using the correct internal name from configLijst.js
            // Assuming 'huidigeGebruiker' is an object directly from SharePoint item
            // and its properties match the 'interneNaam' from your config.
            if (emailField && window.huidigeGebruiker && typeof window.huidigeGebruiker['E_x002d_mail'] !== 'undefined') {
                emailField.value = window.huidigeGebruiker['E_x002d_mail'];            } else if (emailField && window.huidigeGebruiker && window.huidigeGebruiker.Email) {
                // Fallback of als de structuur anders is, log het.
                console.warn("[VerlofroosterModalLogic] Kon 'E_x002d_mail' niet vinden op huidigeGebruiker, probeer 'Email'. Dit kan een fout veroorzaken.");
                emailField.value = window.huidigeGebruiker.Email;
            }

        } else {
            console.warn("[VerlofroosterModalLogic] huidigeGebruiker not available, cannot set username/email");
            
            // For testing purposes, set some dummy values
            const usernameField = document.getElementById('registratie-username');
            const emailField = document.getElementById('registratie-email');
            
            if (usernameField && !usernameField.value) {
                usernameField.value = "org\\testuser";
            }
            
            if (emailField && !emailField.value) {
                emailField.value = "test@example.com";
            }
        }
    }, 300);
}

function loadRegistrationData() {
    console.log("[VerlofroosterModalLogic] Laden registratiegegevens (relying on pre-loaded data)...");

    // Controleer of we de teamgegevens al hebben (via window.alleTeams)
    if (!window.alleTeams || window.alleTeams.length === 0) {
        console.warn("[VerlofroosterModalLogic] Teams data (window.alleTeams) nog niet beschikbaar of leeg. Team dropdown zal beperkt zijn.");
    } else {
        console.log(`[VerlofroosterModalLogic] ${window.alleTeams.length} teams gevonden in window.alleTeams.`);
        // verversTeamDropdown() zal window.alleTeams gebruiken
    }
    verversTeamDropdown(); // Roep altijd aan, het zal omgaan met lege data

    // Controleer of we de functiegegevens al hebben (via window.alleKeuzelijstFuncties)
    if (!window.alleKeuzelijstFuncties || window.alleKeuzelijstFuncties.length === 0) {
        console.warn("[VerlofroosterModalLogic] Functies data (window.alleKeuzelijstFuncties) nog niet beschikbaar of leeg. Functie dropdown zal beperkt zijn.");
    } else {
        console.log(`[VerlofroosterModalLogic] ${window.alleKeuzelijstFuncties.length} functies gevonden in window.alleKeuzelijstFuncties.`);
        // verversFunctieDropdown() zal window.alleKeuzelijstFuncties gebruiken
    }
    verversFunctieDropdown(); // Roep altijd aan, het zal omgaan met lege data
}

/**
 * Hulpfunctie om de team dropdown in het registratieformulier bij te werken.
 */
function verversTeamDropdown() {
    const teamSelect = document.getElementById('registratie-team');
    if (teamSelect && window.alleTeams && window.alleTeams.length > 0) {
        // Huidige waarde bewaren
        const huidigeWaarde = teamSelect.value;
        
        // Opties genereren
        let teamsOpties = '<option value="">-- Selecteer uw team --</option>';
        window.alleTeams.forEach(team => {
            if (team && typeof team.Naam === 'string') {
                const geselecteerd = team.Naam === huidigeWaarde ? ' selected' : '';
                teamsOpties += `<option value="${escapeHTML(team.Naam)}"${geselecteerd}>${escapeHTML(team.Naam)}</option>`;
            }
        });
        
        // Update dropdown
        teamSelect.innerHTML = teamsOpties;
    }
}

/**
 * Hulpfunctie om de functie dropdown in het registratieformulier bij te werken.
 */
function verversFunctieDropdown() {
    const functieSelect = document.getElementById('registratie-functie');
    if (functieSelect && window.alleKeuzelijstFuncties && window.alleKeuzelijstFuncties.length > 0) {
        // Huidige waarde bewaren
        const huidigeWaarde = functieSelect.value;
        
        // Opties genereren
        let functiesOpties = '<option value="">-- Selecteer uw functie --</option>';
        window.alleKeuzelijstFuncties.forEach(functie => {
            if (functie && typeof functie.Title === 'string') {
                const geselecteerd = functie.Title === huidigeWaarde ? ' selected' : '';
                functiesOpties += `<option value="${escapeHTML(functie.Title)}"${geselecteerd}>${escapeHTML(functie.Title)}</option>`;
            }
        });
        
        // Update dropdown
        functieSelect.innerHTML = functiesOpties;
    }
}

function renderRegistratieModalStap1() {
    // Get teams for dropdown if available
    let teamsOpties = '<option value="">-- Selecteer uw team --</option>';
    
    if (window.alleTeams && window.alleTeams.length > 0) {
        window.alleTeams.forEach(team => {
            if (team && typeof team.Naam === 'string') {
                teamsOpties += `<option value="${escapeHTML(team.Naam)}">${escapeHTML(team.Naam)}</option>`;
            }
        });
    } else {
        console.warn("[VerlofroosterModalLogic] window.alleTeams is leeg of niet gedefinieerd. Team dropdown zal beperkt zijn.");
        // Optionally, add a disabled option: teamsOpties += '<option value="" disabled>Geen teams beschikbaar</option>';
    }
    
    // Get functions for dropdown if available
    let functiesOpties = '<option value="">-- Selecteer uw functie --</option>';
    
    if (window.alleKeuzelijstFuncties && window.alleKeuzelijstFuncties.length > 0) {
        window.alleKeuzelijstFuncties.forEach(functie => {
            if (functie && typeof functie.Title === 'string') {
                functiesOpties += `<option value="${escapeHTML(functie.Title)}">${escapeHTML(functie.Title)}</option>`;
            }
        });
    } else {
        console.warn("[VerlofroosterModalLogic] window.alleKeuzelijstFuncties is leeg of niet gedefinieerd. Functie dropdown zal beperkt zijn.");
        // Optionally, add a disabled option: functiesOpties += '<option value="" disabled>Geen functies beschikbaar</option>';
    }
    
    // Create the step 1 form HTML
    return `
        <form id="registratie-form-stap1" class="space-y-4">
            <div class="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-4">
                <p class="text-blue-800 dark:text-blue-100">Vul uw gegevens in om toegang te krijgen tot het verlofrooster. Na registratie krijgt u toegang tot alle functionaliteiten.</p>
            </div>
            
            <!-- Hidden field for ID (autonumber) -->
            <input type="hidden" id="registratie-id" name="id">
            
            <!-- Name fields (split into components) -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label for="registratie-voornaam" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voornaam <span class="text-red-500">*</span></label>
                    <input type="text" id="registratie-voornaam" name="voornaam" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" required>
                </div>
                <div>
                    <label for="registratie-tussenvoegsel" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tussenvoegsel</label>
                    <input type="text" id="registratie-tussenvoegsel" name="tussenvoegsel" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                </div>
                <div>
                    <label for="registratie-achternaam" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Achternaam <span class="text-red-500">*</span></label>
                    <input type="text" id="registratie-achternaam" name="achternaam" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" required>
                </div>
            </div>
            
            <!-- Username (readonly, from SharePoint) -->
            <div>
                <label for="registratie-username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gebruikersnaam (automatisch) <span class="text-red-500">*</span></label>
                <input type="text" id="registratie-username" name="username" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white" readonly required>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Dit is uw SharePoint gebruikersnaam. Deze wordt automatisch ingevuld.</p>
            </div>
            
            <!-- Email (readonly, from SharePoint) -->
            <div>
                <label for="registratie-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mailadres (automatisch) <span class="text-red-500">*</span></label>
                <input type="email" id="registratie-email" name="E_x002d_mail" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white" readonly required>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Dit is uw SharePoint e-mailadres. Deze wordt automatisch ingevuld.</p>
            </div>
            
            <!-- Team (dropdown) -->
            <div>
                <label for="registratie-team" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team <span class="text-red-500">*</span></label>
                <select id="registratie-team" name="team" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" required>
                    ${teamsOpties}
                </select>
            </div>
            
            <!-- Function (dropdown) -->
            <div>
                <label for="registratie-functie" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Functie <span class="text-red-500">*</span></label>
                <select id="registratie-functie" name="functie" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" required>
                    ${functiesOpties}
                </select>
            </div>
            
            <!-- Additional settings -->
            <div>
                <label class="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input type="checkbox" id="registratie-verbergen" name="verbergen" class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                    <span>Niet weergeven in rooster (verbergen voor anderen)</span>
                </label>
            </div>
            
            <!-- Hidden fields (not visible but still included) -->
            <input type="hidden" id="registratie-horen" name="horen" value="false">
            <input type="hidden" id="registratie-actief" name="actief" value="true">
            <input type="hidden" id="registratie-opmerking" name="opmerking" value="">
            <input type="hidden" id="registratie-opmerking-geldigtot" name="opmerkinggeldigtot" value="">
        </form>
    `;
}

function renderRegistratieModalStap2() {
    // Create the step 2 form HTML
    return `
        <form id="registratie-form-stap2" class="space-y-4">
            <div class="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-4">
                <p class="text-blue-800 dark:text-blue-100">Vul aanvullende gegevens in voor uw registratie.</p>
            </div>
            
            <!-- Birthdate -->
            <div>
                <label for="registratie-geboortedatum" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Geboortedatum <span class="text-red-500">*</span></label>
                <input type="date" id="registratie-geboortedatum" name="geboortedatum" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" required>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Voer uw geboortedatum in (dd-mm-jjjj)</p>
            </div>
            
            <!-- Phone number -->
            <div>
                <label for="registratie-telefoonnummer" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefoonnummer <span class="text-red-500">*</span></label>
                <input type="tel" id="registratie-telefoonnummer" name="telefoonnummer" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                       pattern="^(\\+31|0) ?[1-9](?:[ -]?[0-9]{2}){4}$" 
                       required>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Voer uw telefoonnummer in (bijv. 06 800 88 379 of +316 800 88 379)</p>
            </div>
            
            <!-- Working Hours Section -->
            <div class="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mt-4">
                <h3 class="font-medium text-gray-800 dark:text-gray-200 mb-3">Standaard werktijden</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Geef uw standaard werktijden aan voor elke dag van de week.</p>
                
                <div class="space-y-4">
                    <!-- Monday -->
                    <div>
                        <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Maandag</h4>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="maandag-start" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Start tijd</label>
                                <input type="time" id="maandag-start" name="maandag-start" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                            </div>
                            <div>
                                <label for="maandag-einde" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Eind tijd</label>
                                <input type="time" id="maandag-einde" name="maandag-einde" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                            </div>
                        </div>
                        <div class="mt-2">
                            <label class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <input type="checkbox" id="maandag-vrij" name="maandag-vrij" class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                                <span>Vrije dag</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Tuesday -->
                    <div>
                        <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Dinsdag</h4>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="dinsdag-start" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Start tijd</label>
                                <input type="time" id="dinsdag-start" name="dinsdag-start" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                            </div>
                            <div>
                                <label for="dinsdag-einde" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Eind tijd</label>
                                <input type="time" id="dinsdag-einde" name="dinsdag-einde" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                            </div>
                        </div>
                        <div class="mt-2">
                            <label class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <input type="checkbox" id="dinsdag-vrij" name="dinsdag-vrij" class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                                <span>Vrije dag</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Wednesday -->
                    <div>
                        <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Woensdag</h4>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="woensdag-start" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Start tijd</label>
                                <input type="time" id="woensdag-start" name="woensdag-start" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                            </div>
                            <div>
                                <label for="woensdag-einde" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Eind tijd</label>
                                <input type="time" id="woensdag-einde" name="woensdag-einde" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                            </div>
                        </div>
                        <div class="mt-2">
                            <label class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <input type="checkbox" id="woensdag-vrij" name="woensdag-vrij" class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                                <span>Vrije dag</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Thursday -->
                    <div>
                        <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Donderdag</h4>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="donderdag-start" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Start tijd</label>
                                <input type="time" id="donderdag-start" name="donderdag-start" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                            </div>
                            <div>
                                <label for="donderdag-einde" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Eind tijd</label>
                                <input type="time" id="donderdag-einde" name="donderdag-einde" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                            </div>
                        </div>
                        <div class="mt-2">
                            <label class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <input type="checkbox" id="donderdag-vrij" name="donderdag-vrij" class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                                <span>Vrije dag</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Friday -->
                    <div>
                        <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Vrijdag</h4>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="vrijdag-start" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Start tijd</label>
                                <input type="time" id="vrijdag-start" name="vrijdag-start" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                            </div>
                            <div>
                                <label for="vrijdag-einde" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Eind tijd</label>
                                <input type="time" id="vrijdag-einde" name="vrijdag-einde" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                            </div>
                        </div>
                        <div class="mt-2">
                            <label class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <input type="checkbox" id="vrijdag-vrij" name="vrijdag-vrij" class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                                <span>Vrije dag</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Hears requests option -->
            <div>
                <label class="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input type="checkbox" id="registratie-horen-zichtbaar" name="horen-zichtbaar" class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                    <span>Beschikbaar voor horen (groen oor icoon zichtbaar in rooster)</span>
                </label>
            </div>
        </form>
    `;
}

function navigateToRegistratieStap(stapNummer) {
    window.huidigeRegistratieStap = stapNummer;
    
    if (stapNummer === 1) {
        // Going back to step 1
        const modalContentHtml = renderRegistratieModalStap1();
        
        window.domRefsLogic.modalTitle.textContent = 'Registratie - Stap 1 van 2';
        window.domRefsLogic.modalContent.innerHTML = modalContentHtml;
        
        // Update buttons
        window.domRefsLogic.modalActionButton.textContent = 'Volgende';
        window.domRefsLogic.modalStepNavigationContainer.classList.add('hidden');
        
        // Restore previously entered values
        setTimeout(() => {
            if (window.registratieFormData) {
                // Restore form data for step 1
                Object.entries(window.registratieFormData).forEach(([key, value]) => {
                    const field = document.getElementById(`registratie-${key}`);
                    if (field) {
                        if (field.type === 'checkbox') {
                            field.checked = value === 'true' || value === true;
                        } else {
                            field.value = value;
                        }
                    }
                });
            }
            
            // Update callback for the action button
            window.currentModalActionCallback = () => {
                const form = document.getElementById('registratie-form-stap1');
                if (!form) {
                    console.error("[VerlofroosterModalLogic] Registratie form stap 1 niet gevonden");
                    return;
                }
                
                // Validate the form
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }
                
                // Store step 1 data
                const formData = new FormData(form);
                const newData = Object.fromEntries(formData.entries());
                
                // Merge with existing data
                window.registratieFormData = { ...window.registratieFormData, ...newData };
                
                // Normalize and merge name components
                if (window.registratieFormData.voornaam) {
                    let fullName = window.registratieFormData.voornaam;
                    if (window.registratieFormData.tussenvoegsel && window.registratieFormData.tussenvoegsel.trim() !== '') {
                        fullName += ' ' + window.registratieFormData.tussenvoegsel;
                    }
                    if (window.registratieFormData.achternaam) {
                        fullName += ' ' + window.registratieFormData.achternaam;
                    }
                    window.registratieFormData.Naam = fullName;
                }
                
                // Go to step 2
                navigateToRegistratieStap(2);
            };
            
            applyDarkThemeToModal();
        }, 100);
        
    } else if (stapNummer === 2) {
        // Going to step 2
        const modalContentHtml = renderRegistratieModalStap2();
        
        window.domRefsLogic.modalTitle.textContent = 'Registratie - Stap 2 van 2';
        window.domRefsLogic.modalContent.innerHTML = modalContentHtml;
        
        // Update buttons
        window.domRefsLogic.modalActionButton.textContent = 'Registreren';
        
        // Add previous button
        window.domRefsLogic.modalStepNavigationContainer.innerHTML = '';
        const prevButton = document.createElement('button');
        prevButton.id = 'modal-prev-step-button';
        prevButton.textContent = 'Vorige';
        prevButton.className = 'modal-button-secondary py-2 px-4 rounded-lg text-sm shadow hover:shadow-md transition-all';
        
        // Apply theme to button
        if (document.body.classList.contains('dark-theme')) {
            prevButton.classList.add('dark:bg-gray-600', 'dark:hover:bg-gray-500', 'dark:text-white');
        } else {
            prevButton.classList.add('bg-gray-200', 'hover:bg-gray-300', 'text-gray-700');
        }
        
        prevButton.addEventListener('click', () => navigateToRegistratieStap(1));
        window.domRefsLogic.modalStepNavigationContainer.appendChild(prevButton);
        window.domRefsLogic.modalStepNavigationContainer.classList.remove('hidden');
        
        // Restore previously entered values
        setTimeout(() => {
            if (window.registratieFormData) {
                // Restore form data for step 2
                Object.entries(window.registratieFormData).forEach(([key, value]) => {
                    const field = document.getElementById(`registratie-${key}`);
                    if (field) {
                        if (field.type === 'checkbox') {
                            field.checked = value === 'true' || value === true;
                        } else {
                            field.value = value;
                        }
                    }
                });
                
                // Set defaults for work time fields if not already set
                if (!window.registratieFormData['maandag-start']) {
                    document.getElementById('maandag-start').value = '08:00';
                    document.getElementById('maandag-einde').value = '17:00';
                    document.getElementById('dinsdag-start').value = '08:00';
                    document.getElementById('dinsdag-einde').value = '17:00';
                    document.getElementById('woensdag-start').value = '08:00';
                    document.getElementById('woensdag-einde').value = '17:00';
                    document.getElementById('donderdag-start').value = '08:00';
                    document.getElementById('donderdag-einde').value = '17:00';
                    document.getElementById('vrijdag-start').value = '08:00';
                    document.getElementById('vrijdag-einde').value = '17:00';
                }
            }
            
            // Set up phone number formatting
            const phoneInput = document.getElementById('registratie-telefoonnummer');
            if (phoneInput) {
                phoneInput.addEventListener('input', (e) => {
                    // Format phone number as user types
                    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    
                    if (value.startsWith('31')) {
                        // Format as +31 format
                        if (value.length > 2) {
                            // Add the plus sign and insert spaces
                            value = '+31 ' + value.substring(2, 3) + 
                                (value.length > 3 ? ' ' + value.substring(3, 6) : '') +
                                (value.length > 6 ? ' ' + value.substring(6, 8) : '') +
                                (value.length > 8 ? ' ' + value.substring(8) : '');
                        }
                    } else if (value.startsWith('0')) {
                        // Format as 06 format
                        if (value.length > 1) {
                            // Keep the leading 0 and insert spaces
                            value = '0' + value.substring(1, 2) + 
                                (value.length > 2 ? ' ' + value.substring(2, 5) : '') +
                                (value.length > 5 ? ' ' + value.substring(5, 7) : '') +
                                (value.length > 7 ? ' ' + value.substring(7) : '');
                        }
                    }
                    
                    e.target.value = value;
                });
            }
            
            // Set up checkbox event listeners for free days
            const weekdays = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag'];
            weekdays.forEach(day => {
                const checkbox = document.getElementById(`${day}-vrij`);
                const startInput = document.getElementById(`${day}-start`);
                const endInput = document.getElementById(`${day}-einde`);
                
                if (checkbox && startInput && endInput) {
                    checkbox.addEventListener('change', (e) => {
                        if (e.target.checked) {
                            // If marked as free day, disable time inputs
                            startInput.disabled = true;
                            endInput.disabled = true;
                            startInput.value = '';
                            endInput.value = '';
                        } else {
                            // If not a free day, enable time inputs with default values
                            startInput.disabled = false;
                            endInput.disabled = false;
                            startInput.value = '08:00';
                            endInput.value = '17:00';
                        }
                    });
                }
            });
            
            applyDarkThemeToModal();
        }, 100);
    }
}

// --- Registratie Modal Submit Functie ---
async function handleRegistratieSubmit() {
    console.log("[VerlofroosterModalLogic] Registratie indienen...");
    const submitButton = document.getElementById('modal-action-button');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Bezig met registreren...';
    }
    
    // Bepaal het item type op basis van de lijst
    const itemType = medewerkersConfig.lijstTitel === 'tbl_Medewerkers' ? 'tbl_Medewerkers' : 'tbl_ExterneToegang';
    
    // Voorbeeld itemData, pas aan op basis van uw formulierstructuur
    const itemData = {
        "__metadata": { "type": `SP.Data.${itemType}ListItem` },
        "Voornaam": window.registratieFormData.voornaam,
        "Achternaam": window.registratieFormData.achternaam,
        "Tussenvoegsel": window.registratieFormData.tussenvoegsel || null,
        "Email": window.registratieFormData.email,
        "Username": window.registratieFormData.username,
        "Team": window.registratieFormData.team,
        "Functie": window.registratieFormData.functie,
        "Actief": true,
        "Verbergen": window.registratieFormData.verbergen === 'on' || window.registratieFormData.verbergen === true,
        "Horen": window.registratieFormData.horen === 'on' || window.registratieFormData.horen === true,
        "Geboortedatum": window.registratieFormData.geboortedatum ? new Date(window.registratieFormData.geboortedatum).toISOString() : null,
        "Telefoonnummer": window.registratieFormData.telefoonnummer,
        "Maandag_x002d_start": window.registratieFormData['maandag-start'] || null,
        "Maandag_x002d_einde": window.registratieFormData['maandag-einde'] || null,
        "Dinsdag_x002d_start": window.registratieFormData['dinsdag-start'] || null,
        "Dinsdag_x002d_einde": window.registratieFormData['dinsdag-einde'] || null,
        "Woensdag_x002d_start": window.registratieFormData['woensdag-start'] || null,
        "Woensdag_x002d_einde": window.registratieFormData['woensdag-einde'] || null,
        "Donderdag_x002d_start": window.registratieFormData['donderdag-start'] || null,
        "Donderdag_x002d_einde": window.registratieFormData['donderdag-einde'] || null,
        "Vrijdag_x002d_start": window.registratieFormData['vrijdag-start'] || null,
        "Vrijdag_x002d_einde": window.registratieFormData['vrijdag-einde'] || null,
        "Opmerking": window.registratieFormData.opmerking || null,
        "OpmerkingGeldigTot": window.registratieFormData.opmerkinggeldigtot ? new Date(window.registratieFormData.opmerkinggeldigtot).toISOString() : null
    };
    
    // Verwijder null/undefined velden om problemen met SharePoint te voorkomen
    for (const key in itemData) {
        if (itemData[key] === null || typeof itemData[key] === 'undefined') {
            delete itemData[key];
        }
    }
    // Specifiek voor boolean velden, zorg dat ze als boolean worden gestuurd als ze bestaan
    if (typeof itemData.Actief !== 'undefined') itemData.Actief = Boolean(itemData.Actief);
    if (typeof itemData.Verbergen !== 'undefined') itemData.Verbergen = Boolean(itemData.Verbergen);
    if (typeof itemData.Horen !== 'undefined') itemData.Horen = Boolean(itemData.Horen);


    console.log("[VerlofroosterModalLogic] Data die naar SharePoint wordt gestuurd:", JSON.stringify(itemData, null, 2));

    try {            // Zorg ervoor dat 'getWebAbsoluteUrl()' en 'getRequestDigest()' correct zijn geïmplementeerd en beschikbaar.
        
        let webUrl;
        if (typeof getWebAbsoluteUrl === 'function') {
            console.log("[VerlofroosterModalLogic] Poging om getWebAbsoluteUrl functie te gebruiken.");
            try {
                const result = getWebAbsoluteUrl();
                if (result && typeof result.then === 'function') { // Check if it's a Promise
                    webUrl = await result;
                } else {
                    webUrl = result;
                }
                if (webUrl) {
                    console.log("[VerlofroosterModalLogic] Successfully obtained webUrl from getWebAbsoluteUrl:", webUrl);
                } else {
                    // If getWebAbsoluteUrl exists but returns falsy, log and proceed to REST fallback
                    console.log("[VerlofroosterModalLogic] getWebAbsoluteUrl did not return a valid URL. Falling back to REST API.");
                }
            } catch (error) {
                console.error("[VerlofroosterModalLogic] Error calling getWebAbsoluteUrl:", error, "Falling back to REST API.");
                webUrl = null; // Ensure fallback is triggered
            }
        }

        if (!webUrl) { // If getWebAbsoluteUrl was not a function, or it failed, or returned no URL
            if (typeof getWebAbsoluteUrl !== 'function') {
                 console.log("[VerlofroosterModalLogic] getWebAbsoluteUrl function not found. Attempting to fetch web URL via REST API.");
            }
            try {
                let apiUrlForWebSelect;
                if (window.spWebAbsoluteUrl) {
                    // Ensure spWebAbsoluteUrl doesn't have a trailing slash, then add the API path.
                    const baseUrl = window.spWebAbsoluteUrl.endsWith('/') ? window.spWebAbsoluteUrl.slice(0, -1) : window.spWebAbsoluteUrl;
                    apiUrlForWebSelect = `${baseUrl}/_api/web?$select=Url`;
                    console.log(`[VerlofroosterModalLogic] Using window.spWebAbsoluteUrl to construct API URL for fetching site's own URL: ${apiUrlForWebSelect}`);
                } else {
                    console.warn("[VerlofroosterModalLogic] window.spWebAbsoluteUrl is not available. Attempting REST API call with a relative path for _api/web, which is likely to fail if not at site root.");
                    apiUrlForWebSelect = "_api/web?$select=Url"; // This was the path causing 404
                }

                const response = await fetch(apiUrlForWebSelect, {
                    method: "GET",
                    headers: { "Accept": "application/json;odata=verbose" }
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`[VerlofroosterModalLogic] Failed to fetch web URL via REST (${apiUrlForWebSelect}): ${response.status} ${response.statusText}`, errorText);
                    throw new Error(`Failed to fetch web URL via REST: ${response.statusText} - ${errorText}`);
                }
                const data = await response.json();
                if (data && data.d && data.d.Url) {
                    webUrl = data.d.Url;
                    console.log("[VerlofroosterModalLogic] Successfully fetched webUrl via REST:", webUrl);
                } else {
                    console.error("[VerlofroosterModalLogic] Web URL not found in REST response for _api/web?$select=Url:", data);
                    throw new Error("Web URL not found in REST response for _api/web?$select=Url");
                }            } catch (error) {
                console.error("[VerlofroosterModalLogic] Critical error fetching web absolute URL via REST as fallback:", error);
                toonModalNotificatie(`Fout bij ophalen website URL: ${error.message}. Registratie gestopt.`, "error", 10000);
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Registreren';
                }
                return; // Abort if REST call fails, as webUrl is critical
            }
        }

        // Final check: if webUrl is still not determined, abort.
        if (!webUrl) {
            console.error("[VerlofroosterModalLogic] Web URL could not be determined after all attempts. Aborting registration.");
            toonNotificatie("Kritieke fout: Website URL is niet beschikbaar. Registratie afgebroken.", "error", 10000);
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Registreren';
            }
            return;
        }
        
        // Controleer of createListItem beschikbaar is
        if (typeof createListItem === 'function') {
            await createListItem(medewerkersConfig.lijstTitel, itemData, webUrl);
            
            console.log("[VerlofroosterModalLogic] Registratie succesvol!");
            toonNotificatie("Registratie succesvol! U kunt nu het verlofrooster gebruiken.", "success", 7000);
            closeModal();
            
            // Optioneel: ververs de pagina of laad de gebruikersdata opnieuw
            if (typeof initializeVerlofrooster === 'function') {
                initializeVerlofrooster(); // Herlaad de hoofdapplicatie data
            } else {
                location.reload(); // Fallback: herlaad de pagina
            }
        } else {
            console.error("[VerlofroosterModalLogic] Functie 'createListItem' is niet gedefinieerd. Kan item niet aanmaken.");
            toonNotificatie("Kritieke Fout: Registratie functie 'createListItem' niet gevonden. Neem contact op met de beheerder.", "error", 10000);
        }

    } catch (error) {
        console.error("[VerlofroosterModalLogic] Fout bij registratie:", error);
        let errorMessage = "Er is een onbekende fout opgetreden bij de registratie.";
        if (error && error.message) {
            // Probeer een meer specifieke SharePoint foutmelding te extraheren
            try {
                const errorObj = JSON.parse(error.message);
                if (errorObj && errorObj["odata.error"] && errorObj["odata.error"].message && errorObj["odata.error"].message.value) {
                    errorMessage = `Fout bij registratie: ${errorObj["odata.error"].message.value}. Probeer het opnieuw.`;
                } else {
                    errorMessage = `Fout bij registratie: ${error.message}. Probeer het opnieuw.`;
                }
            } catch (e) {
                // Als het parsen van de error message faalt, gebruik de originele message
                errorMessage = `Fout bij registratie: ${error.message}. Probeer het opnieuw.`;
            }
        }
        
        toonNotificatie(errorMessage, "error", 10000); // Toon voor 10 seconden
    } finally {
        // Herstel de submit knop
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Registreren';
        }
    }
}

/**
 * Creates a new list item in a SharePoint list using REST API.
 * @param {string} listTitle - The title of the SharePoint list.
 * @param {object} itemData - The data for the new list item. Must include __metadata.type.
 * @param {string} webUrl - The absolute URL of the SharePoint site.
 * @returns {Promise<object>} A promise that resolves with the created item data.
 */
async function createListItem(listTitle, itemData, webUrl) {
    console.log(`[VerlofroosterModalLogic - createListItem] Attempting to create item in list: ${listTitle} at ${webUrl}`);
    
    // 1. Get Request Digest
    const contextInfoUrl = `${webUrl}/_api/contextinfo`;
    let formDigestValue;
    try {
        console.log(`[VerlofroosterModalLogic - createListItem] Fetching request digest from: ${contextInfoUrl}`);
        const contextInfoResponse = await fetch(contextInfoUrl, {
            method: "POST",
            headers: {
                "Accept": "application/json;odata=verbose"
            }
        });
        if (!contextInfoResponse.ok) {
            const errorText = await contextInfoResponse.text();
            console.error(`[VerlofroosterModalLogic - createListItem] Failed to get request digest: ${contextInfoResponse.status} ${contextInfoResponse.statusText}`, errorText);
            throw new Error(`Failed to get request digest: ${contextInfoResponse.statusText} - ${errorText}`);
        }
        const contextInfoData = await contextInfoResponse.json();
        formDigestValue = contextInfoData.d.GetContextWebInformation.FormDigestValue;
        console.log("[VerlofroosterModalLogic - createListItem] Successfully fetched request digest.");
    } catch (error) {
        console.error("[VerlofroosterModalLogic - createListItem] Error fetching request digest:", error);
        throw error; // Re-throw to be caught by caller
    }

    // 2. Create List Item
    const itemsUrl = `${webUrl}/_api/web/lists/getbytitle('${listTitle}')/items`;
    try {
        console.log(`[VerlofroosterModalLogic - createListItem] Creating item at: ${itemsUrl} with digest: ${formDigestValue ? 'obtained' : 'MISSING'}`);
        const createResponse = await fetch(itemsUrl, {
            method: "POST",
            headers: {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": formDigestValue
            },
            body: JSON.stringify(itemData)
        });

        if (!createResponse.ok) {
            let errorDetail = 'Unknown error during item creation.';
            try {
                const errorData = await createResponse.json(); 
                if (errorData && errorData.error && errorData.error.message && errorData.error.message.value) {
                    errorDetail = errorData.error.message.value;
                }
            } catch (e) {
                // If parsing error response fails, use the status text
                errorDetail = await createResponse.text();
            }
            console.error(`[VerlofroosterModalLogic - createListItem] Failed to create list item: ${createResponse.status} ${createResponse.statusText}`, errorDetail);
            throw new Error(`Failed to create list item: ${createResponse.statusText} - ${errorDetail}`);
        }
        console.log("[VerlofroosterModalLogic - createListItem] Successfully created list item.");
        return await createResponse.json(); 
    } catch (error) {
        console.error("[VerlofroosterModalLogic - createListItem] Error creating list item:", error);
        throw error; // Re-throw to be caught by caller
    }
}

/**
 * Hulpfunctie om notificaties te tonen. Gebruikt de globale toonNotificatie functie indien beschikbaar,
 * anders valt terug op een eenvoudige implementatie.
 * @param {string} bericht - Het te tonen bericht.
 * @param {string} type - Het type notificatie: 'success', 'warning', 'error', of 'info'.
 * @param {number} autoHideDelay - Tijd in milliseconden voordat de notificatie automatisch verdwijnt. 0 voor geen auto-hide.
 */
function toonModalNotificatie(bericht, type = 'info', autoHideDelay = 5000) {
    // Gebruik de globale toonNotificatie functie indien beschikbaar
    if (typeof window.toonNotificatie === 'function') {
        window.toonNotificatie(bericht, type, autoHideDelay);
    } else {
        // Eenvoudige fallback met console log en optioneel alert
        console.log(`[VerlofroosterModalLogic] Notificatie (${type}): ${bericht}`);
        
        // Toon alleen alerts voor foutmeldingen om de gebruiker niet lastig te vallen
        if (type === 'error') {
            alert(bericht);
        }
    }
}

// Maak alle benodigde functies globaal beschikbaar
window.initializeVerlofroosterModals = initializeVerlofroosterModals;
window.openRegistratieModal = openRegistratieModal;
window.renderRegistratieModalStap1 = renderRegistratieModalStap1;
window.renderRegistratieModalStap2 = renderRegistratieModalStap2;
window.navigateToRegistratieStap = navigateToRegistratieStap;
window.handleRegistratieSubmit = handleRegistratieSubmit;
window.openVerlofAanvraagModal = openVerlofAanvraagModal;
window.openCompensatieModal = openCompensatieUrenModal; // Corrected: Use openCompensatieUrenModal
window.openZittingVrijModal = openAdminZittingVrijModal; // Corrected: Use openAdminZittingVrijModal
window.toonModalNotificatie = toonModalNotificatie; // Als deze globaal nodig is

// Exposeer de belangrijkste functies voor globaal gebruik
window.openModal = openModal;
window.closeModal = closeModal;
window.initializeVerlofroosterModals = initializeVerlofroosterModals;
window.openRegistratieModal = openRegistratieModal;
window.openVerlofAanvraagModal = openVerlofAanvraagModal;
window.openCompensatieModal = openCompensatieModal;
window.openZittingVrijModal = openZittingVrijModal;
window.toonModalNotificatie = toonModalNotificatie; // Als deze globaal nodig is

// Log aan dat het script volledig is geladen
console.log("[VerlofroosterModalLogic] Alle modale functies zijn succesvol geregistreerd in het globale bereik.");

/**
 * Opent een modal voor het aanvragen van verlof.
 * @param {Object} medewerkerGegevens - Informatie over de medewerker die verlof aanvraagt.
 * @param {Date} geselecteerdeDatum - De datum waarvoor verlof wordt aangevraagd.
 */
async function openVerlofAanvraagModal(geselecteerdeDatum, medewerkergegevens) {
    console.log(`[VerlofroosterModalLogic] START openVerlofAanvraagModal. Datum: ${geselecteerdeDatum}, Medewerker:`, medewerkergegevens);

    let usernameIsValid = false;
    if (medewerkergegevens) {
        console.log('[VerlofroosterModalLogic] medewerkergegevens object IS present.');
        console.log('[VerlofroosterModalLogic] Keys in medewerkergegevens:', Object.keys(medewerkergegevens));
        
        if (medewerkergegevens.hasOwnProperty('Username')) {
            console.log('[VerlofroosterModalLogic] medewerkergegevens HAS OWN property "Username".');
            const usernameValue = medewerkergegevens.Username;
            console.log('[VerlofroosterModalLogic] Value of medewerkergegevens.Username:', usernameValue);
            console.log('[VerlofroosterModalLogic] Type of medewerkergegevens.Username:', typeof usernameValue);
            if (usernameValue && typeof usernameValue === 'string' && usernameValue.trim().length > 0) {
                usernameIsValid = true;
                console.log('[VerlofroosterModalLogic] medewerkergegevens.Username is a non-empty string.');
            } else {
                console.log('[VerlofroosterModalLogic] medewerkergegevens.Username is NULL, undefined, empty, or not a string.');
            }
        } else {
            console.log('[VerlofroosterModalLogic] medewerkergegevens does NOT HAVE OWN property "Username".');
            // Check if it's accessible via direct access anyway (e.g. prototype or getter)
            try {
                const usernameValue = medewerkergegevens.Username;
                console.log('[VerlofroosterModalLogic] Attempted direct access medewerkergegevens.Username value:', usernameValue);
                if (usernameValue && typeof usernameValue === 'string' && usernameValue.trim().length > 0) {
                     console.log('[VerlofroosterModalLogic] Direct access to medewerkergegevens.Username yielded a non-empty string (unexpected if hasOwnProperty was false).');
                     // usernameIsValid = true; // Decide if this case should be valid
                } else {
                    console.log('[VerlofroosterModalLogic] Direct access to medewerkergegevens.Username did NOT yield a non-empty string.');
                }
            } catch (e) {
                console.error('[VerlofroosterModalLogic] Error accessing medewerkergegevens.Username directly:', e);
            }
        }
    } else {
        console.log('[VerlofroosterModalLogic] medewerkergegevens object is NOT present (null or undefined).');
    }

    if (!usernameIsValid) {
        console.error('[VerlofroosterModalLogic] Medewerker gegevens (vooral Username) zijn niet beschikbaar of invalid. Kan verlofaanvraag modal niet correct initialiseren. usernameIsValid is false.');
        return;
    }
    console.log('[VerlofroosterModalLogic] Username check passed. Proceeding with modal opening...');

    // Store for later use by initializeVerlofModalForm if needed
    window.zittingVrijModalGeselecteerdeMedewerker = {
        gebruikersnaam: medewerkergegevens.Username,
        displayName: medewerkergegevens.DisplayName || medewerkergegevens.Naam || 'Onbekende medewerker'
    };

    const modalUrl = 'https://som.org.om.local/sites/MulderT/CustomPW/Verlof/cpw/Rooster/pages/meldingVerlof.aspx';
    try {
        console.log('[VerlofroosterModalLogic] Fetching modal content from:', modalUrl);
        const response = await fetch(modalUrl);
        if (!response.ok) {
            console.error(`[VerlofroosterModalLogic] Fout bij ophalen van ${modalUrl}: ${response.status} ${response.statusText}`);
            toonToast(`Kon formulier niet laden: ${response.statusText}`, 'error');
            return;
        }
        const rawHtml = await response.text();
        console.log('[VerlofroosterModalLogic] Successfully fetched modal content.');

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');
        const formElement = doc.querySelector('form#verlof-form'); // ID of the form in meldingVerlof.aspx
        
        if (!formElement) {
            console.error('[VerlofroosterModalLogic] Kon <form id="verlof-form"> niet vinden in de opgehaalde HTML.');
            toonToast('Formulierstructuur onjuist.', 'error');
            return;
        }
        console.log('[VerlofroosterModalLogic] Found form#verlof-form.');

        // The .verlof-modal-body class will be added to window.domRefsLogic.modalContent after openModal is called.
        // Theme classes are handled by applyDarkThemeToModal and the main body class.
        
        let modalContentHtml = formElement.innerHTML;

        // Ensure #modal-notification-area is present for form-specific notifications
        if (!formElement.querySelector('#modal-notification-area')) {
            console.log('[VerlofroosterModalLogic] #modal-notification-area niet gevonden in form, wordt toegevoegd.');
            const notificationArea = document.createElement('div');
            notificationArea.id = 'modal-notification-area';
            formElement.insertBefore(notificationArea, formElement.firstChild);
            modalContentHtml = formElement.innerHTML; // Update HTML after adding
        } else {
            console.log('[VerlofroosterModalLogic] #modal-notification-area al aanwezig in form.');
        }
        
        console.log('[VerlofroosterModalLogic] Modal content HTML prepared.');

        const modalConfig = {
            title: 'Verlof Aanvragen',
            contentHtml: modalContentHtml,
            actionButtonText: 'Aanvraag Indienen',
            actionButtonCallback: async () => {
                console.log('[VerlofroosterModalLogic] Verlof Aanvragen modal action button clicked.');
                if (window.handleVerlofModalFormSubmit) {
                    const success = await window.handleVerlofModalFormSubmit();
                    if (success) {
                        console.log('[VerlofroosterModalLogic] Verlof form submission successful, closing modal.');
                        closeModal();
                        if (typeof laadInitiëleData === 'function') {
                            laadInitiëleData(true); 
                        }
                    } else {
                        console.log('[VerlofroosterModalLogic] Verlof form submission failed, modal remains open.');
                    }
                } else {
                    console.error('[VerlofroosterModalLogic] handleVerlofModalFormSubmit functie niet gevonden.');
                    toonToast('Fout bij verwerken formulier.', 'error');
                }
            },
            customClasses: 'max-w-2xl', 
            onOpen: () => {
                console.log('[VerlofroosterModalLogic] Verlof modal is geopend. Initialiseren van formulier logica...');
                if (window.initializeVerlofModalForm) {
                    window.initializeVerlofModalForm(geselecteerdeDatum, medewerkergegevens);
                    console.log('[VerlofroosterModalLogic] initializeVerlofModalForm aangeroepen.');
                } else {
                    console.error('[VerlofroosterModalLogic] initializeVerlofModalForm functie niet gevonden op window object.');
                    toonToast('Kon formulier niet initialiseren.', 'error');
                }
            }
        };
        console.log('[VerlofroosterModalLogic] Calling openModal with individual arguments derived from config.');
        
        openModal(
            modalConfig.title,
            modalConfig.contentHtml,
            modalConfig.actionButtonText,
            modalConfig.actionButtonCallback,
            true, 
            false, 
            null, 
            modalConfig.customClasses
        );

        // Add the specific class for styling the verlof form content
       
        if (window.domRefsLogic && window.domRefsLogic.modalContent) {
            window.domRefsLogic.modalContent.classList.add('verlof-modal-body');
            console.log('[VerlofroosterModalLogic] Added \'verlof-modal-body\' class to modalContent element.');
        } else {
            console.warn('[VerlofroosterModalLogic] modalContent element not found, cannot add \'verlof-modal-body\' class.');
        }

        if (modalConfig.onOpen && typeof modalConfig.onOpen === 'function') {
            setTimeout(() => {
                 modalConfig.onOpen();
            }, 50); 
        }

    } catch (error) {
        console.error('[VerlofroosterModalLogic] Fout bij het openen van de verlofaanvraag modal:', error);
        toonToast('Er is een fout opgetreden.', 'error');
    }
}

/**
 * Opent een modal voor het registreren van compensatie-uren.
 * @param {Object} medewerkerGegevens - Informatie over de medewerker die compensatie-uren registreert.
 * @param {Date} geselecteerdeDatum - De datum waarvoor compensatie-uren worden geregistreerd.
 */
function openCompensatieUrenModal(medewerkerGegevens, geselecteerdeDatum) {
    console.log("[VerlofroosterModalLogic] Opening compensatie-uren modal voor: ", medewerkerGegevens, "datum:", geselecteerdeDatum);
      
    // Gebruik huidige gebruiker als medewerkerGegevens niet is opgegeven
    if (!medewerkerGegevens && window.huidigeGebruiker) {
        console.log("[VerlofroosterModalLogic] Gebruik huidige gebruiker voor compensatie-uren");
        medewerkerGegevens = {
            Id: window.huidigeGebruiker.medewerkerId,
            Naam: window.huidigeGebruiker.displayName,
            PersoneelsNr: window.huidigeGebruiker.personeelsNummer || '',
            Username: window.huidigeGebruiker.username
        };
    }
    
    // Gebruik huidige datum als geselecteerdeDatum niet is opgegeven
    if (!geselecteerdeDatum) {
        console.log("[VerlofroosterModalLogic] Gebruik huidige datum voor compensatie-uren");
        geselecteerdeDatum = new Date();
    }
    
    // Als er nog steeds geen medewerkergegevens zijn, toon een foutmelding
    if (!medewerkerGegevens) {
        console.error("[VerlofroosterModalLogic] Geen medewerkergegevens beschikbaar voor compensatie-uren modal!");
        toonModalNotificatie("Fout: Geen medewerkergegevens beschikbaar voor compensatie-uren", "error");
        return;
    }
    
    // Formatteer de datum voor weergave
    const datumString = new Date(geselecteerdeDatum).toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Genereer de HTML voor de modal-inhoud
    const modalContentHtml = `
        <form id="compensatie-uren-form" class="space-y-4">
            <div class="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-4">
                <p class="text-blue-800 dark:text-blue-100">U registreert compensatie-uren voor <strong>${datumString}</strong>.</p>
            </div>
            
            <!-- Hidden fields for processing -->
            <input type="hidden" id="compensatie-medewerker-id" name="medewerkerid" value="${medewerkerGegevens.Id || ''}">
            <input type="hidden" id="compensatie-datum" name="datum" value="${geselecteerdeDatum.toISOString().split('T')[0]}">
            
            <!-- Aantal uren -->
            <div>
                <label for="compensatie-aantal-uren" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aantal uren <span class="text-red-500">*</span></label>
                <input type="number" id="compensatie-aantal-uren" name="aantaluren" min="0.5" max="24" step="0.5" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" required>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Voer het aantal uren in (minimum 0.5).</p>
            </div>
            
            <!-- Project / activiteit -->
            <div>
                <label for="compensatie-project" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project/activiteit <span class="text-red-500">*</span></label>
                <input type="text" id="compensatie-project" name="project" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" required>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Voer het project of de activiteit in waarvoor u compensatie-uren heeft gemaakt.</p>
            </div>
            
            <!-- Toelichting -->
            <div>
                <label for="compensatie-toelichting" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Toelichting</label>
                <textarea id="compensatie-toelichting" name="toelichting" rows="3" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"></textarea>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Optionele toelichting bij uw compensatie-uren.</p>
            </div>
        </form>
    `;
    
    // Open de modal
    openModal(
        'Compensatie-uren registreren',
        modalContentHtml,
        'Registreren',
        async () => {
            // Formulier valideren
            const form = document.getElementById('compensatie-uren-form');
            if (!form) {
                console.error("[VerlofroosterModalLogic] Compensatie-uren formulier niet gevonden");
                return;
            }
            
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            // Toon laadstatus
            const actionButton = document.getElementById('modal-action-button');
            if (actionButton) {
                const originalText = actionButton.textContent;
                actionButton.disabled = true;
                actionButton.innerHTML = getSpinnerSvg() + 'Bezig met verwerken...';
                
                // Formuliergegevens verzamelen
                const formData = new FormData(form);
                const compensatieUrenData = Object.fromEntries(formData.entries());
                
                try {
                    // Compensatie-uren verwerken - implementeer hier uw eigen logica                    // Dit kan een API-aanroep of andere functie zijn om de aanvraag te verwerken
                    if (typeof verwerkCompensatieUren === 'function') {
                        await verwerkCompensatieUren(compensatieUrenData);
                        toonModalNotificatie("Compensatie-uren succesvol geregistreerd!", "success");
                        closeModal();
                        
                        // Optioneel: Rooster verversen
                        if (typeof verversRooster === 'function') {
                            verversRooster();
                        }                    } else {
                        console.error("[VerlofroosterModalLogic] Functie 'verwerkCompensatieUren' is niet gedefinieerd.");
                        toonModalNotificatie("Fout: Compensatie-uren kunnen niet worden verwerkt.", "error");
                    }
                } catch (error) {
                    console.error("[VerlofroosterModalLogic] Fout bij verwerken compensatie-uren:", error);
                    toonModalNotificatie(`Fout bij verwerken van compensatie-uren: ${error.message}`, "error");
                } finally {
                    // Herstel de knop
                    if (actionButton) {
                        actionButton.disabled = false;
                        actionButton.innerHTML = originalText;
                    }
                }
            }
        },
        true, // Toon annuleerknop
        false, // Geen vorige knop nodig
        null,
        'max-w-lg' // Grootte van de modal
    );
    
    // Pas donker thema toe indien nodig
    setTimeout(() => {
        applyDarkThemeToModal();
    }, 100);
}

/**
 * Opent een modal voor het beheren van zittingvrije dagen (incidenteel) door beheerders.
 * @param {string|number} personeelsNummer - Personeelsnummer van de medewerker.
 * @param {string} medewerkerNaam - Naam van de medewerker voor wie de zittingvrije dagen worden beheerd.
 * @param {boolean} isBeheerder - Of de huidige gebruiker beheerdersrechten heeft.
 */
function openAdminZittingVrijModal(personeelsNummer, medewerkerNaam, isBeheerder) {
    console.log("[VerlofroosterModalLogic] Opening admin zittingvrij modal voor:", medewerkerNaam, "personeelsnummer:", personeelsNummer, "beheerder:", isBeheerder);
    
    // Gebruik huidige gebruiker als medewerkerNaam niet is opgegeven
    if (!medewerkerNaam && window.huidigeGebruiker) {
        console.log("[VerlofroosterModalLogic] Gebruik huidige gebruiker voor zittingvrij modal");
        medewerkerNaam = window.huidigeGebruiker.displayName;
        personeelsNummer = window.huidigeGebruiker.personeelsNummer || '';
    }
    
    // Stel standaardwaarde in voor isBeheerder als deze niet is opgegeven
    if (isBeheerder === undefined || isBeheerder === null) {
        // Controleer of huidigeGebruiker beheerdersrechten heeft (als dit beschikbaar is)
        if (window.huidigeGebruiker && window.huidigeGebruiker.sharePointGroepen) {
            // Gebruik dezelfde groepen als in verlofrooster_logic.js voor consistentie
            const adminGroups = ["GG VerlofroosterAdmin", "Verlofrooster_Admin"];
            isBeheerder = window.huidigeGebruiker.sharePointGroepen.some(groep => adminGroups.includes(groep));
            console.log("[VerlofroosterModalLogic] Beheerdersstatus afgeleid van gebruikersgroepen:", isBeheerder);
        } else {
            isBeheerder = false;
        }
    }
      
    // Stel standaardwaarden in
    const datumVanaf = new Date();
    const datumString = datumVanaf.toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Sla de geselecteerde medewerker op in een globaal object voor later gebruik
    window.zittingVrijModalGeselecteerdeMedewerker = {
        personeelsNummer: personeelsNummer,
        displayName: medewerkerNaam || "Onbekende medewerker"
    };
    
    // Controleer beheerdersrechten
    if (!isBeheerder) {
        console.warn("[VerlofroosterModalLogic] Gebruiker heeft geen beheerdersrechten voor het beheren van zittingvrije dagen.");
        toonModalNotificatie("U heeft onvoldoende rechten om zittingvrije dagen te beheren.", "warning");
        return;
    }
      // Genereer de HTML voor de modal-inhoud
    const modalContentHtml = `
        <form id="admin-zittingvrij-form" class="space-y-4">
            <div class="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-4">
                <p class="text-blue-800 dark:text-blue-100">U beheert zittingvrije dagen voor <strong>${escapeHTML(window.zittingVrijModalGeselecteerdeMedewerker.displayName)}</strong>.</p>
            </div>
            
            <!-- Hidden fields for processing -->
            <input type="hidden" id="zittingvrij-medewerker-personeelsnummer" name="personeelsnummer" value="${personeelsNummer || ''}">
            <input type="hidden" id="zittingvrij-medewerker-naam" name="medewerkerNaam" value="${medewerkerNaam || ''}">>
            
            <!-- Date range section -->
            <div class="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <h3 class="font-medium text-gray-800 dark:text-gray-200 mb-3">Periode instellen</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="zittingvrij-vanaf" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vanaf <span class="text-red-500">*</span></label>
                        <input type="date" id="zittingvrij-vanaf" name="vanaf" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" required value="${datumVanaf.toISOString().split('T')[0]}">
                    </div>
                    <div>
                        <label for="zittingvrij-tot" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tot en met <span class="text-red-500">*</span></label>
                        <input type="date" id="zittingvrij-tot" name="tot" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" required value="${datumVanaf.toISOString().split('T')[0]}">
                    </div>
                </div>
            </div>
            
            <!-- Recurrence pattern section -->
            <div class="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <h3 class="font-medium text-gray-800 dark:text-gray-200 mb-3">Herhaling</h3>
                
                <div class="space-y-3">
                    <div>
                        <label class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                            <input type="radio" name="herhalingspatroon" value="eenmalig" class="mr-2" checked>
                            Eenmalig (alle dagen in de geselecteerde periode)
                        </label>
                    </div>
                    <div>
                        <label class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                            <input type="radio" name="herhalingspatroon" value="wekelijks" class="mr-2">
                            Wekelijks op dezelfde dag(en)
                        </label>
                    </div>
                </div>
                
                <!-- Days selection (visible when weekly is selected) -->
                <div id="weekdagen-selectie" class="mt-4 hidden">
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Selecteer de dagen van de week:</p>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <label class="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <input type="checkbox" name="weekdag-ma" value="1" class="mr-2">
                            Maandag
                        </label>
                        <label class="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <input type="checkbox" name="weekdag-di" value="2" class="mr-2">
                            Dinsdag
                        </label>
                        <label class="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <input type="checkbox" name="weekdag-wo" value="3" class="mr-2">
                            Woensdag
                        </label>
                        <label class="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <input type="checkbox" name="weekdag-do" value="4" class="mr-2">
                            Donderdag
                        </label>
                        <label class="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <input type="checkbox" name="weekdag-vr" value="5" class="mr-2">
                            Vrijdag
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- Toelichting -->
            <div>
                <label for="zittingvrij-toelichting" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Toelichting</label>
                <textarea id="zittingvrij-toelichting" name="toelichting" rows="3" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"></textarea>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Optionele toelichting bij de zittingvrije dagen (bijv. reden).</p>
            </div>
        </form>
    `;
    
    // Open de modal
    openModal(
        'Zittingvrij (incidenteel) toevoegen - Admin',
        modalContentHtml,
        'Toevoegen',
        async () => {
            // Formulier valideren
            const form = document.getElementById('admin-zittingvrij-form');
            if (!form) {
                console.error("[VerlofroosterModalLogic] Admin zittingvrij formulier niet gevonden");
                return;
            }
            
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            // Toon laadstatus
            const actionButton = document.getElementById('modal-action-button');
            if (actionButton) {
                const originalText = actionButton.textContent;
                actionButton.disabled = true;
                actionButton.innerHTML = getSpinnerSvg() + 'Bezig met verwerken...';
                
                // Formuliergegevens verzamelen
                const formData = new FormData(form);
                const zittingVrijData = Object.fromEntries(formData.entries());
                
                // Voeg informatie toe over geselecteerde weekdagen als wekelijks patroon is gekozen
                if (zittingVrijData.herhalingspatroon === 'wekelijks') {
                    const selectedDays = [];
                    if (formData.get('weekdag-ma')) selectedDays.push(1);
                    if (formData.get('weekdag-di')) selectedDays.push(2);
                    if (formData.get('weekdag-wo')) selectedDays.push(3);
                    if (formData.get('weekdag-do')) selectedDays.push(4);
                    if (formData.get('weekdag-vr')) selectedDays.push(5);
                    
                    zittingVrijData.selectedDays = selectedDays;
                    
                    // Valideer dat minstens één dag is geselecteerd
                    if (selectedDays.length === 0) {
                        toonModalNotificatie("Selecteer minimaal één dag van de week bij wekelijkse herhaling.", "warning");
                        actionButton.disabled = false;
                        actionButton.innerHTML = originalText;
                        return;
                    }
                }
                
                // Valideer datumperiode
                const vanafDatum = new Date(zittingVrijData.vanaf);
                const totDatum = new Date(zittingVrijData.tot);
                
                if (totDatum < vanafDatum) {
                    toonModalNotificatie("De 'tot' datum kan niet vóór de 'vanaf' datum liggen.", "warning");
                    actionButton.disabled = false;
                    actionButton.innerHTML = originalText;
                    return;
                }
                
                try {
                    // Zittingvrij verwerken - implementeer hier uw eigen logica
                    // Dit kan een API-aanroep of andere functie zijn om de aanvraag te verwerken
                    if (typeof verwerkZittingVrijAanvraag === 'function') {
                        await verwerkZittingVrijAanvraag(zittingVrijData);
                        toonModalNotificatie("Zittingvrije dagen succesvol geregistreerd!", "success");
                        closeModal();
                        
                        // Optioneel: Rooster verversen
                        if (typeof verversRooster === 'function') {
                            verversRooster();
                        }
                    } else {
                        console.error("[VerlofroosterModalLogic] Functie 'verwerkZittingVrijAanvraag' is niet gedefinieerd.");
                        toonModalNotificatie("Fout: Zittingvrije dagen kunnen niet worden verwerkt.", "error");
                    }
                } catch (error) {
                    console.error("[VerlofroosterModalLogic] Fout bij verwerken zittingvrije dagen:", error);
                    toonModalNotificatie(`Fout bij verwerken van zittingvrije dagen: ${error.message}`, "error");
                } finally {
                    // Herstel de knop
                    if (actionButton) {
                        actionButton.disabled = false;
                        actionButton.innerHTML = originalText;
                    }
                }
            }
        },
        true, // Toon annuleerknop
        false, // Geen vorige knop nodig
        null,
        'max-w-xl' // Grootte van de modal
    );
    
    // Pas donker thema toe indien nodig
    setTimeout(() => {
        applyDarkThemeToModal();
        
        // Voeg event handler toe voor herhaling radio buttons
        const herhalingspatronenInputs = document.querySelectorAll('input[name="herhalingspatroon"]');
        const weekdagenSelectie = document.getElementById('weekdagen-selectie');
        
        if (herhalingspatronenInputs && weekdagenSelectie) {
            herhalingspatronenInputs.forEach(input => {
                input.addEventListener('change', (e) => {
                    if (e.target.value === 'wekelijks') {
                        weekdagenSelectie.classList.remove('hidden');
                    } else {
                        weekdagenSelectie.classList.add('hidden');
                    }
                });
            });
        }
        
        // Stel de huidige weekdag standaard in bij wekelijks patroon
        const currentDay = datumVanaf.getDay(); // 0 = zondag, 1 = maandag, etc.
        if (currentDay >= 1 && currentDay <= 5) { // Alleen voor werkdagen (ma-vr)
            const dayCheckbox = document.querySelector(`input[name="weekdag-${['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'][currentDay]}"]`);
            if (dayCheckbox) {
                dayCheckbox.checked = true;
            }
        }
    }, 100);
}

// Functie om de modal te tonen (generiek)
// Zorg ervoor dat openModal is gedefinieerd als het verschilt van showModal
// Voor dit voorbeeld ga ik ervan uit dat 'openModal' de primaire functie is die wordt gebruikt.
// Als 'showModal' degene is met volledige parameters, pas de aanroepen dan dienovereenkomstig aan.

/**
 * Hulpfunctie documentatie voor externe functies die worden aangeroepen in deze module.
 * Deze functies moeten geïmplementeerd worden in andere modules of worden geïnjecteerd.
 * 
 * @namespace ExterneFuncties
 */

/**
 * Ververst het rooster met nieuwe gegevens.
 * @function verversRooster
 * @memberof ExterneFuncties
 * @returns {void}
 */

/**
 * Verwerkt een verlofaanvraag op de server.
 * @function verwerkVerlofAanvraag
 * @memberof ExterneFuncties
 * @param {Object} verlofAanvraagData - Gegevens van de verlofaanvraag.
 * @returns {Promise<Object>} - Belofte die resolveert naar het resultaat van de aanvraag.
 */

/**
 * Verwerkt compensatie-uren op de server.
 * @function verwerkCompensatieUren
 * @memberof ExterneFuncties
 * @param {Object} compensatieUrenData - Gegevens van de compensatie-uren.
 * @returns {Promise<Object>} - Belofte die resolveert naar het resultaat van de verwerking.
 */

/**
 * Verwerkt zittingvrije dagen op de server.
 * @function verwerkZittingVrijAanvraag
 * @memberof ExterneFuncties
 * @param {Object} zittingVrijData - Gegevens van de zittingvrije dagen.
 * @returns {Promise<Object>} - Belofte die resolveert naar het resultaat van de verwerking.
 */

/**
 * Verwerkt een zittingvrij aanvraag op de server.
 * @function verwerkZittingVrijAanvraag
 * @memberof ExterneFuncties
 * @param {Object} zittingVrijData - Gegevens van de zittingvrij aanvraag.
 * @returns {Promise<Object>} - Belofte die resolveert naar het resultaat van de verwerking.
 */
