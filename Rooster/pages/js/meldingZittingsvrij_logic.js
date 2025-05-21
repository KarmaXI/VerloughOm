// Pages/js/meldingZittingsvrij_logic.js

/**
 * Logica voor de Pages/meldingZittingsvrij.aspx pagina.
 * Beheert het formulier voor het melden van incidenteel zittingvrij,
 * inclusief permissiecontrole (inline), data validatie en opslaan naar SharePoint.
 * * Vereist:
 * - ../js/configLijst.js (voor getLijstConfig)
 * - ../js/machtigingen.js (voor SharePoint context, createSPListItem, getLijstItemsAlgemeen, en de initialisatie promise)
 */

// Globale variabelen voor de pagina
let spWebAbsoluteUrlPagina = ''; // SharePoint site URL, gezet vanuit machtigingen.js context
let huidigeGebruikerPagina = null; // Info over de ingelogde gebruiker, gezet vanuit machtigingen.js context
let geselecteerdeMedewerker = { 
    gebruikersnaam: null, // Normalized username (bijv. domein\gebruiker) voor opslag
    displayName: null    // Weergegeven naam (bijv. Voornaam Achternaam) voor weergave
};
let alleMedewerkersVoorLookup = []; // Cache voor medewerkerslijst voor de autocomplete

// Definieer de vereiste beheerdersgroepen lokaal voor deze pagina
const VEREISTE_BEHEER_GROEPEN_ZITTINGVRIJ = ["1. Sharepoint beheer", "1.1. Mulder MT"]; // Pas aan indien nodig

// DOM Referenties
const domRefsMeldingZV = {
    appBody: document.body,
    form: document.getElementById('zittingvrij-form'),
    formTitelHidden: document.getElementById('form-titel-hidden'),
    gebruikersnaamInput: document.getElementById('form-gebruikersnaam'),
    gebruikersnaamStatus: null, // Wordt dynamisch aangemaakt indien nodig
    startDatumInput: document.getElementById('form-start-datum'),
    startTijdInput: document.getElementById('form-start-tijd'),
    eindDatumInput: document.getElementById('form-eind-datum'),
    eindTijdInput: document.getElementById('form-eind-tijd'),
    opmerkingTextarea: document.getElementById('form-opmerking'),
    terugkerendCheckbox: document.getElementById('form-terugkerend'),
    recurringFieldsContainer: document.getElementById('recurring-fields-container'),
    terugkeerPatroonSelect: document.getElementById('form-terugkeerpatroon'),
    terugkerendTotInput: document.getElementById('form-terugkerend-tot'),
    annulerenButton: document.getElementById('annuleren-button'),
    indienenButton: document.getElementById('indienen-button'),
    statusBerichtDiv: document.getElementById('status-bericht'),
    currentYearSpan: document.getElementById('current-year')
};

/**
 * Initialiseert de pagina: thema, context, permissies, en event listeners.
 */
async function initializePaginaMeldingZV() {
    console.log("[MeldingZittingsvrij] Initialiseren pagina...");
    if(domRefsMeldingZV.currentYearSpan) updateJaarInFooterMeldingZV(); 
    initializeThemaMeldingZV();

    // Wacht tot machtigingen.js klaar is met zijn initialisatie
    if (window.machtigingenInitializationPromise) {
        try {
            console.log("[MeldingZittingsvrij] Wachten op voltooiing initialisatie van machtigingen.js...");
            await window.machtigingenInitializationPromise;
            console.log("[MeldingZittingsvrij] Machtigingen.js initialisatie voltooid.");
        } catch (error) {
            console.error("[MeldingZittingsvrij] Fout tijdens wachten op machtigingen.js initialisatie:", error);
            toonStatusBerichtMeldingZV("Kritische fout: Kan basis-afhankelijkheden niet laden. Probeer de pagina te vernieuwen.", "error", false);
            if (domRefsMeldingZV.form) domRefsMeldingZV.form.classList.add('hidden');
            if (domRefsMeldingZV.indienenButton) domRefsMeldingZV.indienenButton.disabled = true;
            return; 
        }
    } else {
        console.error("[MeldingZittingsvrij] Machtigingen.js initialisatie promise (window.machtigingenInitializationPromise) niet gevonden. Kan niet veilig doorgaan.");
        toonStatusBerichtMeldingZV("Kritische fout: Initialisatie van afhankelijkheden is onvolledig (Promise).", "error", false);
        // Verberg formulier en deactiveer knoppen als de promise er niet is
        if (domRefsMeldingZV.form) domRefsMeldingZV.form.classList.add('hidden');
        if (domRefsMeldingZV.indienenButton) domRefsMeldingZV.indienenButton.disabled = true;
        return; 
    }

    const contextOK = await initializeContextEnPermissiesPaginaMeldingZV();
    if (!contextOK) {
        // initializeContextEnPermissiesPaginaMeldingZV toont al een bericht en verbergt het formulier.
        return;
    }
    
    haalMedewerkerGegevensUitUrlMeldingZV(); 
    vulFormulierInitieelInMeldingZV();
    koppelEventListenersMeldingZV();
    console.log("[MeldingZittingsvrij] Pagina initialisatie voltooid.");
}

/**
 * Past het thema (licht/donker) toe op basis van localStorage.
 */
function initializeThemaMeldingZV() {
    if (!domRefsMeldingZV.appBody) {
        console.warn("[MeldingZittingsvrij] appBody niet gevonden in DOM refs voor thema initialisatie.");
        return;
    }
    const opgeslagenThema = localStorage.getItem('verlofroosterThema'); // Gebruik dezelfde key als hoofd app
    if (opgeslagenThema === 'dark') {
        domRefsMeldingZV.appBody.classList.remove('light-theme');
        domRefsMeldingZV.appBody.classList.add('dark-theme');
    } else {
        domRefsMeldingZV.appBody.classList.remove('dark-theme');
        domRefsMeldingZV.appBody.classList.add('light-theme'); 
    }
    console.log("[MeldingZittingsvrij] Thema ingesteld op:", domRefsMeldingZV.appBody.classList.contains('dark-theme') ? 'dark' : 'light');
}

/**
 * Haalt SharePoint context en controleert gebruikerspermissies (inline check).
 * @returns {Promise<boolean>} True als context OK is en gebruiker permissies heeft, anders false.
 */
async function initializeContextEnPermissiesPaginaMeldingZV() {
    console.log("[MeldingZittingsvrij] Initialiseren SharePoint context en permissies voor deze pagina...");

    // Gebruik de globale context die door machtigingen.js is gezet
    if (typeof window.spWebAbsoluteUrl === 'string' && window.huidigeGebruiker && window.huidigeGebruiker.loginNaam) {
        spWebAbsoluteUrlPagina = window.spWebAbsoluteUrl;
        huidigeGebruikerPagina = window.huidigeGebruiker; 
        console.log("[MeldingZittingsvrij] Globale context van machtigingen.js wordt gebruikt:", huidigeGebruikerPagina);
    } else {
        console.error("[MeldingZittingsvrij] Kritische fout: Globale SharePoint context (spWebAbsoluteUrl of huidigeGebruiker) niet beschikbaar na wachten op machtigingen.js.");
        toonStatusBerichtMeldingZV("Kan SharePoint context niet laden. Pagina kan niet functioneren.", "error", false);
        return false;
    }

    if (!huidigeGebruikerPagina.sharePointGroepen || !Array.isArray(huidigeGebruikerPagina.sharePointGroepen)) {
        // Dit zou idealiter al gevuld moeten zijn door machtigingen.js
        console.warn("[MeldingZittingsvrij] huidigeGebruikerPagina.sharePointGroepen was niet gedefinieerd of geen array. Proberen te laden...");
        if (typeof window.getGebruikerSharePointGroepenViaAPI === 'function') {
            try {
                huidigeGebruikerPagina.sharePointGroepen = await window.getGebruikerSharePointGroepenViaAPI() || [];
            } catch (e) {
                console.error("[MeldingZittingsvrij] Fout bij expliciet laden groepen:", e);
                huidigeGebruikerPagina.sharePointGroepen = [];
            }
        } else {
            huidigeGebruikerPagina.sharePointGroepen = [];
            console.warn("[MeldingZittingsvrij] getGebruikerSharePointGroepenViaAPI niet beschikbaar. Kan groepen niet expliciet laden.");
        }
    }
    
    let heeftToegang = false;
    if (huidigeGebruikerPagina.sharePointGroepen.length > 0) {
        heeftToegang = VEREISTE_BEHEER_GROEPEN_ZITTINGVRIJ.some(vereisteGroep =>
            huidigeGebruikerPagina.sharePointGroepen.some(userGroup => userGroup.toLowerCase() === vereisteGroep.toLowerCase())
        );
    } else {
        console.warn("[MeldingZittingsvrij] Gebruiker is lid van geen enkele groep, of groepen zijn niet geladen. Toegang wordt geweigerd.");
    }
    
    if (!heeftToegang) {
        console.warn(`[MeldingZittingsvrij] Gebruiker (login: ${huidigeGebruikerPagina.loginNaam}) heeft geen permissie. Vereiste groepen: ${VEREISTE_BEHEER_GROEPEN_ZITTINGVRIJ.join(', ')}. Gebruikersgroepen:`, huidigeGebruikerPagina.sharePointGroepen);
        toonStatusBerichtMeldingZV("U heeft geen permissie om deze pagina te bekijken of te gebruiken.", "error", false);
        if (domRefsMeldingZV.form) domRefsMeldingZV.form.classList.add('hidden');
        if (domRefsMeldingZV.indienenButton) domRefsMeldingZV.indienenButton.disabled = true;
        if (domRefsMeldingZV.annulerenButton) domRefsMeldingZV.annulerenButton.textContent = "Terug naar rooster";
        return false;
    }
    console.log("[MeldingZittingsvrij] Gebruiker heeft permissie.");
    return true;
}

/**
 * Haalt medewerkergegevens (username, displayname) uit de URL parameters.
 */
function haalMedewerkerGegevensUitUrlMeldingZV() {
    const urlParams = new URLSearchParams(window.location.search);
    const medewerkerUsernameParam = urlParams.get('medewerkerUsername');
    const medewerkerDisplayNameParam = urlParams.get('medewerkerDisplayName');
    
    if (medewerkerUsernameParam && domRefsMeldingZV.gebruikersnaamInput) {
        geselecteerdeMedewerker.gebruikersnaam = medewerkerUsernameParam; 
        geselecteerdeMedewerker.displayName = medewerkerDisplayNameParam || medewerkerUsernameParam.split(/[\\|]/).pop(); 
        
        domRefsMeldingZV.gebruikersnaamInput.value = geselecteerdeMedewerker.displayName;
        domRefsMeldingZV.gebruikersnaamInput.readOnly = true;
        domRefsMeldingZV.gebruikersnaamInput.classList.add('cursor-not-allowed', 'bg-gray-100', 'dark:bg-gray-700', 'text-gray-500', 'dark:text-gray-400');
        console.log("[MeldingZittingsvrij] Medewerker gegevens uit URL:", geselecteerdeMedewerker);
    } else {
        console.log("[MeldingZittingsvrij] Geen medewerker gegevens in URL. Gebruikersnaam input is bewerkbaar.");
        if (domRefsMeldingZV.gebruikersnaamInput) {
            domRefsMeldingZV.gebruikersnaamInput.readOnly = false;
            domRefsMeldingZV.gebruikersnaamInput.classList.remove('cursor-not-allowed', 'bg-gray-100', 'dark:bg-gray-700', 'text-gray-500', 'dark:text-gray-400');
            domRefsMeldingZV.gebruikersnaamInput.classList.add('form-input'); 
            if (domRefsMeldingZV.appBody.classList.contains('dark-theme')) {
                domRefsMeldingZV.gebruikersnaamInput.classList.add('dark:bg-gray-700', 'dark:border-gray-600', 'dark:text-gray-200');
            } else {
                 domRefsMeldingZV.gebruikersnaamInput.classList.add('bg-white', 'border-gray-300', 'text-gray-900');
            }
            domRefsMeldingZV.gebruikersnaamInput.placeholder = "Typ volledige naam medewerker...";
            domRefsMeldingZV.gebruikersnaamInput.addEventListener('blur', handleGebruikersnaamInputBlurMeldingZV);
            
            if (!domRefsMeldingZV.gebruikersnaamStatus && domRefsMeldingZV.gebruikersnaamInput.parentNode) {
                domRefsMeldingZV.gebruikersnaamStatus = document.createElement('p');
                domRefsMeldingZV.gebruikersnaamStatus.id = 'gebruikersnaam-lookup-status';
                domRefsMeldingZV.gebruikersnaamStatus.className = 'text-xs mt-1 ml-1';
                domRefsMeldingZV.gebruikersnaamInput.parentNode.insertBefore(domRefsMeldingZV.gebruikersnaamStatus, domRefsMeldingZV.gebruikersnaamInput.nextSibling);
            }
        }
    }
}

/**
 * Handler voor blur event op gebruikersnaam input wanneer deze bewerkbaar is.
 */
async function handleGebruikersnaamInputBlurMeldingZV() {
    const ingevoerdeTerm = domRefsMeldingZV.gebruikersnaamInput.value.trim().toLowerCase();
    if (!ingevoerdeTerm) {
        updateGebruikersnaamStatusMeldingZV("", ""); 
        geselecteerdeMedewerker.gebruikersnaam = null;
        geselecteerdeMedewerker.displayName = null;
        return;
    }

    updateGebruikersnaamStatusMeldingZV("Zoeken...", "info");

    if (alleMedewerkersVoorLookup.length === 0) { 
        try {
            const medewerkersLijstConfig = getLijstConfig("Medewerkers");
            if (!medewerkersLijstConfig || typeof window.getLijstItemsAlgemeen !== 'function') {
                throw new Error("Medewerkersconfiguratie of data ophaal functie niet beschikbaar.");
            }
            const selectQuery = "$select=ID,Naam,Username,E_x002d_mail"; 
            alleMedewerkersVoorLookup = await window.getLijstItemsAlgemeen(medewerkersLijstConfig.lijstId, selectQuery); // Gebruik lijstId uit config
            console.log("[MeldingZittingsvrij] Medewerkerslijst voor lookup geladen:", alleMedewerkersVoorLookup.length, "items");
        } catch (error) {
            console.error("[MeldingZittingsvrij] Fout bij laden medewerkerslijst voor lookup:", error);
            updateGebruikersnaamStatusMeldingZV("Fout bij laden medewerkers.", "error");
            return;
        }
    }

    const matches = alleMedewerkersVoorLookup.filter(m => {
        const naamMatch = m.Naam && m.Naam.toLowerCase().includes(ingevoerdeTerm);
        const normalizedListUsername = m.Username ? (typeof window.trimLoginNaamPrefixMachtigingen === 'function' ? window.trimLoginNaamPrefixMachtigingen(m.Username) : m.Username).toLowerCase() : "";
        const usernamePart = ingevoerdeTerm.includes('\\') ? ingevoerdeTerm.split('\\')[1] : ingevoerdeTerm; 
        const usernameMatch = normalizedListUsername.includes(usernamePart);
        return naamMatch || usernameMatch; 
    });

    if (matches.length === 1) {
        const gevondenMedewerker = matches[0];
        const normalizedUsername = typeof window.trimLoginNaamPrefixMachtigingen === 'function' 
                                   ? window.trimLoginNaamPrefixMachtigingen(gevondenMedewerker.Username) 
                                   : gevondenMedewerker.Username; 

        geselecteerdeMedewerker.gebruikersnaam = normalizedUsername; 
        geselecteerdeMedewerker.displayName = gevondenMedewerker.Naam;
        domRefsMeldingZV.gebruikersnaamInput.value = gevondenMedewerker.Naam; 
        updateGebruikersnaamStatusMeldingZV(`Gevonden: ${gevondenMedewerker.Naam} (Username: ${normalizedUsername})`, "success");
        console.log("[MeldingZittingsvrij] Medewerker gevonden via lookup:", geselecteerdeMedewerker);
    } else if (matches.length > 1) {
        geselecteerdeMedewerker.gebruikersnaam = null;
        geselecteerdeMedewerker.displayName = null;
        const namen = matches.map(m => m.Naam).join(', ');
        updateGebruikersnaamStatusMeldingZV(`Meerdere medewerkers gevonden: ${namen.substring(0,100)}${namen.length > 100 ? '...' : ''}. Wees specifieker.`, "error");
        console.warn("[MeldingZittingsvrij] Meerdere matches voor lookup:", matches);
    } else {
        geselecteerdeMedewerker.gebruikersnaam = null;
        geselecteerdeMedewerker.displayName = null;
        updateGebruikersnaamStatusMeldingZV("Medewerker niet gevonden.", "error");
    }
}

/**
 * Hulpprogramma om de status van de gebruikersnaamlookup bij te werken.
 */
function updateGebruikersnaamStatusMeldingZV(bericht, type) {
    if (!domRefsMeldingZV.gebruikersnaamStatus) return;
    domRefsMeldingZV.gebruikersnaamStatus.textContent = bericht;
    domRefsMeldingZV.gebruikersnaamStatus.className = 'text-xs mt-1 ml-1'; 
    switch (type) {
        case 'success':
            domRefsMeldingZV.gebruikersnaamStatus.classList.add('text-green-600', 'dark:text-green-400');
            break;
        case 'error':
            domRefsMeldingZV.gebruikersnaamStatus.classList.add('text-red-600', 'dark:text-red-400');
            break;
        case 'info':
            domRefsMeldingZV.gebruikersnaamStatus.classList.add('text-blue-600', 'dark:text-blue-400');
            break;
    }
}

/**
 * Vult het formulier initieel in.
 */
function vulFormulierInitieelInMeldingZV() {
    const nu = new Date();
    const vandaagISO = nu.toISOString().split('T')[0];
    if(domRefsMeldingZV.startDatumInput) domRefsMeldingZV.startDatumInput.value = vandaagISO;
    if(domRefsMeldingZV.eindDatumInput) domRefsMeldingZV.eindDatumInput.value = vandaagISO;
    
    const defaultStartTijd = "09:00";
    const defaultEindTijd = "17:00";
    if(domRefsMeldingZV.startTijdInput) domRefsMeldingZV.startTijdInput.value = defaultStartTijd;
    if(domRefsMeldingZV.eindTijdInput) domRefsMeldingZV.eindTijdInput.value = defaultEindTijd;

    toggleTerugkerendeVeldenMeldingZV(); 
}

/**
 * Koppelt event listeners aan formulierelementen.
 */
function koppelEventListenersMeldingZV() {
    if (domRefsMeldingZV.form) {
        domRefsMeldingZV.form.addEventListener('submit', handleFormulierVerzendenMeldingZV);
    }
    if (domRefsMeldingZV.annulerenButton) {
        domRefsMeldingZV.annulerenButton.addEventListener('click', () => {
            if (window.opener || (window.parent && window.parent !== window && window.self !== window.top)) {
                window.close(); 
                setTimeout(() => {
                    if (!window.closed) { 
                         window.location.href = "../Verlofrooster.aspx";
                    }
                }, 100);
            } else {
                window.location.href = "../Verlofrooster.aspx";
            }
        });
    }
    if (domRefsMeldingZV.terugkerendCheckbox) {
        domRefsMeldingZV.terugkerendCheckbox.addEventListener('change', toggleTerugkerendeVeldenMeldingZV);
    }
    console.log("[MeldingZittingsvrij] Event listeners gekoppeld.");
}

/**
 * Toont of verbergt de velden voor terugkerende evenementen.
 */
function toggleTerugkerendeVeldenMeldingZV() {
    if (!domRefsMeldingZV.terugkerendCheckbox || !domRefsMeldingZV.recurringFieldsContainer || !domRefsMeldingZV.terugkeerPatroonSelect || !domRefsMeldingZV.terugkerendTotInput) {
        console.warn("[MeldingZittingsvrij] Elementen voor terugkerende velden niet gevonden.");
        return;
    }
    const isTerugkerend = domRefsMeldingZV.terugkerendCheckbox.checked;
    domRefsMeldingZV.recurringFieldsContainer.classList.toggle('hidden', !isTerugkerend);
    
    domRefsMeldingZV.terugkeerPatroonSelect.required = isTerugkerend;
    domRefsMeldingZV.terugkerendTotInput.required = isTerugkerend;

    if (!isTerugkerend) {
        domRefsMeldingZV.terugkeerPatroonSelect.value = "";
        domRefsMeldingZV.terugkerendTotInput.value = "";
    }
}

/**
 * Valideert het formulier voordat het wordt verzonden.
 * @returns {boolean} True als valide, anders false.
 */
function valideerFormulierMeldingZV() {
    let isValide = true;
    domRefsMeldingZV.form.querySelectorAll('.border-red-500, .dark\\:border-red-400').forEach(el => {
        el.classList.remove('border-red-500', 'dark:border-red-400');
    });
    
    if (!domRefsMeldingZV.form.checkValidity()) {
        toonStatusBerichtMeldingZV("Vul alle verplichte velden (*) correct in.", "error", false);
        domRefsMeldingZV.form.querySelectorAll(':invalid').forEach(el => {
            el.classList.add('border-red-500', 'dark:border-red-400');
        });
        isValide = false;
    }
    
    if (domRefsMeldingZV.gebruikersnaamInput && !domRefsMeldingZV.gebruikersnaamInput.readOnly && !geselecteerdeMedewerker.gebruikersnaam) {
        toonStatusBerichtMeldingZV("Zoek en selecteer een geldige medewerker op naam.", "error", false);
        domRefsMeldingZV.gebruikersnaamInput.classList.add('border-red-500', 'dark:border-red-400');
        if(domRefsMeldingZV.gebruikersnaamStatus && !domRefsMeldingZV.gebruikersnaamStatus.textContent.includes("fout")) {
             updateGebruikersnaamStatusMeldingZV("Typ een naam en selecteer een medewerker.", "error");
        }
        isValide = false;
    }

    const startDatumValue = domRefsMeldingZV.startDatumInput.value;
    const startTijdValue = domRefsMeldingZV.startTijdInput.value;
    const eindDatumValue = domRefsMeldingZV.eindDatumInput.value;
    const eindTijdValue = domRefsMeldingZV.eindTijdInput.value;

    if (startDatumValue && startTijdValue && eindDatumValue && eindTijdValue) {
        const startDatum = new Date(`${startDatumValue}T${startTijdValue}`);
        const eindDatum = new Date(`${eindDatumValue}T${eindTijdValue}`);

        if (eindDatum <= startDatum) {
            toonStatusBerichtMeldingZV("Einddatum en -tijd moeten na startdatum en -tijd liggen.", "error", false);
            domRefsMeldingZV.eindDatumInput.classList.add('border-red-500', 'dark:border-red-400');
            domRefsMeldingZV.eindTijdInput.classList.add('border-red-500', 'dark:border-red-400');
            isValide = false;
        }
    }

    if (domRefsMeldingZV.terugkerendCheckbox.checked) {
        if (!domRefsMeldingZV.terugkeerPatroonSelect.value) {
            toonStatusBerichtMeldingZV("Selecteer een terugkeerpatroon.", "error", false);
            domRefsMeldingZV.terugkeerPatroonSelect.classList.add('border-red-500', 'dark:border-red-400');
            isValide = false;
        }
        if (!domRefsMeldingZV.terugkerendTotInput.value) {
            toonStatusBerichtMeldingZV("Selecteer een einddatum voor het terugkerende evenement.", "error", false);
            domRefsMeldingZV.terugkerendTotInput.classList.add('border-red-500', 'dark:border-red-400');
            isValide = false;
        } else {
            const terugkerendTotDatum = new Date(domRefsMeldingZV.terugkerendTotInput.value);
            const startDatumVoorVergelijk = new Date(startDatumValue); 
            if (terugkerendTotDatum < startDatumVoorVergelijk) {
                toonStatusBerichtMeldingZV("'Herhalen tot en met' datum mag niet voor de startdatum liggen.", "error", false);
                domRefsMeldingZV.terugkerendTotInput.classList.add('border-red-500', 'dark:border-red-400');
                isValide = false;
            }
        }
    }
    return isValide;
}

/**
 * Verwerkt het verzenden van het formulier.
 * @param {Event} event - Het submit event.
 */
async function handleFormulierVerzendenMeldingZV(event) {
    event.preventDefault();
    console.log("[MeldingZittingsvrij] Formulier verzenden gestart...");
    toonStatusBerichtMeldingZV("Bezig met opslaan...", "info", false);
    if(domRefsMeldingZV.indienenButton) domRefsMeldingZV.indienenButton.disabled = true;

    if (!valideerFormulierMeldingZV()) {
        if(domRefsMeldingZV.indienenButton) domRefsMeldingZV.indienenButton.disabled = false;
        return;
    }

    const gebruikersnaamVoorOpslag = geselecteerdeMedewerker.gebruikersnaam;
    const displayNameVoorTitel = geselecteerdeMedewerker.displayName || (gebruikersnaamVoorOpslag ? gebruikersnaamVoorOpslag.split(/[\\|]/).pop() : "Onbekende Medewerker");

    if (!gebruikersnaamVoorOpslag) { 
        toonStatusBerichtMeldingZV("Geen geldige medewerker geselecteerd/gevonden. Controleer de invoer.", "error", false);
        if(domRefsMeldingZV.indienenButton) domRefsMeldingZV.indienenButton.disabled = false;
        return;
    }

    const startDatumISO = new Date(`${domRefsMeldingZV.startDatumInput.value}T${domRefsMeldingZV.startTijdInput.value || '00:00'}:00`).toISOString();
    const eindDatumISO = new Date(`${domRefsMeldingZV.eindDatumInput.value}T${domRefsMeldingZV.eindTijdInput.value || '23:59'}:59`).toISOString(); 
    
    const vandaag = new Date();
    const datumVoorTitel = `${vandaag.getDate().toString().padStart(2, '0')}-${(vandaag.getMonth() + 1).toString().padStart(2, '0')}-${vandaag.getFullYear()}`;

    const itemData = {
        Title: `ZittingvrijMelding ${displayNameVoorTitel} - ${datumVoorTitel}`,
        Gebruikersnaam: gebruikersnaamVoorOpslag, 
        ZittingsVrijeDagTijd: startDatumISO, 
        ZittingsVrijeDagTijdEind: eindDatumISO,
        Opmerking: domRefsMeldingZV.opmerkingTextarea.value,
        Terugkerend: domRefsMeldingZV.terugkerendCheckbox.checked
    };

    if (itemData.Terugkerend) {
        itemData.TerugkeerPatroon = domRefsMeldingZV.terugkeerPatroonSelect.value;
        itemData.TerugkerendTot = new Date(domRefsMeldingZV.terugkerendTotInput.value).toISOString();
    } else {
        itemData.TerugkeerPatroon = null; 
        itemData.TerugkerendTot = null;
    }
    
    console.log("[MeldingZittingsvrij] Item data voor SharePoint:", itemData);

    try {
        if (typeof window.createSPListItem !== 'function') {
            throw new Error("Fout: Functie voor data opslaan (createSPListItem) is niet beschikbaar. Machtigingen.js correct geladen?");
        }
        const lijstConfigKey = "IncidenteelZittingVrij";
        
        await window.createSPListItem(lijstConfigKey, itemData); 
        
        toonStatusBerichtMeldingZV("Zittingvrij melding succesvol opgeslagen!", "success", false);
        if(domRefsMeldingZV.form) domRefsMeldingZV.form.reset(); 
        haalMedewerkerGegevensUitUrlMeldingZV(); // Herstel gebruikersnaam veld naar readonly indien van toepassing
        vulFormulierInitieelInMeldingZV(); 
        toggleTerugkerendeVeldenMeldingZV();
        if(domRefsMeldingZV.gebruikersnaamStatus) updateGebruikersnaamStatusMeldingZV("", ""); 

    } catch (error) {
        console.error("[MeldingZittingsvrij] Fout bij opslaan zittingvrij melding:", error);
        toonStatusBerichtMeldingZV(`Fout bij opslaan: ${error.message}. Probeer het opnieuw.`, "error", false);
    } finally {
        if(domRefsMeldingZV.indienenButton) domRefsMeldingZV.indienenButton.disabled = false;
    }
}

/**
 * Toont een statusbericht aan de gebruiker.
 */
function toonStatusBerichtMeldingZV(bericht, type = 'info', autoVerbergen = true) {
    if (!domRefsMeldingZV.statusBerichtDiv) {
        console.warn("[MeldingZittingsvrij] Status bericht div niet gevonden.");
        return;
    }

    domRefsMeldingZV.statusBerichtDiv.textContent = bericht;
    domRefsMeldingZV.statusBerichtDiv.className = 'mt-6 p-4 text-sm rounded-lg border'; 

    switch (type) {
        case 'success':
            domRefsMeldingZV.statusBerichtDiv.classList.add('status-success', 'bg-green-100', 'border-green-400', 'text-green-700', 'dark:bg-green-700', 'dark:text-green-100', 'dark:border-green-600');
            break;
        case 'error':
            domRefsMeldingZV.statusBerichtDiv.classList.add('status-error', 'bg-red-100', 'border-red-400', 'text-red-700', 'dark:bg-red-700', 'dark:text-red-100', 'dark:border-red-600');
            break;
        case 'info':
        default:
            domRefsMeldingZV.statusBerichtDiv.classList.add('status-info', 'bg-blue-100', 'border-blue-400', 'text-blue-700', 'dark:bg-blue-700', 'dark:text-blue-100', 'dark:border-blue-600');
            break;
    }
    domRefsMeldingZV.statusBerichtDiv.classList.remove('hidden');

    if (autoVerbergen) {
        setTimeout(() => {
            if (domRefsMeldingZV.statusBerichtDiv) { 
                 domRefsMeldingZV.statusBerichtDiv.classList.add('hidden');
            }
        }, 7000);
    }
}

/**
 * Werkt het jaartal in de footer bij.
 */
function updateJaarInFooterMeldingZV() {
    if (domRefsMeldingZV.currentYearSpan) {
        domRefsMeldingZV.currentYearSpan.textContent = new Date().getFullYear();
    }
}

// Wacht tot de DOM geladen is en de afhankelijke scripts.
// De 'probeerInitialisatie' logica is nu vervangen door de promise-based aanpak in initializePaginaMeldingZV.
document.addEventListener('DOMContentLoaded', initializePaginaMeldingZV);

console.log("[MeldingZittingsvrij] meldingZittingsvrij_logic.js geladen en wacht op DOMContentLoaded.");