// Pages/JS/gInstellingen_logic.js

/**
 * Logica voor de gInstellingen.html pagina.
 * Beheert het laden en opslaan van gebruikersspecifieke instellingen en
 * het weergeven van persoonlijke gegevens en werkroosterinformatie, inclusief het bewerken van het werkrooster.
 */

// BELANGRIJK: Statisch gedefinieerd relatief pad naar de SharePoint-site.
const GINSTELLINGEN_SITE_URL = "/sites/MulderT/CustomPW/Verlof/"; // Pas aan indien nodig!

// Globale variabelen
let spWebAbsoluteUrlInstellingen = ''; // Wordt dynamisch gevuld
let huidigeGebruikerInstellingen = {
    loginNaam: null, // Volledige SharePoint loginnaam (bijv. i:0#.w|domein\gebruiker)
    normalizedUsername: null, // Gebruikersnaam zonder prefix (bijv. domein\gebruiker)
    Id: null, // SharePoint User ID
    Title: null, // Weergavenaam van SharePoint gebruiker
    Email: null, // E-mailadres van SharePoint gebruiker
    medewerkerData: null, // Object met gegevens uit de 'Medewerkers' lijst
    gebruikersInstellingenSP: null, // Object met gegevens uit de 'gebruikersInstellingen' lijst
    urenPerWeekActueel: null, // Huidig geldige werkrooster item uit 'UrenPerWeek'
    alleUrenPerWeekHistorie: [] // Array met alle werkrooster items voor de gebruiker
};
let alleDagenIndicatorsData = []; // Cache voor 'DagenIndicators' lijstdata

// DOM Referenties
const domInstellingenRefs = {
    appBody: document.body,
    tabButtons: document.querySelectorAll('.tab-button'),
    tabContents: document.querySelectorAll('.tab-content'),
    // Persoonlijke Gegevens Tab
    pgNaamInput: document.getElementById('pg-naam'),
    pgUsernameInput: document.getElementById('pg-username'),
    pgEmailInput: document.getElementById('pg-email'),
    pgTeamInput: document.getElementById('pg-team'), // Is dit een select of input? HTML wijst op input, logica op select.
    pgFunctieInput: document.getElementById('pg-functie'), // Zelfde als hierboven.
    pgProfielFoto: document.getElementById('pg-profile-pic'), // Toegevoegd voor profielfoto
    // Werkrooster Sectie
    werkdagenDisplayContainer: document.getElementById('werkdagen-display-container'), // Container voor de weergave van het rooster
    werkdagenTabelBody: document.getElementById('werkdagen-tabel-body'), // Specifiek voor de tabel body
    roosterGeldigVanaf: document.getElementById('rooster-geldig-vanaf'), // Element om "geldig vanaf" te tonen
    wijzigWerkroosterKnop: document.getElementById('wijzig-werkrooster-knop'),
    werkroosterEditFormContainer: document.getElementById('werkrooster-edit-form-container'),
    werkroosterIngangsdatumInput: document.getElementById('werkrooster-ingangsdatum'),
    werkroosterInputRows: document.getElementById('werkrooster-input-rows'),
    opslaanWerkroosterKnop: document.getElementById('opslaan-werkrooster-knop'),
    annuleerWerkroosterKnop: document.getElementById('annuleer-werkrooster-knop'),
    werkroosterStatusBericht: document.getElementById('werkrooster-status-bericht'),
    // Rooster Instellingen Tab
    instellingenForm: document.getElementById('rooster-instellingen-form'),
    instThemaSelect: document.getElementById('inst-thema'),
    instEigenTeamCheckbox: document.getElementById('inst-eigen-team'),
    instWeekendenCheckbox: document.getElementById('inst-weekenden'),
    opslaanInstellingenButton: document.getElementById('opslaan-instellingen-button'),
    instellingenStatusBericht: document.getElementById('instellingen-status-bericht'),
    // Algemeen
    currentYearSpan: document.getElementById('current-year'),
    pageTitleHeader: document.querySelector('#app-container > header h1'),
    pageSubtitleHeader: document.querySelector('#app-container > header p'),
    // Titels binnen tabs voor eventuele dynamische aanpassingen
    persGegevensTitle: document.querySelector('#tab-content-persoonlijk > h2'),
    roosterInstTitle: document.querySelector('#tab-content-instellingen > h2'),
    werkdagenTitle: document.querySelector('#persoonlijke-gegevens-form div > h3') // Aangepast selector
};

const DAGEN_VAN_DE_WEEK = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"]; // Zaterdag en Zondag worden niet verwacht in UrenPerWeek

// --- Hulpfuncties ---

/**
 * Trimt de prefix van een SharePoint loginnaam.
 * @param {string} loginNaam - De volledige loginnaam.
 * @returns {string} De getrimde loginnaam, of een lege string als input null/undefined is.
 */
function trimLoginNaamPrefixInstellingen(loginNaam) {
    if (!loginNaam) return '';
    const prefixesToRemove = ["i:0#.w|", "c:0(.s|true|", "i:05.t|"]; // Voeg eventueel andere prefixes toe
    for (const prefix of prefixesToRemove) {
        if (loginNaam.toLowerCase().startsWith(prefix.toLowerCase())) {
            return loginNaam.substring(prefix.length);
        }
    }
    // Fallback voor het geval er een onverwachte prefix is of een pipe aan het begin
    return loginNaam.startsWith('|') ? loginNaam.substring(1) : loginNaam;
}

// --- Initialisatie & Context ---

/**
 * Initialiseert de SharePoint context (web URL en gebruikersinformatie).
 * Haalt gegevens op via de SharePoint REST API.
 * @returns {Promise<boolean>} True als de context succesvol is geïnitialiseerd, anders false.
 */
async function initializeInstellingenContext() {
    console.log("[gInstellingen] Initialiseren SharePoint context...");
    if (!GINSTELLINGEN_SITE_URL || typeof GINSTELLINGEN_SITE_URL !== 'string' || GINSTELLINGEN_SITE_URL.trim() === "") {
        const foutmelding = "[gInstellingen] Kritische fout: GINSTELLINGEN_SITE_URL is niet correct gedefinieerd in dit script. Pagina kan niet laden.";
        console.error(foutmelding);
        toonInstellingenStatusBericht(foutmelding, "error", false);
        if (domInstellingenRefs.opslaanInstellingenButton) domInstellingenRefs.opslaanInstellingenButton.disabled = true;
        if (domInstellingenRefs.opslaanWerkroosterKnop) domInstellingenRefs.opslaanWerkroosterKnop.disabled = true;
        return false;
    }

    // Bepaal het absolute pad naar de site
    const sitePath = GINSTELLINGEN_SITE_URL.replace(/\/$/, ""); // Verwijder eventuele trailing slash
    const basisUrl = window.location.origin; // e.g., https://som.org.om.local

    try {
        // Stap 1: Haal de absolute URL van de web op
        const webApiUrl = `${basisUrl}${sitePath}/_api/web?$select=Url`;
        console.log(`[gInstellingen] Web URL ophalen via: ${webApiUrl}`);
        const webResponse = await fetch(webApiUrl, { headers: { 'Accept': 'application/json;odata=verbose' } });
        if (!webResponse.ok) {
            const errorDetail = await webResponse.text().catch(() => `Status: ${webResponse.statusText}`);
            console.error(`[gInstellingen] Fout ${webResponse.status} bij ophalen web URL. Details: ${errorDetail}`);
            throw new Error(`Kan web URL niet ophalen (status: ${webResponse.status})`);
        }
        const webData = await webResponse.json();
        spWebAbsoluteUrlInstellingen = webData.d.Url;
        if (!spWebAbsoluteUrlInstellingen.endsWith('/')) {
            spWebAbsoluteUrlInstellingen += '/';
        }
        console.log(`[gInstellingen] SharePoint site URL ingesteld op: ${spWebAbsoluteUrlInstellingen}`);

        // Stap 2: Haal gegevens van de huidige gebruiker op
        const userApiUrl = `${spWebAbsoluteUrlInstellingen}_api/web/currentuser?$select=LoginName,Title,Id,Email`;
        console.log(`[gInstellingen] Gebruikersinformatie ophalen via: ${userApiUrl}`);
        const userResponse = await fetch(userApiUrl, { headers: { 'Accept': 'application/json;odata=verbose' } });
        if (!userResponse.ok) {
            const errorDetail = await userResponse.text().catch(() => `Status: ${userResponse.statusText}`);
            console.error(`[gInstellingen] Fout ${userResponse.status} bij ophalen gebruiker info. Details: ${errorDetail}`);
            throw new Error(`Kan gebruiker info niet ophalen (status: ${userResponse.status})`);
        }
        const userData = await userResponse.json();
        huidigeGebruikerInstellingen.loginNaam = userData.d.LoginName;
        huidigeGebruikerInstellingen.normalizedUsername = trimLoginNaamPrefixInstellingen(userData.d.LoginName);
        huidigeGebruikerInstellingen.Id = userData.d.Id;
        huidigeGebruikerInstellingen.Title = userData.d.Title;
        huidigeGebruikerInstellingen.Email = userData.d.Email;

        console.log(`[gInstellingen] Context succesvol opgehaald. Gebruiker: ${huidigeGebruikerInstellingen.Title} (${huidigeGebruikerInstellingen.normalizedUsername})`);
        return true;
    } catch (error) {
        console.error("[gInstellingen] Kritische fout bij ophalen context:", error);
        toonInstellingenStatusBericht(`Kan geen verbinding maken met de server (${error.message}). Controleer de console.`, "error", false);
        if (domInstellingenRefs.opslaanInstellingenButton) domInstellingenRefs.opslaanInstellingenButton.disabled = true;
        if (domInstellingenRefs.opslaanWerkroosterKnop) domInstellingenRefs.opslaanWerkroosterKnop.disabled = true;
        return false;
    }
}

/**
 * Haalt items op uit een SharePoint lijst via REST API.
 * @param {string} lijstIdentifier - De key van de lijstconfiguratie (uit configLijst.js) of de lijsttitel/GUID.
 * @param {string} [selectQuery=""] - OData $select query.
 * @param {string} [filterQuery=""] - OData $filter query.
 * @param {string} [expandQuery=""] - OData $expand query.
 * @param {string} [orderbyQuery=""] - OData $orderby query.
 * @returns {Promise<Array>} Een array met de opgehaalde lijstitems, of een lege array bij een fout.
 */
async function haalInstellingenLijstItems(lijstIdentifier, selectQuery = "", filterQuery = "", expandQuery = "", orderbyQuery = "") {
    if (!spWebAbsoluteUrlInstellingen) {
        console.error(`[gInstellingen] haalInstellingenLijstItems: spWebAbsoluteUrlInstellingen is niet beschikbaar. Kan lijst '${lijstIdentifier}' niet ophalen.`);
        toonInstellingenStatusBericht(`Fout: Serververbinding niet beschikbaar voor lijst '${lijstIdentifier}'.`, "error", false);
        return [];
    }

    // Probeer configuratie op te halen met getLijstConfig (ervan uitgaande dat deze globaal beschikbaar is)
    const lijstConfig = typeof getLijstConfig === 'function' ? getLijstConfig(lijstIdentifier) : null;
    if (!lijstConfig) {
        console.error(`[gInstellingen] Kon lijst configuratie niet vinden voor identifier: ${lijstIdentifier} via getLijstConfig.`);
        // Toon alleen statusbericht als het niet om gebruikersinstellingen gaat (om dubbele meldingen te voorkomen)
        if (lijstIdentifier !== "gebruikersInstellingen") {
            toonInstellingenStatusBericht(`Configuratiefout voor lijst '${lijstIdentifier}'. Controleer configLijst.js.`, "error", false);
        }
        return [];
    }

    const lijstIdOfTitel = lijstConfig.lijstId || lijstConfig.lijstTitel; // Gebruik GUID indien beschikbaar, anders titel
    const lijstWeergaveNaam = lijstConfig.lijstTitel || lijstIdentifier; // Voor logging en statusberichten

    let apiUrlPath;
    // Controleer of lijstIdOfTitel een GUID is
    if (/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/.test(lijstIdOfTitel)) {
        apiUrlPath = `/_api/web/lists(guid'${lijstIdOfTitel}')/items`;
    } else {
        apiUrlPath = `/_api/web/lists/getByTitle('${encodeURIComponent(lijstIdOfTitel)}')/items`;
    }

    let queryParams = [];
    if (selectQuery) queryParams.push(selectQuery);
    if (filterQuery) queryParams.push(filterQuery);
    if (expandQuery) queryParams.push(expandQuery);
    if (orderbyQuery) queryParams.push(orderbyQuery);

    const apiUrl = `${spWebAbsoluteUrlInstellingen.replace(/\/$/, "")}${apiUrlPath}${queryParams.length > 0 ? '?' + queryParams.join('&') : ''}`;
    console.log(`[gInstellingen] Ophalen items voor lijst '${lijstWeergaveNaam}': ${decodeURIComponent(apiUrl)}`);

    try {
        if (lijstIdentifier !== "gebruikersInstellingen") { // Voorkom statusbericht voor stille instellingen-check
            toonInstellingenStatusBericht(`Laden data voor '${lijstWeergaveNaam}'...`, "info", false);
        }
        const response = await fetch(apiUrl, { method: 'GET', headers: { 'Accept': 'application/json;odata=verbose' } });
        if (!response.ok) {
            let errorDetail = `Status: ${response.status} ${response.statusText}. URL: ${apiUrl}`;
            try {
                const errorData = await response.json();
                errorDetail = errorData.error?.message?.value || errorDetail;
            } catch (e) { /* Kon JSON niet parsen, gebruik de statusText */ }
            console.error(`[gInstellingen] Fout bij ophalen lijst '${lijstWeergaveNaam}': ${errorDetail}`);
            if (lijstIdentifier !== "gebruikersInstellingen") {
                toonInstellingenStatusBericht(`Fout bij laden van lijst '${lijstWeergaveNaam}': ${errorDetail}`, "error", false);
            }
            return [];
        }
        const data = await response.json();
        const itemCount = data.d.results ? data.d.results.length : 0;
        if (lijstIdentifier !== "gebruikersInstellingen") {
            toonInstellingenStatusBericht(`${itemCount} items geladen voor '${lijstWeergaveNaam}'.`, "success", true);
        }
        return data.d.results || [];
    } catch (error) {
        console.error(`[gInstellingen] Uitzondering bij ophalen lijst '${lijstWeergaveNaam}':`, error);
        if (lijstIdentifier !== "gebruikersInstellingen") {
            toonInstellingenStatusBericht(`Netwerkfout bij laden van lijst '${lijstWeergaveNaam}': ${error.message}`, "error", false);
        }
        return [];
    }
}


// --- Thema Functies ---

/**
 * Past de thema klassen (light/dark) toe op het body element.
 * @param {string} thema - Het toe te passen thema ('light' of 'dark').
 */
function pasThemaKlassenToe(thema) {
    const isLichtThema = thema === 'light';
    if (domInstellingenRefs.appBody) {
        domInstellingenRefs.appBody.classList.toggle('light-theme', isLichtThema);
        domInstellingenRefs.appBody.classList.toggle('dark-theme', !isLichtThema); // Zorg dat altijd één van de twee actief is
        console.log(`[gInstellingen] Thema klassen op body bijgewerkt naar: ${domInstellingenRefs.appBody.className}`);
    } else {
        console.warn("[gInstellingen] appBody DOM referentie niet gevonden voor thema aanpassing.");
    }
}

/**
 * Laadt het thema uit localStorage en/of SharePoint en past het toe.
 */
async function laadEnPasThemaToe() {
    console.log("[gInstellingen] Start laadEnPasThemaToe.");
    const opgeslagenThema = localStorage.getItem('gInstellingenThema'); // Thema specifiek voor deze pagina
    if (opgeslagenThema) {
        console.log(`[gInstellingen] Thema '${opgeslagenThema}' gevonden in localStorage.`);
        pasThemaKlassenToe(opgeslagenThema);
        // We proberen nog steeds van SP te laden om te zien of er een recentere instelling is.
    } else {
        console.log("[gInstellingen] Geen thema in localStorage, standaard (dark) wordt initieel gebruikt.");
        pasThemaKlassenToe('dark'); // Default naar donker als niets in localStorage
    }

    if (!huidigeGebruikerInstellingen.normalizedUsername) {
        console.warn("[gInstellingen] Kan thema niet ophalen van SharePoint: normalizedUsername ontbreekt.");
        return; // Kan niet verder zonder gebruikersnaam
    }

    try {
        const instellingenConfig = typeof getLijstConfig === 'function' ? getLijstConfig("gebruikersInstellingen") : null;
        if (!instellingenConfig) {
            console.warn("[gInstellingen] Configuratie voor 'gebruikersInstellingen' lijst niet gevonden. Kan thema niet ophalen van SP.");
            return;
        }

        const filterQuery = `$filter=Title eq '${huidigeGebruikerInstellingen.normalizedUsername}'`;
        const selectQuery = "$select=ID,Title,soortWeergave,EigenTeamWeergeven,WeekendenWeergeven"; // Velden die we toch al nodig hebben
        const instellingenItems = await haalInstellingenLijstItems("gebruikersInstellingen", selectQuery, filterQuery);

        if (instellingenItems && instellingenItems.length > 0) {
            huidigeGebruikerInstellingen.gebruikersInstellingenSP = instellingenItems[0]; // Cache de volledige instelling
            const themaVanSP = instellingenItems[0].soortWeergave;
            if (themaVanSP === 'dark' || themaVanSP === 'light') {
                console.log(`[gInstellingen] Thema '${themaVanSP}' opgehaald van SharePoint.`);
                pasThemaKlassenToe(themaVanSP);
                localStorage.setItem('gInstellingenThema', themaVanSP); // Update localStorage met de SP waarde
            } else {
                console.warn(`[gInstellingen] Ongeldige themawaarde '${themaVanSP}' ontvangen van SharePoint. Huidig thema (localStorage/default) blijft actief.`);
            }
        } else {
            console.log("[gInstellingen] Geen specifieke thema-instelling gevonden voor gebruiker in SharePoint. Huidig (localStorage/default) thema blijft actief.");
            // Als er geen instellingen zijn in SP, maak een default object aan voor latere opslag
            huidigeGebruikerInstellingen.gebruikersInstellingenSP = {
                Title: huidigeGebruikerInstellingen.normalizedUsername,
                soortWeergave: opgeslagenThema || 'dark', // Gebruik localStorage of default
                EigenTeamWeergeven: false, // Default waarde
                WeekendenWeergeven: true // Default waarde
            };
        }
    } catch (error) {
        console.error("[gInstellingen] Fout bij ophalen thema-instellingen van SharePoint:", error);
        // Bij fout, val terug op localStorage of default als die er niet is
        if (!opgeslagenThema) pasThemaKlassenToe('dark');
    }
    // Zorg dat de select in de UI overeenkomt met het actieve thema
    if (domInstellingenRefs.instThemaSelect) {
        domInstellingenRefs.instThemaSelect.value = domInstellingenRefs.appBody.classList.contains('dark-theme') ? 'dark' : 'light';
    }
}

/**
 * Past het thema aan en slaat de keuze op in localStorage.
 * De daadwerkelijke opslag naar SharePoint gebeurt via handleInstellingenOpslaan.
 * @param {string} thema - Het te activeren thema ('light' of 'dark').
 */
function pasThemaEnSlaOpNaarLocalStorage(thema) {
    pasThemaKlassenToe(thema);
    localStorage.setItem('gInstellingenThema', thema);
    // Zorg dat de select input de juiste waarde toont
    if (domInstellingenRefs.instThemaSelect && domInstellingenRefs.instThemaSelect.value !== thema) {
        domInstellingenRefs.instThemaSelect.value = thema;
    }
    console.log(`[gInstellingen] Thema lokaal opgeslagen en UI bijgewerkt naar: ${thema}`);
}


// --- Data Laden & UI Vullen ---

/**
 * Laadt team- en functiegegevens voor dropdowns in de "Persoonlijke Gegevens" tab.
 * Deze functie wordt aangeroepen nadat de context is geïnitialiseerd.
 */
async function laadTeamEnFunctieOpties() {
    console.log("[gInstellingen] Start laadTeamEnFunctieOpties.");
    try {
        // Haal Teams op (alleen actieve teams)
        const teamsData = await haalInstellingenLijstItems("Teams", "$select=ID,Title,Naam,Actief", "$filter=Actief eq 1", "", "Naam asc");
        const pgTeamSelect = domInstellingenRefs.pgTeamInput; // Dit is een <input>, geen <select> in de HTML. Moet dit een select worden?

        if (pgTeamSelect && pgTeamSelect.tagName === 'SELECT') { // Alleen vullen als het een SELECT is
            pgTeamSelect.innerHTML = '<option value="">Selecteer een team...</option>';
            teamsData.forEach(team => {
                const option = document.createElement('option');
                option.value = team.Naam || team.Title; // Gebruik Naam als voorkeur, anders Title
                option.textContent = team.Naam || team.Title;
                pgTeamSelect.appendChild(option);
            });
        } else if (pgTeamSelect) {
            console.warn("[gInstellingen] pgTeamInput is een <input> element, geen <select>. Kan team opties niet laden als dropdown.");
        }

        // Haal Functies op
        const functiesData = await haalInstellingenLijstItems("keuzelijstFuncties", "$select=ID,Title", "", "", "Title asc");
        const pgFunctieSelect = domInstellingenRefs.pgFunctieInput; // Zelfde als hierboven

        if (pgFunctieSelect && pgFunctieSelect.tagName === 'SELECT') {
            pgFunctieSelect.innerHTML = '<option value="">Selecteer een functie...</option>';
            functiesData.forEach(functie => {
                const option = document.createElement('option');
                option.value = functie.Title;
                option.textContent = functie.Title;
                pgFunctieSelect.appendChild(option);
            });
        } else if (pgFunctieSelect) {
            console.warn("[gInstellingen] pgFunctieInput is een <input> element, geen <select>. Kan functie opties niet laden als dropdown.");
        }

        // Stel huidige waarden in als medewerkerData beschikbaar is (na laadGebruikersGegevens)
        if (huidigeGebruikerInstellingen.medewerkerData) {
            if (pgTeamSelect && pgTeamSelect.tagName === 'SELECT' && huidigeGebruikerInstellingen.medewerkerData.Team) {
                pgTeamSelect.value = huidigeGebruikerInstellingen.medewerkerData.Team;
            } else if (pgTeamSelect && huidigeGebruikerInstellingen.medewerkerData.Team) {
                pgTeamSelect.value = huidigeGebruikerInstellingen.medewerkerData.Team; // Voor input veld
            }
            if (pgFunctieSelect && pgFunctieSelect.tagName === 'SELECT' && huidigeGebruikerInstellingen.medewerkerData.Functie) {
                pgFunctieSelect.value = huidigeGebruikerInstellingen.medewerkerData.Functie;
            } else if (pgFunctieSelect && huidigeGebruikerInstellingen.medewerkerData.Functie) {
                pgFunctieSelect.value = huidigeGebruikerInstellingen.medewerkerData.Functie; // Voor input veld
            }
        }
        console.log("[gInstellingen] Teams en functies (indien van toepassing als select) geladen.");
    } catch (error) {
        console.error("[gInstellingen] Fout bij laden van teams of functies:", error);
        toonInstellingenStatusBericht("Fout bij laden van team/functie selectie opties.", "error", false);
    }
}

/**
 * Stelt de profielfoto van de gebruiker in.
 * Gebruikt window.getProfilePhotoUrl (uit profielKaarten.js) indien beschikbaar.
 */
function stelProfielfotoIn() {
    const profielFotoElement = domInstellingenRefs.pgProfielFoto;
    if (!profielFotoElement) {
        console.warn("[gInstellingen] Profielfoto element (pg-profile-pic) niet gevonden.");
        return;
    }

    const medewerker = huidigeGebruikerInstellingen.medewerkerData; // Gebruik de gecachte medewerker data

    if (typeof window.getProfilePhotoUrl === 'function' && medewerker) {
        profielFotoElement.src = window.getProfilePhotoUrl(medewerker, 'M'); // 'M' voor medium size
        console.log("[gInstellingen] Profielfoto URL via getProfilePhotoUrl:", profielFotoElement.src);
    } else {
        // Fallback naar initialen of standaardicoon
        if (medewerker && medewerker.Naam) {
            const canvas = document.createElement('canvas');
            canvas.width = 100; // Grootte van de afbeelding
            canvas.height = 100;
            const context = canvas.getContext('2d');

            // Achtergrondkleur (kan thema-afhankelijk gemaakt worden)
            context.fillStyle = domInstellingenRefs.appBody.classList.contains('dark-theme') ? '#4A5568' : '#CBD5E0'; // gray-600 / gray-400
            context.fillRect(0, 0, canvas.width, canvas.height);

            // Initialen
            const initialen = medewerker.Naam.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            context.fillStyle = domInstellingenRefs.appBody.classList.contains('dark-theme') ? '#E2E8F0' : '#2D3748'; // gray-200 / gray-700
            context.font = 'bold 40px Inter, sans-serif';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(initialen, canvas.width / 2, canvas.height / 2);
            profielFotoElement.src = canvas.toDataURL();
            console.log("[gInstellingen] Profielfoto ingesteld met initialen.");
        } else {
            profielFotoElement.src = '../Icoon/default-profile.svg'; // Pad naar default icoon
            console.log("[gInstellingen] Profielfoto ingesteld op standaardicoon.");
        }
    }

    // Fallback voor als de afbeelding niet laadt
    profielFotoElement.onerror = function() {
        this.src = '../Icoon/default-profile.svg';
        this.alt = 'Standaard profielicoon';
        console.warn("[gInstellingen] Fout bij laden profielfoto, standaardicoon wordt gebruikt.");
    };
}


/**
 * Laadt alle benodigde gebruikersgegevens (medewerkerinfo, werkrooster, instellingen).
 */
async function laadGebruikersGegevens() {
    if (!huidigeGebruikerInstellingen.normalizedUsername) {
        toonInstellingenStatusBericht("Gebruikersinformatie is onvolledig. Kan gegevens niet laden.", "error", false);
        console.error("[gInstellingen] laadGebruikersGegevens: normalizedUsername ontbreekt.");
        return;
    }
    toonInstellingenStatusBericht("Bezig met laden van uw gegevens...", "info", false);

    try {
        const dataPromises = [
            // Medewerker data ophalen
            haalInstellingenLijstItems("Medewerkers", "$select=ID,Title,Naam,Username,E_x002d_mail,Team,Functie", `$filter=Username eq '${huidigeGebruikerInstellingen.normalizedUsername}'`)
                .then(medArray => {
                    if (medArray && medArray.length > 0) {
                        huidigeGebruikerInstellingen.medewerkerData = medArray[0];
                        console.log("[gInstellingen] Medewerker data geladen:", huidigeGebruikerInstellingen.medewerkerData);
                    } else {
                        // Fallback als medewerker niet in 'Medewerkers' lijst staat (bijv. nieuwe gebruiker)
                        huidigeGebruikerInstellingen.medewerkerData = {
                            Naam: huidigeGebruikerInstellingen.Title,
                            Username: huidigeGebruikerInstellingen.normalizedUsername,
                            E_x002d_mail: huidigeGebruikerInstellingen.Email,
                            Team: "N.v.t.",
                            Functie: "N.v.t."
                        };
                        console.warn("[gInstellingen] Geen overeenkomende medewerker gevonden in 'Medewerkers' lijst. Fallback data wordt gebruikt.");
                    }
                }),
            // Werkrooster historie ophalen
            haalInstellingenLijstItems("UrenPerWeek", `$select=ID,Ingangsdatum,VeranderingsDatum,${DAGEN_VAN_DE_WEEK.map(d => `${d}Start,${d}Eind,${d}Soort`).join(',')}`, `$filter=MedewerkerID eq '${huidigeGebruikerInstellingen.normalizedUsername}'`, "", "$orderby=Ingangsdatum desc")
                .then(historieArray => {
                    huidigeGebruikerInstellingen.alleUrenPerWeekHistorie = historieArray || [];
                    // Bepaal het huidige actieve rooster (geen VeranderingsDatum of VeranderingsDatum in de toekomst)
                    huidigeGebruikerInstellingen.urenPerWeekActueel = (historieArray || []).find(item => !item.VeranderingsDatum || new Date(item.VeranderingsDatum) > new Date()) || null;
                    if (!huidigeGebruikerInstellingen.urenPerWeekActueel && historieArray && historieArray.length > 0) {
                        // Fallback als geen "actief" rooster is, neem de meest recente op basis van Ingangsdatum
                        huidigeGebruikerInstellingen.urenPerWeekActueel = historieArray[0];
                    }
                    console.log("[gInstellingen] Werkrooster historie geladen. Actueel rooster:", huidigeGebruikerInstellingen.urenPerWeekActueel);
                }),
            // Dagen indicatoren ophalen (voor werkrooster edit form)
            haalInstellingenLijstItems("DagenIndicators", "$select=ID,Title,Beschrijving")
                .then(indicators => {
                    alleDagenIndicatorsData = indicators || [];
                    console.log("[gInstellingen] Dagen indicatoren geladen:", alleDagenIndicatorsData.length, "items.");
                })
        ];

        await Promise.all(dataPromises);

        // Nu de data geladen is, vul de UI
        vulPersoonlijkeGegevensTab(); // Deze vult ook het werkrooster display/edit form
        vulRoosterInstellingenTab(); // Deze gebruikt gebruikersInstellingenSP, die via laadEnPasThemaToe al gevuld kan zijn.

        toonInstellingenStatusBericht("Gegevens succesvol geladen.", "success");
    } catch (error) {
        console.error("[gInstellingen] Fout bij laden gebruikersgegevens:", error);
        toonInstellingenStatusBericht(`Fout bij het laden van uw gegevens: ${error.message}`, "error", false);
    }
}

/**
 * Vult de "Persoonlijke Gegevens" tab met de geladen data.
 */
function vulPersoonlijkeGegevensTab() {
    console.log("[gInstellingen] Start vulPersoonlijkeGegevensTab.");
    if (huidigeGebruikerInstellingen.medewerkerData) {
        if (domInstellingenRefs.pgNaamInput) domInstellingenRefs.pgNaamInput.value = huidigeGebruikerInstellingen.medewerkerData.Naam || huidigeGebruikerInstellingen.Title || '';
        if (domInstellingenRefs.pgUsernameInput) domInstellingenRefs.pgUsernameInput.value = huidigeGebruikerInstellingen.medewerkerData.Username || huidigeGebruikerInstellingen.loginNaam || '';
        if (domInstellingenRefs.pgEmailInput) domInstellingenRefs.pgEmailInput.value = huidigeGebruikerInstellingen.medewerkerData.E_x002d_mail || huidigeGebruikerInstellingen.Email || '';

        // Als pgTeamInput en pgFunctieInput input velden zijn (zoals in HTML)
        if (domInstellingenRefs.pgTeamInput) domInstellingenRefs.pgTeamInput.value = huidigeGebruikerInstellingen.medewerkerData.Team || 'N.v.t.';
        if (domInstellingenRefs.pgFunctieInput) domInstellingenRefs.pgFunctieInput.value = huidigeGebruikerInstellingen.medewerkerData.Functie || 'N.v.t.';

        stelProfielfotoIn(); // Stel de profielfoto in
    } else {
        console.warn("[gInstellingen] Geen medewerkerData beschikbaar om persoonlijke gegevens tab te vullen.");
    }
    // Deze functie vult zowel de display als de edit form secties van het werkrooster.
    vulWerkdagenDisplayEnEditForm();
    console.log("[gInstellingen] Einde vulPersoonlijkeGegevensTab.");
}


/**
 * Vult het display van het werkrooster en de inputvelden voor het bewerken ervan.
 */
function vulWerkdagenDisplayEnEditForm() {
    console.log("[gInstellingen] Start vulWerkdagenDisplayEnEditForm.");
    const tabelBody = domInstellingenRefs.werkdagenTabelBody;
    if (!tabelBody) {
        console.error("[gInstellingen] Werkdagen tabel body (werkdagen-tabel-body) niet gevonden in DOM.");
        return;
    }
    tabelBody.innerHTML = ''; // Leeg de tabel body

    const rooster = huidigeGebruikerInstellingen.urenPerWeekActueel;
    const geldigVanafElement = domInstellingenRefs.roosterGeldigVanaf;

    if (rooster) {
        console.log("[gInstellingen] Actueel werkrooster gevonden, bezig met renderen:", rooster);
        DAGEN_VAN_DE_WEEK.forEach(dag => {
            const startTijd = rooster[`${dag}Start`];
            const eindTijd = rooster[`${dag}Eind`];
            const soortDag = rooster[`${dag}Soort`];

            const tr = document.createElement('tr');
            tr.className = "border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150";

            const tdDag = document.createElement('td');
            tdDag.className = "py-2 px-3 text-sm font-medium text-gray-800 dark:text-gray-200";
            tdDag.textContent = dag;
            tr.appendChild(tdDag);

            const tdTijden = document.createElement('td');
            tdTijden.className = "py-2 px-3 text-sm text-gray-600 dark:text-gray-400";
            if (startTijd && eindTijd) {
                tdTijden.textContent = `${startTijd} - ${eindTijd}`;
            } else {
                tdTijden.textContent = 'Niet ingeroosterd';
                tdTijden.classList.add('italic', 'text-gray-500', 'dark:text-gray-500');
            }
            tr.appendChild(tdTijden);

            const tdSoort = document.createElement('td');
            tdSoort.className = "py-2 px-3 text-sm";
            if (soortDag && soortDag !== 'Werken') {
                tdSoort.textContent = soortDag;
                // Voeg eventueel specifieke styling toe op basis van soortDag
                if (soortDag === 'VVD') tdSoort.className += ' text-blue-600 dark:text-blue-400 font-semibold';
                else if (soortDag === 'VVM') tdSoort.className += ' text-orange-600 dark:text-orange-400 font-semibold';
                else if (soortDag === 'VVO') tdSoort.className += ' text-green-600 dark:text-green-400 font-semibold';
                else tdSoort.className += ' text-gray-700 dark:text-gray-300';
            } else if (startTijd && eindTijd) {
                tdSoort.textContent = 'Werken';
                tdSoort.className += ' text-gray-700 dark:text-gray-300';
            } else {
                tdSoort.textContent = '-';
                tdSoort.className += ' text-gray-500 dark:text-gray-500';
            }
            tr.appendChild(tdSoort);
            tabelBody.appendChild(tr);
        });

        if (rooster.Ingangsdatum && geldigVanafElement) {
            geldigVanafElement.textContent = `Huidig rooster geldig vanaf: ${new Date(rooster.Ingangsdatum).toLocaleDateString('nl-NL')}`;
            geldigVanafElement.classList.remove('hidden');
        } else if (geldigVanafElement) {
            geldigVanafElement.classList.add('hidden');
        }
    } else {
        console.log("[gInstellingen] Geen actueel werkrooster gevonden.");
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 3;
        td.className = "py-3 px-4 text-sm text-center text-gray-500 dark:text-gray-400 italic";
        td.textContent = "Geen standaard werkrooster gevonden.";
        tr.appendChild(td);
        tabelBody.appendChild(tr);
        if (geldigVanafElement) geldigVanafElement.classList.add('hidden');
    }

    // Vul de input velden voor het bewerken van het werkrooster
    if (domInstellingenRefs.werkroosterInputRows) {
        domInstellingenRefs.werkroosterInputRows.innerHTML = ''; // Leeg bestaande rijen
        DAGEN_VAN_DE_WEEK.forEach(dag => {
            const rijDiv = document.createElement('div');
            rijDiv.className = 'werkrooster-edit-row grid grid-cols-4 gap-x-3 items-center px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors duration-150';

            const dagLabelDiv = document.createElement('div');
            dagLabelDiv.className = 'dag-label text-sm font-medium text-gray-700 dark:text-gray-300';
            dagLabelDiv.textContent = dag;
            rijDiv.appendChild(dagLabelDiv);

            ['start', 'eind', 'soort'].forEach(type => {
                const containerDiv = document.createElement('div');
                let inputElement;
                const idSuffix = `${dag.toLowerCase()}-${type}`;

                if (type === 'soort') {
                    inputElement = document.createElement('select');
                    inputElement.id = idSuffix;
                    inputElement.name = idSuffix;
                    inputElement.className = 'form-select w-full text-xs'; // Kleinere tekst voor select

                    const defaultOptie = document.createElement('option');
                    defaultOptie.value = 'Werken';
                    defaultOptie.textContent = 'Werken';
                    inputElement.appendChild(defaultOptie);

                    alleDagenIndicatorsData.forEach(indicator => {
                        const optie = document.createElement('option');
                        optie.value = indicator.Title;
                        optie.textContent = indicator.Beschrijving || indicator.Title;
                        inputElement.appendChild(optie);
                    });
                    if (rooster) inputElement.value = rooster[`${dag}Soort`] || 'Werken';

                } else { // start of eind
                    inputElement = document.createElement('input');
                    inputElement.type = 'time';
                    inputElement.id = idSuffix;
                    inputElement.name = idSuffix;
                    inputElement.className = 'form-input w-full text-xs'; // Kleinere tekst voor time input
                    if (rooster) inputElement.value = rooster[`${dag}${type.charAt(0).toUpperCase() + type.slice(1)}`] || '';
                }
                containerDiv.appendChild(inputElement);
                rijDiv.appendChild(containerDiv);

                // Event listener voor automatische update van 'Soort' op basis van tijden
                if (type === 'start' || type === 'eind') {
                    inputElement.addEventListener('change', () => {
                        const startInput = rijDiv.querySelector(`#${dag.toLowerCase()}-start`);
                        const eindInput = rijDiv.querySelector(`#${dag.toLowerCase()}-eind`);
                        const soortSelect = rijDiv.querySelector(`#${dag.toLowerCase()}-soort`);
                        if (startInput && eindInput && soortSelect) {
                            updateSoortBasedOnTime(dag.toLowerCase(), startInput.value, eindInput.value, soortSelect);
                        }
                    });
                }
            });
            domInstellingenRefs.werkroosterInputRows.appendChild(rijDiv);
        });
    }

    // Stel default ingangsdatum in voor nieuw rooster (morgen)
    if (domInstellingenRefs.werkroosterIngangsdatumInput) {
        const morgen = new Date();
        morgen.setDate(morgen.getDate() + 1);
        domInstellingenRefs.werkroosterIngangsdatumInput.value = morgen.toISOString().split('T')[0];
    }
    console.log("[gInstellingen] Einde vulWerkdagenDisplayEnEditForm.");
}


/**
 * Vult de "Rooster Instellingen" tab met de geladen data.
 */
function vulRoosterInstellingenTab() {
    console.log("[gInstellingen] Start vulRoosterInstellingenTab.");
    const inst = huidigeGebruikerInstellingen.gebruikersInstellingenSP;
    if (inst) {
        if (domInstellingenRefs.instThemaSelect) domInstellingenRefs.instThemaSelect.value = inst.soortWeergave || 'dark';
        if (domInstellingenRefs.instEigenTeamCheckbox) domInstellingenRefs.instEigenTeamCheckbox.checked = inst.EigenTeamWeergeven || false;
        if (domInstellingenRefs.instWeekendenCheckbox) {
            // Standaard true als het veld null of undefined is
            domInstellingenRefs.instWeekendenCheckbox.checked = (inst.WeekendenWeergeven === null || inst.WeekendenWeergeven === undefined) ? true : inst.WeekendenWeergeven;
        }
        console.log("[gInstellingen] Rooster instellingen tab gevuld met data:", inst);
    } else {
        // Default waarden als er geen instellingen zijn in SP
        if (domInstellingenRefs.instThemaSelect) domInstellingenRefs.instThemaSelect.value = 'dark';
        if (domInstellingenRefs.instEigenTeamCheckbox) domInstellingenRefs.instEigenTeamCheckbox.checked = false;
        if (domInstellingenRefs.instWeekendenCheckbox) domInstellingenRefs.instWeekendenCheckbox.checked = true;
        console.log("[gInstellingen] Geen SP instellingen gevonden, rooster instellingen tab gevuld met defaults.");
    }
    console.log("[gInstellingen] Einde vulRoosterInstellingenTab.");
}


// --- Event Handlers & Acties ---

/**
 * Verwerkt het opslaan van de algemene rooster instellingen.
 * @param {Event} event - Het submit event van het formulier.
 */
async function handleInstellingenOpslaan(event) {
    event.preventDefault();
    console.log("[gInstellingen] Start handleInstellingenOpslaan.");
    toonInstellingenStatusBericht("Bezig met opslaan van instellingen...", "info", false);
    if (domInstellingenRefs.opslaanInstellingenButton) domInstellingenRefs.opslaanInstellingenButton.disabled = true;

    const nieuweInstellingen = {
        soortWeergave: domInstellingenRefs.instThemaSelect ? domInstellingenRefs.instThemaSelect.value : 'dark',
        EigenTeamWeergeven: domInstellingenRefs.instEigenTeamCheckbox ? domInstellingenRefs.instEigenTeamCheckbox.checked : false,
        WeekendenWeergeven: domInstellingenRefs.instWeekendenCheckbox ? domInstellingenRefs.instWeekendenCheckbox.checked : true
    };
    console.log("[gInstellingen] Nieuwe instellingen voor opslaan:", nieuweInstellingen);

    try {
        const gebruikersInstConfigKey = "gebruikersInstellingen";
        const gebruikersInstConfig = typeof getLijstConfig === 'function' ? getLijstConfig(gebruikersInstConfigKey) : null;
        if (!gebruikersInstConfig) throw new Error(`Configuratie voor lijst '${gebruikersInstConfigKey}' niet gevonden.`);
        if (!huidigeGebruikerInstellingen.normalizedUsername) throw new Error("Gebruikersnaam (normalizedUsername) is niet beschikbaar.");

        // Bepaal de __metadata.type string correct
        const listTitleForType = gebruikersInstConfig.lijstTitel;
        // Verwijder spaties en maak eerste letter hoofdletter voor SharePoint type
        const typeName = listTitleForType.charAt(0).toUpperCase() + listTitleForType.slice(1).replace(/\s+/g, '_');

        const itemData = {
            __metadata: { "type": `SP.Data.${typeName}ListItem` }, // Bijv. SP.Data.GebruikersInstellingenListItem (afhankelijk van lijstTitel)
            Title: huidigeGebruikerInstellingen.normalizedUsername, // Username als Title
            soortWeergave: nieuweInstellingen.soortWeergave,
            EigenTeamWeergeven: nieuweInstellingen.EigenTeamWeergeven,
            WeekendenWeergeven: nieuweInstellingen.WeekendenWeergeven
        };

        let itemBestaat = false;
        let bestaandItemId = null;

        // Controleer of we al een ID hebben voor de gebruikersinstellingen
        if (huidigeGebruikerInstellingen.gebruikersInstellingenSP && huidigeGebruikerInstellingen.gebruikersInstellingenSP.ID) {
            itemBestaat = true;
            bestaandItemId = huidigeGebruikerInstellingen.gebruikersInstellingenSP.ID;
            console.log(`[gInstellingen] Bestaand item ID gevonden in cache: ${bestaandItemId}`);
        } else {
            // Als niet in cache, probeer het item op te halen om te zien of het bestaat
            const filter = `$filter=Title eq '${huidigeGebruikerInstellingen.normalizedUsername}'`;
            const bestaandeItems = await haalInstellingenLijstItems(gebruikersInstConfigKey, "$select=ID", filter);
            if (bestaandeItems && bestaandeItems.length > 0) {
                itemBestaat = true;
                bestaandItemId = bestaandeItems[0].ID;
                // Update de cache met het gevonden ID
                huidigeGebruikerInstellingen.gebruikersInstellingenSP = {
                    ...(huidigeGebruikerInstellingen.gebruikersInstellingenSP || {}), // Behoud eventuele andere gecachte data
                    ID: bestaandItemId,
                    Title: huidigeGebruikerInstellingen.normalizedUsername // Zorg dat Title ook in cache zit
                };
                console.log(`[gInstellingen] Bestaand item ID ${bestaandItemId} opgehaald van SP.`);
            }
        }

        if (itemBestaat && bestaandItemId) {
            console.log(`[gInstellingen] Item ${bestaandItemId} bijwerken...`);
            await updateInstellingenItem(gebruikersInstConfig.lijstId, bestaandItemId, itemData);
        } else {
            console.log("[gInstellingen] Nieuw item aanmaken...");
            const nieuwItem = await createInstellingenItem(gebruikersInstConfig.lijstId, itemData);
            // Update de cache met het nieuwe item (inclusief het nieuwe ID)
            if (nieuwItem && nieuwItem.d) {
                huidigeGebruikerInstellingen.gebruikersInstellingenSP = nieuwItem.d;
                console.log(`[gInstellingen] Nieuw item aangemaakt met ID: ${nieuwItem.d.ID}`);
            } else {
                // Als createInstellingenItem geen data teruggeeft, probeer het opnieuw op te halen
                const filter = `$filter=Title eq '${huidigeGebruikerInstellingen.normalizedUsername}'`;
                const itemsNaCreate = await haalInstellingenLijstItems(gebruikersInstConfigKey, "$select=ID,Title,EigenTeamWeergeven,soortWeergave,WeekendenWeergeven", filter);
                if (itemsNaCreate && itemsNaCreate.length > 0) {
                    huidigeGebruikerInstellingen.gebruikersInstellingenSP = itemsNaCreate[0];
                    console.log(`[gInstellingen] Nieuw item data (ID: ${itemsNaCreate[0].ID}) opnieuw opgehaald na creatie.`);
                } else {
                    console.error("[gInstellingen] Kon nieuw aangemaakt item niet direct ophalen.");
                }
            }
        }
        // Zorg dat de lokale cache van gebruikersInstellingen up-to-date is met wat zojuist is opgeslagen
        huidigeGebruikerInstellingen.gebruikersInstellingenSP = {
            ...huidigeGebruikerInstellingen.gebruikersInstellingenSP, // Behoud ID en Title
            soortWeergave: nieuweInstellingen.soortWeergave,
            EigenTeamWeergeven: nieuweInstellingen.EigenTeamWeergeven,
            WeekendenWeergeven: nieuweInstellingen.WeekendenWeergeven
        };

        toonInstellingenStatusBericht("Instellingen succesvol opgeslagen!", "success");
        pasThemaEnSlaOpNaarLocalStorage(nieuweInstellingen.soortWeergave); // Update thema en localStorage

        // Communiceer wijzigingen naar de hoofdpagina indien geopend via opener/parent
        if (window.opener && typeof window.opener.updateGebruikersInstellingen === 'function') {
            window.opener.updateGebruikersInstellingen(huidigeGebruikerInstellingen.gebruikersInstellingenSP);
            console.log("[gInstellingen] Instellingen doorgegeven aan opener window.");
        } else if (window.parent && window.parent !== window && typeof window.parent.updateGebruikersInstellingen === 'function') {
            window.parent.updateGebruikersInstellingen(huidigeGebruikerInstellingen.gebruikersInstellingenSP);
            console.log("[gInstellingen] Instellingen doorgegeven aan parent window.");
        }

    } catch (error) {
        console.error("[gInstellingen] Fout tijdens opslaan instellingen:", error);
        toonInstellingenStatusBericht(`Fout: ${error.message || "Kon instellingen niet opslaan."}`, "error", false);
    } finally {
        if (domInstellingenRefs.opslaanInstellingenButton) domInstellingenRefs.opslaanInstellingenButton.disabled = false;
    }
    console.log("[gInstellingen] Einde handleInstellingenOpslaan.");
}


/**
 * Haalt een X-RequestDigest op voor POST/MERGE/DELETE operaties.
 * @returns {Promise<string>} De Form Digest Value.
 * @throws {Error} Als de Request Digest niet opgehaald kan worden.
 */
async function getInstellingenRequestDigest() {
    if (!spWebAbsoluteUrlInstellingen) throw new Error("Web absolute URL niet beschikbaar voor Request Digest.");
    const apiUrl = `${spWebAbsoluteUrlInstellingen.replace(/\/$/, "")}/_api/contextinfo`;
    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Accept': 'application/json;odata=verbose' } });
    if (!response.ok) {
        const errorText = await response.text().catch(() => "Onbekende serverfout.");
        console.error(`[gInstellingen] Fout bij ophalen Request Digest: ${response.status}`, errorText);
        throw new Error(`Kon Request Digest niet ophalen (${response.status}). Details: ${errorText}`);
    }
    const data = await response.json();
    return data.d.GetContextWebInformation.FormDigestValue;
}

/**
 * Maakt een nieuw item aan in een SharePoint lijst.
 * @param {string} lijstGuid - De GUID van de SharePoint lijst.
 * @param {object} itemData - Het object met de data voor het nieuwe item.
 * @returns {Promise<object|null>} Het aangemaakte item data of null.
 * @throws {Error} Bij een fout tijdens het aanmaken.
 */
async function createInstellingenItem(lijstGuid, itemData) {
    const requestDigest = await getInstellingenRequestDigest();
    const apiUrl = `${spWebAbsoluteUrlInstellingen.replace(/\/$/, "")}/_api/web/lists(guid'${lijstGuid}')/items`;
    console.log(`[gInstellingen] createInstellingenItem - API call naar: ${apiUrl}`, itemData);
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
            'X-RequestDigest': requestDigest
        },
        body: JSON.stringify(itemData)
    });
    if (!response.ok && response.status !== 201) { // 201 Created is ook een succesvolle response
        const errorData = await response.json().catch(() => ({ "error": { "message": { "value": "Onbekende serverfout bij parsen error response." } } }));
        const spErrorMessage = errorData.error?.message?.value || `HTTP error ${response.status}`;
        console.error(`[gInstellingen] Fout bij aanmaken item (status ${response.status}): ${spErrorMessage}`);
        throw new Error(spErrorMessage);
    }
    console.log(`[gInstellingen] Item succesvol aangemaakt. Status: ${response.status}`);
    return response.status === 201 ? await response.json() : null; // Geef JSON terug bij 201
}

/**
 * Werkt een bestaand item bij in een SharePoint lijst.
 * @param {string} lijstGuid - De GUID van de SharePoint lijst.
 * @param {number} itemId - Het ID van het item dat bijgewerkt moet worden.
 * @param {object} itemData - Het object met de data voor de update.
 * @returns {Promise<boolean>} True als succesvol.
 * @throws {Error} Bij een fout tijdens het bijwerken.
 */
async function updateInstellingenItem(lijstGuid, itemId, itemData) {
    const requestDigest = await getInstellingenRequestDigest();
    const apiUrl = `${spWebAbsoluteUrlInstellingen.replace(/\/$/, "")}/_api/web/lists(guid'${lijstGuid}')/items(${itemId})`;
    console.log(`[gInstellingen] updateInstellingenItem - API call naar: ${apiUrl}`, itemData);
    const response = await fetch(apiUrl, {
        method: 'POST', // Gebruik POST voor MERGE
        headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
            'X-RequestDigest': requestDigest,
            'IF-MATCH': '*', // Noodzakelijk voor updates om concurrency te beheren
            'X-HTTP-Method': 'MERGE' // Specificeert een update operatie
        },
        body: JSON.stringify(itemData)
    });
    if (response.status !== 204) { // 204 No Content is de verwachte succes response voor MERGE
        const errorData = await response.json().catch(() => ({ "error": { "message": { "value": "Onbekende serverfout bij parsen error response." } } }));
        const spErrorMessage = errorData.error?.message?.value || `HTTP error ${response.status}`;
        console.error(`[gInstellingen] Fout bij bijwerken item (status ${response.status}): ${spErrorMessage}`);
        throw new Error(spErrorMessage);
    }
    console.log(`[gInstellingen] Item succesvol bijgewerkt. Status: ${response.status}`);
    return true;
}


// --- Werkrooster Edit Functies ---

/**
 * Schakelt tussen de weergave- en bewerkingsmodus van het werkrooster.
 * @param {boolean} bewerken - True om naar bewerkingsmodus te gaan, false voor weergavemodus.
 */
function toggleWerkroosterEditModus(bewerken) {
    console.log(`[gInstellingen] Schakelen naar werkrooster edit modus: ${bewerken}`);
    if (domInstellingenRefs.werkdagenDisplayContainer && domInstellingenRefs.werkroosterEditFormContainer && domInstellingenRefs.wijzigWerkroosterKnop) {
        if (bewerken) {
            domInstellingenRefs.werkdagenDisplayContainer.classList.add('hidden');
            domInstellingenRefs.werkroosterEditFormContainer.classList.remove('hidden');
            domInstellingenRefs.wijzigWerkroosterKnop.textContent = 'Annuleer Wijziging';
            domInstellingenRefs.wijzigWerkroosterKnop.classList.remove('bg-blue-500', 'hover:bg-blue-600', 'dark:bg-blue-600', 'dark:hover:bg-blue-700');
            domInstellingenRefs.wijzigWerkroosterKnop.classList.add('bg-gray-500', 'hover:bg-gray-600', 'dark:bg-gray-600', 'dark:hover:bg-gray-500');
        } else {
            domInstellingenRefs.werkdagenDisplayContainer.classList.remove('hidden');
            domInstellingenRefs.werkroosterEditFormContainer.classList.add('hidden');
            domInstellingenRefs.wijzigWerkroosterKnop.textContent = 'Wijzig Werkrooster';
            domInstellingenRefs.wijzigWerkroosterKnop.classList.add('bg-blue-500', 'hover:bg-blue-600', 'dark:bg-blue-600', 'dark:hover:bg-blue-700');
            domInstellingenRefs.wijzigWerkroosterKnop.classList.remove('bg-gray-500', 'hover:bg-gray-600', 'dark:bg-gray-600', 'dark:hover:bg-gray-500');
            vulWerkdagenDisplayEnEditForm(); // Reset het formulier bij annuleren
            if (domInstellingenRefs.werkroosterStatusBericht) domInstellingenRefs.werkroosterStatusBericht.classList.add('hidden');
        }
    } else {
        console.warn("[gInstellingen] Werkrooster DOM elementen niet gevonden voor toggleWerkroosterEditModus.");
    }
}

/**
 * Verwerkt het opslaan van een nieuw of gewijzigd werkrooster.
 */
async function handleWerkroosterOpslaan() {
    console.log("[gInstellingen] Poging tot opslaan werkrooster...");
    toonWerkroosterStatus("Werkrooster opslaan...", "info", false);
    if (domInstellingenRefs.opslaanWerkroosterKnop) domInstellingenRefs.opslaanWerkroosterKnop.disabled = true;

    const ingangsdatumNieuw = domInstellingenRefs.werkroosterIngangsdatumInput ? domInstellingenRefs.werkroosterIngangsdatumInput.value : null;
    if (!ingangsdatumNieuw) {
        toonWerkroosterStatus("Ingangsdatum voor het nieuwe rooster is verplicht.", "error", false);
        if (domInstellingenRefs.opslaanWerkroosterKnop) domInstellingenRefs.opslaanWerkroosterKnop.disabled = false;
        return;
    }
    // Zorg ervoor dat de datum correct als UTC wordt geïnterpreteerd om timezone problemen te voorkomen
    const [year, month, day] = ingangsdatumNieuw.split('-').map(Number);
    const nieuweIngangsdatumDate = new Date(Date.UTC(year, month - 1, day));

    const medewerkerNaamVoorTitel = huidigeGebruikerInstellingen.medewerkerData?.Naam || huidigeGebruikerInstellingen.Title || "Onbekend";
    const nieuwRoosterData = {
        Title: `Werkrooster ${medewerkerNaamVoorTitel} per ${nieuweIngangsdatumDate.toLocaleDateString('nl-NL', { timeZone: 'UTC' })}`,
        MedewerkerID: huidigeGebruikerInstellingen.normalizedUsername,
        Ingangsdatum: nieuweIngangsdatumDate.toISOString(), // Opslaan als ISO string (UTC)
        VeranderingsDatum: null // Nieuwe roosters hebben initieel geen veranderingsdatum
    };

    let isFormulierValide = true;
    DAGEN_VAN_DE_WEEK.forEach(dag => {
        const startInput = document.getElementById(`${dag.toLowerCase()}-start`);
        const eindInput = document.getElementById(`${dag.toLowerCase()}-eind`);
        const soortSelect = document.getElementById(`${dag.toLowerCase()}-soort`);

        if (!startInput || !eindInput || !soortSelect) {
            console.error(`[gInstellingen] Inputvelden voor dag '${dag}' niet gevonden.`);
            isFormulierValide = false;
            return; // Ga naar de volgende dag
        }

        nieuwRoosterData[`${dag}Start`] = startInput.value || null;
        nieuwRoosterData[`${dag}Eind`] = eindInput.value || null;
        nieuwRoosterData[`${dag}Soort`] = soortSelect.value || "Werken";

        if ((startInput.value && !eindInput.value) || (!startInput.value && eindInput.value)) {
            toonWerkroosterStatus(`Voor ${dag}, vul zowel start- als eindtijd in, of laat beide leeg.`, "error", false);
            isFormulierValide = false;
        } else if (startInput.value && eindInput.value && eindInput.value <= startInput.value) {
            toonWerkroosterStatus(`Voor ${dag}, eindtijd moet na starttijd liggen.`, "error", false);
            isFormulierValide = false;
        }
    });

    if (!isFormulierValide) {
        if (domInstellingenRefs.opslaanWerkroosterKnop) domInstellingenRefs.opslaanWerkroosterKnop.disabled = false;
        return;
    }

    try {
        const urenConfig = typeof getLijstConfig === 'function' ? getLijstConfig("UrenPerWeek") : null;
        if (!urenConfig) throw new Error("Configuratie voor UrenPerWeek lijst niet gevonden.");

        const listTitleForType = urenConfig.lijstTitel;
        const typeName = listTitleForType.charAt(0).toUpperCase() + listTitleForType.slice(1).replace(/\s+/g, '_');
        nieuwRoosterData.__metadata = { "type": `SP.Data.${typeName}ListItem` };

        // Zoek het huidige actieve rooster (geen VeranderingsDatum of VeranderingsDatum in de toekomst)
        const huidigActiefRoosterItem = huidigeGebruikerInstellingen.alleUrenPerWeekHistorie.find(
            item => !item.VeranderingsDatum || new Date(item.VeranderingsDatum) > new Date()
        );

        if (huidigActiefRoosterItem && huidigActiefRoosterItem.ID) {
            const huidigActiefId = huidigActiefRoosterItem.ID;
            const veranderingsDatum = new Date(nieuweIngangsdatumDate); // Kopieer de nieuwe ingangsdatum
            veranderingsDatum.setUTCDate(veranderingsDatum.getUTCDate() - 1); // Zet op de dag ervoor (UTC)

            const updateData = {
                __metadata: { "type": `SP.Data.${typeName}ListItem` },
                VeranderingsDatum: veranderingsDatum.toISOString() // Opslaan als ISO string (UTC)
            };
            console.log(`[gInstellingen] Huidig werkrooster (ID: ${huidigActiefId}) bijwerken met VeranderingsDatum: ${veranderingsDatum.toISOString()}`);
            await updateInstellingenItem(urenConfig.lijstId, huidigActiefId, updateData);
        }

        console.log("[gInstellingen] Nieuw werkrooster item aanmaken:", nieuwRoosterData);
        await createInstellingenItem(urenConfig.lijstId, nieuwRoosterData);

        // Herlaad alle UrenPerWeek items om de lokale cache bij te werken
        toonInstellingenStatusBericht("Werkrooster data herladen...", "info", false); // Gebruik algemeen statusbericht
        const alleItemsNaUpdate = await haalInstellingenLijstItems("UrenPerWeek", `$select=ID,Ingangsdatum,VeranderingsDatum,${DAGEN_VAN_DE_WEEK.map(d => `${d}Start,${d}Eind,${d}Soort`).join(',')}`, `$filter=MedewerkerID eq '${huidigeGebruikerInstellingen.normalizedUsername}'`, "", "$orderby=Ingangsdatum desc");
        huidigeGebruikerInstellingen.alleUrenPerWeekHistorie = alleItemsNaUpdate || [];
        huidigeGebruikerInstellingen.urenPerWeekActueel = (alleItemsNaUpdate || []).find(item => !item.VeranderingsDatum || new Date(item.VeranderingsDatum) > new Date()) || ((alleItemsNaUpdate && alleItemsNaUpdate.length > 0) ? alleItemsNaUpdate[0] : null);

        toonWerkroosterStatus("Nieuw werkrooster succesvol opgeslagen!", "success");
        toggleWerkroosterEditModus(false); // Schakel terug naar weergavemodus
        vulWerkdagenDisplayEnEditForm(); // Update de UI met het nieuwe rooster

    } catch (error) {
        console.error("[gInstellingen] Fout bij opslaan werkrooster:", error);
        toonWerkroosterStatus(`Fout bij opslaan werkrooster: ${error.message}`, "error", false);
    } finally {
        if (domInstellingenRefs.opslaanWerkroosterKnop) domInstellingenRefs.opslaanWerkroosterKnop.disabled = false;
    }
}

// --- UI Hulpprogramma's (Tabs, Statusberichten) ---

/**
 * Toont een statusbericht specifiek voor de werkrooster sectie.
 * @param {string} bericht - Het bericht om te tonen.
 * @param {'info'|'success'|'error'} [type='info'] - Het type bericht.
 * @param {boolean} [autoVerberg=true] - Of het bericht automatisch verborgen moet worden.
 */
function toonWerkroosterStatus(bericht, type = 'info', autoVerberg = true) {
    if (domInstellingenRefs.werkroosterStatusBericht) {
        domInstellingenRefs.werkroosterStatusBericht.innerHTML = bericht;
        domInstellingenRefs.werkroosterStatusBericht.className = 'mt-4 p-3 text-sm rounded-lg border'; // Basisstijl
        switch (type) {
            case 'success': domInstellingenRefs.werkroosterStatusBericht.classList.add('bg-green-100', 'border-green-400', 'text-green-700', 'dark:bg-green-700', 'dark:text-green-100', 'dark:border-green-600'); break;
            case 'error': domInstellingenRefs.werkroosterStatusBericht.classList.add('bg-red-100', 'border-red-400', 'text-red-700', 'dark:bg-red-700', 'dark:text-red-100', 'dark:border-red-600'); break;
            default: domInstellingenRefs.werkroosterStatusBericht.classList.add('bg-blue-100', 'border-blue-400', 'text-blue-700', 'dark:bg-blue-700', 'dark:text-blue-100', 'dark:border-blue-600'); break;
        }
        domInstellingenRefs.werkroosterStatusBericht.classList.remove('hidden');
        if (autoVerberg) {
            setTimeout(() => {
                if (domInstellingenRefs.werkroosterStatusBericht) domInstellingenRefs.werkroosterStatusBericht.classList.add('hidden');
            }, 7000); // Verberg na 7 seconden
        }
    } else {
        console.warn(`[gInstellingen] Werkrooster status element niet gevonden. Bericht: ${bericht}`);
    }
}

/**
 * Toont een algemeen statusbericht voor de instellingenpagina.
 * @param {string} bericht - Het bericht om te tonen.
 * @param {'info'|'success'|'error'} [type='info'] - Het type bericht.
 * @param {boolean} [autoVerberg=true] - Of het bericht automatisch verborgen moet worden.
 */
function toonInstellingenStatusBericht(bericht, type = 'info', autoVerberg = true) {
    if (domInstellingenRefs.instellingenStatusBericht) {
        domInstellingenRefs.instellingenStatusBericht.innerHTML = bericht;
        domInstellingenRefs.instellingenStatusBericht.className = 'mt-4 p-3 text-sm rounded-lg border'; // Basisstijl
        switch (type) {
            case 'success': domInstellingenRefs.instellingenStatusBericht.classList.add('bg-green-100', 'border-green-400', 'text-green-700', 'dark:bg-green-700', 'dark:text-green-100', 'dark:border-green-600'); break;
            case 'error': domInstellingenRefs.instellingenStatusBericht.classList.add('bg-red-100', 'border-red-400', 'text-red-700', 'dark:bg-red-700', 'dark:text-red-100', 'dark:border-red-600'); break;
            default: domInstellingenRefs.instellingenStatusBericht.classList.add('bg-blue-100', 'border-blue-400', 'text-blue-700', 'dark:bg-blue-700', 'dark:text-blue-100', 'dark:border-blue-600'); break;
        }
        domInstellingenRefs.instellingenStatusBericht.classList.remove('hidden');
        if (autoVerberg) {
            setTimeout(() => {
                if (domInstellingenRefs.instellingenStatusBericht) domInstellingenRefs.instellingenStatusBericht.classList.add('hidden');
            }, 7000); // Verberg na 7 seconden
        }
    } else {
        console.warn(`[gInstellingen] Algemeen status element niet gevonden. Bericht: ${bericht}`);
        // Fallback naar alert als DOM element niet bestaat
        if (type === 'error') alert(`FOUT: ${bericht}`);
        else if (type === 'success') alert(`SUCCES: ${bericht}`);
        else alert(bericht);
    }
}

/**
 * Initialiseert de tab functionaliteit.
 */
function initializeTabs() {
    console.log("[gInstellingen] Initialiseren tabs.");
    const urlParams = new URLSearchParams(window.location.search);
    const gevraagdeTab = urlParams.get('tab') || 'persoonlijk'; // Default naar 'persoonlijk'
    if (domInstellingenRefs.tabButtons) {
        domInstellingenRefs.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                activateTab(tabId);
                // Update URL zonder pagina te herladen voor deeplinking
                const nieuweUrl = `${window.location.pathname}?tab=${tabId}`;
                window.history.replaceState({ path: nieuweUrl }, '', nieuweUrl);
            });
        });
        activateTab(gevraagdeTab); // Activeer de tab op basis van URL of default
    } else {
        console.warn("[gInstellingen] Tab knoppen niet gevonden in DOM.");
    }
}

/**
 * Activeert een specifieke tab en de bijbehorende content.
 * @param {string} tabId - De ID van de te activeren tab (uit dataset.tab).
 */
function activateTab(tabId) {
    if (domInstellingenRefs.tabButtons) {
        domInstellingenRefs.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
            // Zorg voor Tailwind-compatibele styling voor actieve/inactieve tabs
            if (btn.dataset.tab === tabId) {
                btn.classList.add('font-semibold', 'border-blue-500', 'text-blue-500', 'dark:border-blue-400', 'dark:text-blue-400');
                btn.classList.remove('text-gray-500', 'hover:text-gray-700', 'dark:text-gray-400', 'dark:hover:text-gray-200');
            } else {
                btn.classList.remove('font-semibold', 'border-blue-500', 'text-blue-500', 'dark:border-blue-400', 'dark:text-blue-400');
                btn.classList.add('text-gray-500', 'hover:text-gray-700', 'dark:text-gray-400', 'dark:hover:text-gray-200');
            }
        });
    }
    if (domInstellingenRefs.tabContents) {
        domInstellingenRefs.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `tab-content-${tabId}`);
            content.classList.toggle('hidden', content.id !== `tab-content-${tabId}`); // Gebruik hidden voor Tailwind
        });
    }
    console.log(`[gInstellingen] Tab geactiveerd: ${tabId}`);
}

/**
 * Werkt het jaartal in de footer bij.
 */
function updateJaarInFooter() {
    if (domInstellingenRefs.currentYearSpan) {
        domInstellingenRefs.currentYearSpan.textContent = new Date().getFullYear();
    }
}

// --- Hoofd Initialisatie Functie ---

/**
 * Initialiseert de gInstellingen pagina.
 */
async function initializePagina() {
    console.log("[gInstellingen] Start initializePagina.");
    updateJaarInFooter();
    // Probeer eerst context op te halen
    const contextOK = await initializeInstellingenContext();
    if (!contextOK) {
        // Foutbericht is al getoond door initializeInstellingenContext
        // Pas een default thema toe als context faalt, zodat de pagina niet stijlloos is
        pasThemaKlassenToe('dark'); // Default naar donker bij contextfout
        return; // Stop verdere initialisatie als context faalt
    }

    // Laad en pas thema toe (kan nu gebruikersinfo gebruiken als die geladen is)
    await laadEnPasThemaToe(); // Deze functie laadt ook gebruikersInstellingenSP indien beschikbaar

    // Laad overige data
    await laadGebruikersGegevens(); // Deze vult de UI tabs

    // Initialiseer UI elementen en event listeners
    initializeTabs();
    koppelEventListeners();

    console.log("[gInstellingen] Pagina initialisatie voltooid.");
}

/**
 * Koppelt alle benodigde event listeners.
 */
function koppelEventListeners() {
    console.log("[gInstellingen] Koppelen event listeners.");
    if (domInstellingenRefs.instellingenForm && domInstellingenRefs.opslaanInstellingenButton) {
        domInstellingenRefs.instellingenForm.addEventListener('submit', handleInstellingenOpslaan);
    } else {
        console.warn("[gInstellingen] Formulier of opslaan knop voor instellingen niet gevonden.");
    }

    if (domInstellingenRefs.wijzigWerkroosterKnop) {
        domInstellingenRefs.wijzigWerkroosterKnop.addEventListener('click', () => {
            // Bepaal of we momenteel in edit modus zijn door te kijken naar de class van de display container
            const isMomenteelInDisplayModus = !domInstellingenRefs.werkdagenDisplayContainer.classList.contains('hidden');
            toggleWerkroosterEditModus(isMomenteelInDisplayModus); // Als display zichtbaar is, ga naar edit (true)
        });
    } else {
        console.warn("[gInstellingen] Knop 'Wijzig Werkrooster' niet gevonden.");
    }

    if (domInstellingenRefs.opslaanWerkroosterKnop) {
        domInstellingenRefs.opslaanWerkroosterKnop.addEventListener('click', handleWerkroosterOpslaan);
    } else {
        console.warn("[gInstellingen] Knop 'Opslaan Werkrooster' niet gevonden.");
    }

    if (domInstellingenRefs.annuleerWerkroosterKnop) {
        domInstellingenRefs.annuleerWerkroosterKnop.addEventListener('click', () => toggleWerkroosterEditModus(false));
    } else {
        console.warn("[gInstellingen] Knop 'Annuleer Werkrooster' niet gevonden.");
    }
    // Event listener voor thema select, zodat localStorage direct wordt bijgewerkt
    if (domInstellingenRefs.instThemaSelect) {
        domInstellingenRefs.instThemaSelect.addEventListener('change', (event) => {
            pasThemaEnSlaOpNaarLocalStorage(event.target.value);
        });
    }

    console.log("[gInstellingen] Event listeners gekoppeld.");
}

// Wacht tot de DOM geladen is en de afhankelijke configLijst.js.
// Dit vervangt de interval check, ervan uitgaande dat configLijst.js eerder laadt.
if (typeof getLijstConfig === 'function' && typeof sharepointLijstConfiguraties !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializePagina);
} else {
    // Fallback als configLijst.js later laadt of niet gevonden wordt
    const configIntervalInstellingen = setInterval(() => {
        if (typeof getLijstConfig === 'function' && typeof sharepointLijstConfiguraties !== 'undefined') {
            clearInterval(configIntervalInstellingen);
            console.log("[gInstellingen] configLijst.js en functies zijn nu beschikbaar.");
            if (document.readyState === 'loading') { // Voorkom dubbele initialisatie
                document.addEventListener('DOMContentLoaded', initializePagina);
            } else {
                initializePagina(); // DOM is al geladen
            }
        } else {
            console.log("[gInstellingen] Wachten op configLijst.js...");
        }
    }, 100); // Check elke 100ms

    // Timeout om te voorkomen dat het oneindig blijft wachten
    setTimeout(() => {
        if (typeof getLijstConfig !== 'function') {
            clearInterval(configIntervalInstellingen);
            console.error("[gInstellingen] Kritische fout: configLijst.js of getLijstConfig functie niet geladen na 5 seconden.");
            toonInstellingenStatusBericht("Kritische fout: Applicatieconfiguratie kon niet geladen worden. Probeer de pagina te vernieuwen.", "error", false);
        }
    }, 5000);
}

console.log("Pages/JS/gInstellingen_logic.js geladen.");
