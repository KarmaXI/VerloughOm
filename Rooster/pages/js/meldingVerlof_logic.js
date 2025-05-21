// Globale variabelen voor deze pagina
// BELANGRIJK: Pas deze URL aan naar de SharePoint site waar uw lijsten zich bevinden!
const spWebAbsoluteUrl = "https://som.org.om.local/sites/MulderT/CustomPW/Verlof";

let currentUserLoginName = "";
let currentUserDisplayName = "";
let currentUserNormalizedLoginName = ""; // Voor MedewerkerID

// DOM Elementen
// Deze worden nu dynamisch gezocht binnen de modal, dus geen globale const hier meer.
// const form = document.getElementById('verlof-form');
// const notificationArea = document.getElementById('notification-area');
// const submitButton = document.getElementById('submit-button');
// ... en andere elementen ...

/**
 * Utility functie om SharePoint claims prefix van loginnaam te verwijderen.
 * @param {string} loginNaam - De volledige SharePoint loginnaam.
 * @returns {string} De genormaliseerde loginnaam.
 */
function trimLoginNaamPrefix(loginNaam) {
    // Functie om een genormaliseerde gebruikersnaam te verkrijgen
    if (!loginNaam) return '';
    const prefixesToRemove = ["i:0#.w|", "c:0(.s|true|", "i:05.t|"];
    for (const prefix of prefixesToRemove) {
        if (loginNaam.toLowerCase().startsWith(prefix.toLowerCase())) {
            return loginNaam.substring(prefix.length);
        }
    }
    return loginNaam.startsWith('|') ? loginNaam.substring(1) : loginNaam;
}

/**
 * Haalt een X-RequestDigest op, nodig voor POST/PUT/DELETE operaties.
 * @returns {Promise<string>} De request digest waarde.
 */
async function getRequestDigest() {
    // Functie om de request digest te verkrijgen
    console.log("Ophalen Request Digest van:", `${spWebAbsoluteUrl}/_api/contextinfo`);
    const response = await fetch(`${spWebAbsoluteUrl}/_api/contextinfo`, {
        method: 'POST',
        headers: { 'Accept': 'application/json;odata=verbose' }
    });
    if (!response.ok) {
        console.error("Fout bij ophalen request digest:", response.status, await response.text().catch(()=>""));
        throw new Error('Kon request digest niet ophalen.');
    }
    const data = await response.json();
    console.log("Request Digest succesvol opgehaald.");
    return data.d.GetContextWebInformation.FormDigestValue;
}

/**
 * Toont een notificatie bericht aan de gebruiker IN DE MODAL.
 * @param {string} berichtHTML - Het te tonen bericht (kan HTML bevatten).
 * @param {'success'|'error'|'info'} type - Het type notificatie.
 * @param {number|false} [autoHideDelay=5000] - Delay in ms voor auto-hide, of false om niet te auto-hiden.
 */
function toonNotificatieInModal(berichtHTML, type = 'info', autoHideDelay = 5000) {
    const modalNotificationArea = document.getElementById('modal-notification-area'); // ID binnen de modal
    if (!modalNotificationArea) {
        console.warn("Notification area (#modal-notification-area) not found in modal for message:", berichtHTML);
        // Fallback to a global notification if available, or just log
        if (typeof toonModalNotificatie === 'function') {
            toonModalNotificatie(berichtHTML.replace(/<[^>]*>?/gm, ''), type, autoHideDelay); // Strip HTML for global one
        } else {
            console.log(`[ModalFormNotificatie] Type: ${type}, Bericht: ${berichtHTML}`);
        }
        return;
    }
    console.log(`[ModalFormNotificatie] Type: ${type}, Bericht: ${berichtHTML}`);
    modalNotificationArea.innerHTML = berichtHTML;
    modalNotificationArea.className = 'notification-area'; // Reset classes
    modalNotificationArea.classList.add(`notification-${type}`);
    modalNotificationArea.classList.remove('hidden');

    if (modalNotificationArea.timeoutId) {
        clearTimeout(modalNotificationArea.timeoutId);
    }

    if (autoHideDelay !== false && autoHideDelay > 0) {
        modalNotificationArea.timeoutId = setTimeout(() => {
            modalNotificationArea.classList.add('hidden');
        }, autoHideDelay);
    }
}

/**
 * Initialiseert gebruikersinformatie en thema.
 */
async function initializeModalGebruikersInfoEnThema() {
    // Functie om gebruikersinfo en thema te initialiseren
    console.log("Start initialisatie gebruikersinfo en thema voor modal form.");
    const medewerkerDisplayInput = document.getElementById('MedewerkerDisplay');
    const medewerkerIdInput = document.getElementById('MedewerkerID');
    const titleInput = document.getElementById('Title');

    if (!medewerkerDisplayInput || !medewerkerIdInput || !titleInput) {
        console.error("Noodzakelijke formuliervelden niet gevonden in de modal.");
        toonNotificatieInModal("Fout: Formulier is niet correct geladen.", "error");
        return;
    }

    try {
        const userResponse = await fetch(`${spWebAbsoluteUrl}/_api/web/currentUser?$select=LoginName,Title`, {
            headers: { 'Accept': 'application/json;odata=verbose' }
        });
        if (!userResponse.ok) {
            const errorText = await userResponse.text().catch(()=>"");
            console.error("Fout bij ophalen gebruikersdata:", userResponse.status, errorText);
            throw new Error(`Kon gebruikersdata niet ophalen: ${userResponse.status}`);
        }
        const userData = await userResponse.json();

        currentUserLoginName = userData.d.LoginName;
        currentUserDisplayName = userData.d.Title;
        currentUserNormalizedLoginName = trimLoginNaamPrefix(currentUserLoginName);
        console.log(`Huidige gebruiker: ${currentUserDisplayName} (Login: ${currentUserLoginName}, Genormaliseerd: ${currentUserNormalizedLoginName})`);

        medewerkerDisplayInput.value = currentUserDisplayName;
        medewerkerIdInput.value = currentUserNormalizedLoginName; // Store normalized login name

        const today = new Date();
        const dateStr = today.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
        titleInput.value = `Verlofaanvraag ${currentUserDisplayName} - ${dateStr}`;

        // Pas thema toe
        const instellingenCfg = getLijstConfig('gebruikersInstellingen');
        if (instellingenCfg && instellingenCfg.lijstId) {
            const themeApiUrl = `${spWebAbsoluteUrl}/_api/web/lists(guid'${instellingenCfg.lijstId}')/items?$filter=Title eq '${encodeURIComponent(currentUserNormalizedLoginName)}'&$select=soortWeergave`;
            console.log("Ophalen thema instellingen van:", themeApiUrl);
            const themeResponse = await fetch(themeApiUrl, {
                headers: { 'Accept': 'application/json;odata=verbose' }
            });
            if (themeResponse.ok) {
                const themeData = await themeResponse.json();
                const items = themeData.d.results;
                if (items.length > 0 && items[0].soortWeergave === 'dark') {
                    // Thema wordt al door de modal zelf afgehandeld (applyDarkThemeToModal)
                    // document.body.classList.add('dark-mode');
                    console.log("Dark mode instelling gedetecteerd voor gebruiker.");
                } else {
                    // document.body.classList.remove('dark-mode');
                    console.log("Light mode instelling gedetecteerd voor gebruiker.");
                }
            } else {
                 console.warn("Kon thema instellingen niet ophalen, HTTP status:", themeResponse.status, ". Standaard (light) thema wordt gebruikt.");
                 document.body.classList.remove('dark-mode'); // Zorg voor fallback
            }
        } else {
            console.warn("Configuratie voor 'gebruikersInstellingen' lijst niet gevonden of lijstId ontbreekt. Standaard (light) thema wordt gebruikt.");
            document.body.classList.remove('dark-mode');
        }
    } catch (error) {
        console.error('Fout bij ophalen gebruikersdata of thema voor modal:', error);
        toonNotificatieInModal('Kon gebruikersinformatie of thema niet laden. Standaardwaarden worden gebruikt.', 'error');
        medewerkerDisplayInput.value = 'Gebruiker (fout)';
        const today = new Date();
        const dateStr = today.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
        titleInput.value = `Verlofaanvraag Gebruiker (fout) - ${dateStr}`;
        document.body.classList.remove('dark-mode'); // Fallback naar light mode
    }
}

/**
 * Laadt de verlofredenen in de dropdown.
 */
async function laadModalVerlofredenen() {
    const redenSelect = document.getElementById('Reden');
    if (!redenSelect) {
        console.error("Reden select element (#Reden) niet gevonden in modal.");
        toonNotificatieInModal("Fout: Reden selectie kon niet geladen worden.", "error");
        return;
    }
    // Functie om verlofredenen te laden
    console.log("Laden van verlofredenen...");
    const redenCfg = getLijstConfig('Verlofredenen');
    if (!redenCfg || !redenCfg.lijstId) {
        console.error("Configuratie voor 'Verlofredenen' lijst niet gevonden of lijstId ontbreekt.");
        toonNotificatieInModal("Kon verlofredenen niet laden: configuratie ontbreekt.", "error");
        populateModalFallbackReasons(redenSelect);
        return;
    }

    const redenenApiUrl = `${spWebAbsoluteUrl}/_api/web/lists(guid'${redenCfg.lijstId}')/items?$select=ID,Title,Naam&$orderby=Naam asc`;
    console.log("Ophalen verlofredenen van:", redenenApiUrl);

    try {
        const response = await fetch(redenenApiUrl, {
            headers: { 'Accept': 'application/json;odata=verbose' }
        });
        if (!response.ok) {
            const errorText = await response.text().catch(()=>"");
            console.error("Fout bij ophalen verlofredenen:", response.status, errorText);
            throw new Error(`Kon verlofredenen niet ophalen: ${response.status}`);
        }
        const data = await response.json();
        redenSelect.innerHTML = '<option value="">-- Kies een reden --</option>'; // Reset
        data.d.results.forEach(item => {
            const option = document.createElement('option');
            option.value = item.ID; // Store the ID of the reason
            option.textContent = item.Naam || item.Title; // Display the name
            option.dataset.reasonTitle = item.Title; // Store original Title (voor SP Reden veld)
            redenSelect.appendChild(option);
        });
        console.log("Verlofredenen succesvol geladen.");
    } catch (error) {
        console.error('Fout bij ophalen verlofredenen voor modal:', error);
        toonNotificatieInModal('Kon verlofredenen niet laden. Standaardopties worden getoond.', 'error');
        populateModalFallbackReasons(redenSelect);
    }
}

/**
 * Vult de dropdown met fallback redenen als API faalt.
 */
function populateModalFallbackReasons(redenSelectElement) {
    if (!redenSelectElement) return;
    // Functie om fallback redenen te populeren
    console.warn("Populeren van fallback verlofredenen.");
    const fallbackReasons = [
        { id: 'vakantie', text: 'Vakantie', titleVal: 'Vakantie' },
        { id: 'ziekte', text: 'Ziekte', titleVal: 'Ziekte' },
        { id: 'persoonlijk', text: 'Persoonlijke omstandigheden', titleVal: 'Persoonlijk' },
        { id: 'studie', text: 'Studie', titleVal: 'Studie' }
    ];
    redenSelectElement.innerHTML = '<option value="">-- Kies een reden --</option>';
    fallbackReasons.forEach(reason => {
        const opt = document.createElement('option');
        opt.value = reason.id; // Gebruik een generieke ID voor fallback
        opt.textContent = reason.text;
        opt.dataset.reasonTitle = reason.titleVal; // Zorg dat dit overeenkomt met wat SharePoint verwacht
        redenSelectElement.appendChild(opt);
    });
}

/**
 * Valideert het formulier.
 * @returns {boolean} True als valide, anders false.
 */
function valideerModalFormulier() {
    const startDatePicker = document.getElementById('StartDatePicker');
    const startTimePicker = document.getElementById('StartTimePicker');
    const endDatePicker = document.getElementById('EndDatePicker');
    const endTimePicker = document.getElementById('EndTimePicker');
    const redenSelect = document.getElementById('Reden');

    if (!startDatePicker || !startTimePicker || !endDatePicker || !endTimePicker || !redenSelect) {
        console.error("Een of meer validatievelden niet gevonden in modal.");
        toonNotificatieInModal("Fout: Formulier validatie kan niet worden uitgevoerd.", "error");
        return false;
    }

    if (!startDatePicker.value || !startTimePicker.value || !endDatePicker.value || !endTimePicker.value || !redenSelect.value) {
        toonNotificatieInModal('Vul alle verplichte velden (*) in.', 'error');
        return false;
    }

    const startDateTime = new Date(`${startDatePicker.value}T${startTimePicker.value}`);
    const endDateTime = new Date(`${endDatePicker.value}T${endTimePicker.value}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        toonNotificatieInModal('Ongeldige datum of tijd ingevoerd.', 'error');
        return false;
    }

    if (endDateTime <= startDateTime) {
        toonNotificatieInModal('De einddatum en -tijd moeten na de startdatum en -tijd liggen.', 'error');
        return false;
    }
    return true;
}

/**
 * Verwerkt het verzenden van het formulier (deze functie wordt aangeroepen door de modal submit handler).
 * @param {HTMLFormElement} formElement - Het formulier element uit de modal.
 * @param {Object} medewerkerGegevens - Gegevens van de huidige medewerker.
 * @param {Date} geselecteerdeDatum - De initieel geselecteerde datum.
 * @returns {Promise<boolean>} True als succesvol, anders false.
 */
async function handleModalFormulierVerzenden(formElement, medewerkerGegevens, geselecteerdeDatum) {
    console.log("Modal formulierverwerking gestart...");
    // De submit knop en notificatie worden nu beheerd door de openModal functie in verlofroosterModal_logic.js
    // We gebruiken toonNotificatieInModal voor feedback binnen het formulier.

    if (!valideerModalFormulier()) {
        return false; // Validatie mislukt
    }

    const startDatePicker = document.getElementById('StartDatePicker');
    const startTimePicker = document.getElementById('StartTimePicker');
    const endDatePicker = document.getElementById('EndDatePicker');
    const endTimePicker = document.getElementById('EndTimePicker');
    const startDatumInput = document.getElementById('StartDatum');
    const eindDatumInput = document.getElementById('EindDatum');
    const redenSelect = document.getElementById('Reden');
    const omschrijvingTextarea = document.getElementById('Omschrijving');
    const statusInput = document.getElementById('Status');
    const titleInput = document.getElementById('Title');
    const medewerkerDisplayInput = document.getElementById('MedewerkerDisplay');
    const medewerkerIdInput = document.getElementById('MedewerkerID');

    // Combineer datum en tijd en zet naar ISO string voor verborgen velden
    const startDateTime = new Date(`${startDatePicker.value}T${startTimePicker.value}`);
    startDatumInput.value = startDateTime.toISOString();

    const endDateTime = new Date(`${endDatePicker.value}T${endTimePicker.value}`);
    eindDatumInput.value = endDateTime.toISOString();

    const geselecteerdeRedenOptie = redenSelect.options[redenSelect.selectedIndex];
    const redenIdValue = geselecteerdeRedenOptie.value;
    const redenTextValue = geselecteerdeRedenOptie.dataset.reasonTitle || geselecteerdeRedenOptie.textContent;

    const verlofLijstConfig = getLijstConfig('Verlof');
    if (!verlofLijstConfig || !verlofLijstConfig.lijstId || !verlofLijstConfig.lijstTitel) {
        toonNotificatieInModal('Fout: Verlofaanvraag kan niet worden verwerkt (configuratie ontbreekt).', 'error', false);
        console.error("Configuratie voor 'Verlof' lijst niet gevonden of incompleet.");
        return false;
    }

    const listNameForMetadata = verlofLijstConfig.lijstTitel.replace(/\s+/g, '_');

    const formDataPayload = {
        __metadata: { type: `SP.Data.${listNameForMetadata}ListItem` },
        Title: titleInput.value,
        Medewerker: medewerkerDisplayInput.value,
        MedewerkerID: medewerkerIdInput.value,
        StartDatum: startDatumInput.value,
        EindDatum: eindDatumInput.value,
        Omschrijving: omschrijvingTextarea.value,
        Reden: redenTextValue,
        RedenId: redenIdValue,
        Status: statusInput.value
    };

    console.log('Voor te bereiden payload voor SharePoint (modal):', JSON.stringify(formDataPayload, null, 2));

    try {
        const requestDigest = await getRequestDigest();
        const createItemUrl = `${spWebAbsoluteUrl}/_api/web/lists(guid'${verlofLijstConfig.lijstId}')/items`;
        console.log("Versturen van data naar (modal):", createItemUrl);

        const response = await fetch(createItemUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'X-RequestDigest': requestDigest
            },
            body: JSON.stringify(formDataPayload)
        });

        if (!response.ok && response.status !== 201) {
            const errorData = await response.json().catch(() => null);
            const spErrorMessage = errorData?.error?.message?.value || `Serverfout: ${response.status}`;
            console.error("Fout bij opslaan in SharePoint (modal):", response.status, spErrorMessage, errorData);
            throw new Error(`Kon verlofaanvraag niet opslaan. ${spErrorMessage}`);
        }

        console.log("Verlofaanvraag succesvol opgeslagen in SharePoint (modal).");
        // Notificatie wordt afgehandeld door de aanroepende modal functie (toonModalNotificatie)
        // Reset het formulier (binnen de modal)
        formElement.reset();
        // Herstel initiële waarden indien nodig (wordt deels door initializeModalForm gedaan)
        if (medewerkerDisplayInput) medewerkerDisplayInput.value = currentUserDisplayName;
        if (medewerkerIdInput) medewerkerIdInput.value = currentUserNormalizedLoginName;
        const today = new Date();
        const dateStr = today.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
        if (titleInput) titleInput.value = `Verlofaanvraag ${currentUserDisplayName} - ${dateStr}`;
        if (statusInput) statusInput.value = "Nieuw";
        if (startTimePicker) startTimePicker.value = "09:00";
        if (endTimePicker) endTimePicker.value = "17:00";
        const vandaagISO = today.toISOString().split('T')[0];
        if (startDatePicker) startDatePicker.value = vandaagISO;
        if (endDatePicker) endDatePicker.value = vandaagISO;

        // P-Direkt herinnering (kan ook via de global toonModalNotificatie)
        setTimeout(() => {
            const pDirektLink = "https://sap-portal.p-direkt.rijksweb.nl/irj/portal/medewerker/verlofwerktijd/verlofregistreren";
            const berichtHTML = `Vergeet niet om je verlofaanvraag ook in <a href="${pDirektLink}" target="_blank" title="Open P-Direkt in een nieuw tabblad">P-direkt</a> te registreren!`;
            // Gebruik de globale modal notificatie functie als die bestaat
            if (typeof toonModalNotificatie === 'function') {
                 toonModalNotificatie(berichtHTML, 'info', 15000);
            } else {
                toonNotificatieInModal(berichtHTML, 'info', 15000);
            }
        }, 500);
        return true; // Succes

    } catch (error) {
        console.error('Fout bij verzenden verlofaanvraag (modal):', error);
        toonNotificatieInModal(`Fout bij verzenden: ${error.message}. Probeer het opnieuw.`, 'error', false);
        return false; // Mislukt
    }
}


// Start de initialisatie specifiek voor het modal formulier
async function initializeModalForm() {
    // Voeg een placeholder toe voor notificaties binnen het modal formulier, als die nog niet bestaat.
    const modalContent = document.getElementById('modal-content');
    if (modalContent && !document.getElementById('modal-notification-area')) {
        const notificationDiv = document.createElement('div');
        notificationDiv.id = 'modal-notification-area';
        notificationDiv.className = 'notification-area hidden'; // Start verborgen
        // Plaats het bovenaan de modal content, of waar je het wilt hebben.
        modalContent.insertBefore(notificationDiv, modalContent.firstChild);
    }

    toonNotificatieInModal('Formulier initialiseren...', 'info', 2000);
    try {
        await initializeModalGebruikersInfoEnThema();
        await laadModalVerlofredenen();
        // Zet standaard datums na laden gebruikersinfo
        const startDatePicker = document.getElementById('StartDatePicker');
        const endDatePicker = document.getElementById('EndDatePicker');
        const startTimePicker = document.getElementById('StartTimePicker');
        const endTimePicker = document.getElementById('EndTimePicker');

        if (startDatePicker && endDatePicker && startTimePicker && endTimePicker) {
            const vandaag = new Date();
            const vandaagISO = vandaag.toISOString().split('T')[0];
            startDatePicker.value = vandaagISO;
            endDatePicker.value = vandaagISO;
            startTimePicker.value = "09:00";
            endTimePicker.value = "17:00";
        } else {
            console.warn("Datumvelden niet gevonden voor initialisatie in modal.");
        }
        console.log("Modal formulier initialisatie voltooid.");

        // Event listener voor het formulier (wordt nu afgehandeld door de modal zelf)
        // De `handleModalFormulierVerzenden` wordt direct aangeroepen door de `openModal` callback.
        // const formInModal = document.querySelector('#modal-content #verlof-form');
        // if (formInModal) {
        //     formInModal.addEventListener('submit', (e) => handleModalFormulierVerzenden(e, formInModal, ...));
        // }

    } catch (initError) {
        console.error("Kritieke fout tijdens modal formulier initialisatie:", initError);
        toonNotificatieInModal("Kon het formulier niet correct initialiseren. Probeer het later opnieuw.", "error", false);
    }
}

// Exposeer de initialisatie functie voor de modal
window.initializeVerlofModalForm = initializeModalForm;
// Exposeer de submit handler ook, zodat de modal logic het kan aanroepen
window.handleVerlofModalFormSubmit = handleModalFormulierVerzenden;

// De oude DOMContentLoaded listener is verwijderd.
// De logica wordt nu gestart door een aanroep naar window.initializeVerlofModalForm()
// vanuit verlofroosterModal_logic.js nadat de HTML in de modal is geladen.

// Controleer of configLijst.js en getLijstConfig correct geladen zijn (globale check)
if (typeof getLijstConfig !== 'function' || typeof sharepointLijstConfiguraties === 'undefined') {
    console.error("configLijst.js of getLijstConfig is niet beschikbaar. Functionaliteit kan beperkt zijn.");
    // Een globale notificatie hier is lastig omdat de DOM misschien nog niet klaar is.
    // De individuele functies moeten hier zelf op controleren als ze getLijstConfig gebruiken.
}
