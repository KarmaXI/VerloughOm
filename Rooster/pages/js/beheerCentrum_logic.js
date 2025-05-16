// Pages/JS/beheerCentrum_logic_standalone.js

/**
 * Logica voor de standalone beheerCentrum_standalone.html pagina.
 * Beheert het laden, weergeven en CRUD-operaties voor diverse SharePoint lijsten.
 * Deze versie bepaalt de SharePoint site URL statisch en haalt thema-instellingen op.
 */

// Globale variabelen
let actieveTabId = 'medewerkers'; // Default actieve tab
let huidigeBewerkingsItemId = null;
let huidigeBewerkingsTabId = null;

// Globale data caches voor dropdowns
let alleKeuzelijstFunctiesData = [];
let alleTeamsData = [];

// BELANGRIJK: Statisch gedefinieerd relatief pad naar de SharePoint-site.
// Dit MOET overeenkomen met de daadwerkelijke locatie van de Verlof-subsite.
const STANDALONE_GEDEFINIEERDE_SITE_URL = "/sites/MulderT/CustomPW/Verlof/";

// DOM Referenties
const domBeheerRefs = {
    appBody: document.body,
    tabButtons: document.querySelectorAll('.tab-button'),
    tabContentContainer: document.getElementById('tab-content-container'),
    algemeenStatusBericht: document.getElementById('beheer-status-bericht-algemeen'),
    currentYearSpan: document.getElementById('current-year'),
    medewerkersTabelBody: document.getElementById('medewerkers-tabel-body'),
    nieuwMedewerkerButton: document.getElementById('nieuw-medewerker-button'),
    medewerkersStatus: document.getElementById('medewerkers-status'),
    dagenIndicatorsTabelBody: document.getElementById('dagen-indicators-tabel-body'),
    nieuwDagenIndicatorButton: document.getElementById('nieuw-dagenindicator-button'),
    dagenIndicatorsStatus: document.getElementById('dagen-indicators-status'),
    functiesTabelBody: document.getElementById('keuzelijst-functies-tabel-body'),
    nieuwFunctieButton: document.getElementById('nieuw-functie-button'),
    functiesStatus: document.getElementById('keuzelijst-functies-status'),
    verlofredenenTabelBody: document.getElementById('verlofredenen-tabel-body'),
    nieuwVerlofredenButton: document.getElementById('nieuw-verlofreden-button'),
    verlofredenenStatus: document.getElementById('verlofredenen-status'),
    seniorsTabelBody: document.getElementById('seniors-tabel-body'),
    nieuwSeniorButton: document.getElementById('nieuw-senior-button'),
    seniorsStatus: document.getElementById('seniors-status'),
    teamsTabelBody: document.getElementById('teams-tabel-body'),
    nieuwTeamButton: document.getElementById('nieuw-team-button'),
    teamsStatus: document.getElementById('teams-status'),
    beheerModal: document.getElementById('beheer-modal'),
    beheerModalTitle: document.getElementById('beheer-modal-title'),
    beheerModalForm: document.getElementById('beheer-modal-form'),
    beheerModalFieldsContainer: document.getElementById('beheer-modal-fields-container'),
    beheerModalStatus: document.getElementById('beheer-modal-status'),
    beheerModalCloseX: document.getElementById('beheer-modal-close-x'),
    beheerModalCancelButton: document.getElementById('beheer-modal-cancel-button'),
    beheerModalSaveButton: document.getElementById('beheer-modal-save-button'),
};

// Mapping van tab ID naar lijstnaam en configuratie
const tabConfigMap = {
    'medewerkers': {
        lijstNaamSP: 'Medewerkers',
        laadFunctie: async () => generiekeLaadFunctie('medewerkers'),
        statusElement: () => domBeheerRefs.medewerkersStatus,
        tabelBodyElement: () => domBeheerRefs.medewerkersTabelBody,
        velden: [
            { label: 'Naam', interneNaam: 'Naam', type: 'text', verplicht: true, tabelWeergave: true, modalConfig: { type: 'text' } },
            { label: 'Username', interneNaam: 'Username', type: 'text', verplicht: true, tabelWeergave: true, modalConfig: { type: 'text', readonly: true, placeholder: 'i:0#.w|domein\\username', helpText: 'Username kan niet gewijzigd worden.' } },
            { label: 'E-mail', interneNaam: 'E_x002d_mail', type: 'email', verplicht: true, tabelWeergave: true, modalConfig: { type: 'email', readonly: true, extraClass: 'bg-gray-500 dark:bg-gray-600 cursor-not-allowed', helpText: 'E-mailadres kan niet gewijzigd worden.' } },
            { label: 'Telefoonnummer', interneNaam: 'Telefoonnummer', type: 'text', verplicht: false, tabelWeergave: true, modalConfig: { type: 'tel', placeholder: 'Optioneel' } },
            { label: 'Geboortedatum', interneNaam: 'Geboortedatum', type: 'date', verplicht: true, tabelWeergave: true, modalConfig: { type: 'date' } },
            { label: 'Functie', interneNaam: 'Functie', type: 'select', verplicht: true, tabelWeergave: true, modalConfig: { type: 'select', optionsSource: 'keuzelijstFuncties', optionsValueField: 'Title', optionsTextField: 'Title' } },
            { label: 'Team', interneNaam: 'Team', type: 'select', verplicht: true, tabelWeergave: true, modalConfig: { type: 'select', optionsSource: 'Teams', optionsValueField: 'Naam', optionsTextField: 'Naam' } },
            { label: 'Opmerking', interneNaam: 'Opmekring', type: 'textarea', verplicht: false, tabelWeergave: true, modalConfig: { type: 'textarea', rows: 3 } },
            { label: 'Opmerking Geldig Tot', interneNaam: 'OpmerkingGeldigTot', type: 'date', verplicht: false, tabelWeergave: true, modalConfig: { type: 'date' } },
            { label: 'Horen', interneNaam: 'Horen', type: 'boolean', verplicht: false, tabelWeergave: true, default: true, modalConfig: { type: 'switch' } },
            { label: 'Actief', interneNaam: 'Actief', type: 'boolean', verplicht: false, tabelWeergave: true, default: true, modalConfig: { type: 'switch' } },
            { label: 'Verbergen', interneNaam: 'Verbergen', type: 'boolean', verplicht: false, tabelWeergave: true, default: false, modalConfig: { type: 'switch' } },
            { label: 'Titel (SP)', interneNaam: 'Title', type: 'text', verplicht: false, tabelWeergave: false, modalConfig: { type: 'hidden'} }
        ],
        pk: 'ID'
    },
    'dagen-indicators': {
        lijstNaamSP: 'DagenIndicators',
        laadFunctie: async () => generiekeLaadFunctie('dagen-indicators'),
        statusElement: () => domBeheerRefs.dagenIndicatorsStatus,
        tabelBodyElement: () => domBeheerRefs.dagenIndicatorsTabelBody,
        velden: [
            { label: 'Titel (Afkorting)', interneNaam: 'Title', type: 'text', verplicht: true, tabelWeergave: true, modalConfig: { type: 'text' } },
            { label: 'Beschrijving', interneNaam: 'Beschrijving', type: 'text', verplicht: false, tabelWeergave: true, modalConfig: { type: 'text' } },
            { label: 'Kleur', interneNaam: 'Kleur', type: 'color', verplicht: true, tabelWeergave: true, modalConfig: { type: 'color' } },
            { label: 'Patroon', interneNaam: 'Patroon', type: 'select', opties: ["Effen", "Diagonale lijn (rechts)", "Diagonale lijn (links)", "Kruis", "Plus", "Louis Vuitton"], verplicht: false, tabelWeergave: true, modalConfig: { type: 'select', opties: ["Effen", "Diagonale lijn (rechts)", "Diagonale lijn (links)", "Kruis", "Plus", "Louis Vuitton"] } }
        ],
        pk: 'ID'
    },
    'keuzelijst-functies': {
        lijstNaamSP: 'keuzelijstFuncties',
        laadFunctie: async () => generiekeLaadFunctie('keuzelijst-functies'),
        statusElement: () => domBeheerRefs.functiesStatus,
        tabelBodyElement: () => domBeheerRefs.functiesTabelBody,
        velden: [
            { label: 'Functienaam (Titel)', interneNaam: 'Title', type: 'text', verplicht: true, tabelWeergave: true, modalConfig: { type: 'text' } }
        ],
        pk: 'ID'
    },
    'verlofredenen': {
        lijstNaamSP: 'Verlofredenen',
        laadFunctie: async () => generiekeLaadFunctie('verlofredenen'),
        statusElement: () => domBeheerRefs.verlofredenenStatus,
        tabelBodyElement: () => domBeheerRefs.verlofredenenTabelBody,
        velden: [
            { label: 'Titel (voor dropdowns)', interneNaam: 'Title', type: 'text', verplicht: true, tabelWeergave: true, modalConfig: { type: 'text' } },
            { label: 'Naam (voor legenda)', interneNaam: 'Naam', type: 'text', verplicht: true, tabelWeergave: true, modalConfig: { type: 'text' } },
            { label: 'Kleur', interneNaam: 'Kleur', type: 'color', verplicht: true, tabelWeergave: true, modalConfig: { type: 'color' } },
            { label: 'Telt als Verlofdag?', interneNaam: 'VerlofDag', type: 'boolean', verplicht: false, tabelWeergave: true, default: true, modalConfig: { type: 'switch' } }
        ],
        pk: 'ID'
    },
    'seniors': {
        lijstNaamSP: 'Seniors',
        laadFunctie: async () => generiekeLaadFunctie('seniors'),
        statusElement: () => domBeheerRefs.seniorsStatus,
        tabelBodyElement: () => domBeheerRefs.seniorsTabelBody,
        velden: [
            { label: 'Medewerker (Naam)', interneNaam: 'Medewerker', type: 'text', verplicht: true, tabelWeergave: true, modalConfig: { type: 'text', placeholder: 'Volledige naam medewerker' } },
            { label: 'Team (Naam)', interneNaam: 'Team', type: 'text', verplicht: true, tabelWeergave: true, modalConfig: { type: 'text', placeholder: 'Teamnaam' } },
            { label: 'MedewerkerID (Username)', interneNaam: 'MedewerkerID', type: 'text', verplicht: true, tabelWeergave: true, modalConfig: { type: 'text', placeholder: 'i:0#.w|domein\\username' } }
        ],
        pk: 'ID'
    },
    'teams': {
        lijstNaamSP: 'Teams',
        laadFunctie: async () => generiekeLaadFunctie('teams'),
        statusElement: () => domBeheerRefs.teamsStatus,
        tabelBodyElement: () => domBeheerRefs.teamsTabelBody,
        velden: [
            { label: 'Teamnaam (Titel)', interneNaam: 'Title', type: 'text', verplicht: true, tabelWeergave: true, modalConfig: { type: 'text' } },
            { label: 'Teamleider (Naam)', interneNaam: 'Teamleider', type: 'text', verplicht: false, tabelWeergave: true, modalConfig: { type: 'text', placeholder: 'Naam teamleider' } },
            { label: 'Kleur', interneNaam: 'Kleur', type: 'color', verplicht: false, tabelWeergave: true, modalConfig: { type: 'color' } },
            { label: 'Actief?', interneNaam: 'Actief', type: 'boolean', verplicht: false, default: true, tabelWeergave: true, modalConfig: { type: 'switch' } },
            { label: 'TeamleiderID (Username)', interneNaam: 'TeamleiderId', type: 'text', verplicht: false, tabelWeergave: false, modalConfig: { type: 'text', placeholder: 'i:0#.w|domein\\username' } }
        ],
        pk: 'ID'
    }
};

// --- Functie om prefix van loginnaam te trimmen ---
function trimLoginNaamPrefix(loginNaam) {
    if (!loginNaam) return '';
    const prefixesToRemove = ["i:0#.w|", "c:0(.s|true|", "i:05.t|"];
    for (const prefix of prefixesToRemove) {
        if (loginNaam.toLowerCase().startsWith(prefix.toLowerCase())) {
            return loginNaam.substring(prefix.length);
        }
    }
    return loginNaam.startsWith('|') ? loginNaam.substring(1) : loginNaam;
}


// --- Initialisatie & Context ---
async function initializeBeheerContextStandalone() {
    console.log("[BeheerCentrumStandalone] Initialiseren context...");

    if (!STANDALONE_GEDEFINIEERDE_SITE_URL || typeof STANDALONE_GEDEFINIEERDE_SITE_URL !== 'string' || STANDALONE_GEDEFINIEERDE_SITE_URL.trim() === "") {
        const errorMsg = "[BeheerCentrumStandalone] Kritische fout: STANDALONE_GEDEFINIEERDE_SITE_URL is niet correct gedefinieerd in dit script. Pagina kan niet laden.";
        console.error(errorMsg);
        toonAlgemeenStatusBericht(errorMsg, "error", false);
        return false;
    }

    const sitePath = STANDALONE_GEDEFINIEERDE_SITE_URL.replace(/\/$/, "");

    try {
        const absoluteSiteApiUrl = `${window.location.origin}${sitePath}/_api/web?$select=Url`;
        console.log(`[BeheerCentrumStandalone] Poging tot ophalen web URL via: ${absoluteSiteApiUrl}`);

        const webResponse = await fetch(absoluteSiteApiUrl, { headers: { 'Accept': 'application/json;odata=verbose' } });
        if (!webResponse.ok) {
            const errorDetail = await webResponse.text().catch(() => `Status: ${webResponse.statusText}`);
            console.error(`[BeheerCentrumStandalone] Fout ${webResponse.status} bij ophalen web URL via ${absoluteSiteApiUrl}. Details: ${errorDetail}. Controleer of STANDALONE_GEDEFINIEERDE_SITE_URL ('${sitePath}') correct is en de SharePoint site bereikbaar is.`);
            throw new Error(`Kan web URL niet ophalen (status: ${webResponse.status})`);
        }
        const webData = await webResponse.json();
        spWebAbsoluteUrlBeheer = webData.d.Url;
        if (!spWebAbsoluteUrlBeheer.endsWith('/')) spWebAbsoluteUrlBeheer += '/';

        const userResponse = await fetch(`${spWebAbsoluteUrlBeheer}_api/web/currentuser?$select=LoginName,Title,Id,Email`, { headers: { 'Accept': 'application/json;odata=verbose' } });
        if (!userResponse.ok) {
            const errorDetail = await userResponse.text().catch(() => `Status: ${userResponse.statusText}`);
            console.error(`[BeheerCentrumStandalone] Fout ${userResponse.status} bij ophalen gebruiker info. Details: ${errorDetail}`);
            throw new Error(`Kan gebruiker info niet ophalen (status: ${userResponse.status})`);
        }
        const userData = await userResponse.json();
        huidigeGebruikerBeheer = {
            loginNaam: userData.d.LoginName,
            normalizedUsername: trimLoginNaamPrefix(userData.d.LoginName), // Normalized username
            Id: userData.d.Id,
            Title: userData.d.Title,
            Email: userData.d.Email
        };
        console.log("[BeheerCentrumStandalone] Context succesvol opgehaald. Site URL:", spWebAbsoluteUrlBeheer, "User:", huidigeGebruikerBeheer.loginNaam);
        return true;
    } catch (error) {
        console.error("[BeheerCentrumStandalone] Kritische fout bij ophalen context:", error);
        toonAlgemeenStatusBericht(`Kan geen verbinding maken met de server (${error.message}). Controleer de console en de STANDALONE_GEDEFINIEERDE_SITE_URL in de code.`, "error", false);
        return false;
    }
}

// --- Thema laden ---
async function laadEnPasThemaToe() {
    const opgeslagenThema = localStorage.getItem('beheerCentrumThema');
    if (opgeslagenThema) {
        console.log(`[BeheerCentrumStandalone] Opgeslagen thema gevonden in localStorage: ${opgeslagenThema}`);
        pasThemaKlassenToe(opgeslagenThema);
        // Geen vroege return, we willen nog steeds proberen SP te checken voor updates.
    } else {
        console.log("[BeheerCentrumStandalone] Geen thema in localStorage, standaard (dark) wordt gebruikt totdat SP is geladen.");
        pasThemaKlassenToe('dark'); // Default naar dark als niets in localStorage
    }

    if (!spWebAbsoluteUrlBeheer || !huidigeGebruikerBeheer || !huidigeGebruikerBeheer.normalizedUsername) {
        console.warn("[BeheerCentrumStandalone] Kan thema niet ophalen van SharePoint: context is nog niet volledig geïnitialiseerd.");
        return; // Kan niet verder zonder context
    }

    try {
        // @ts-ignore
        const instellingenConfig = getLijstConfig("gebruikersInstellingen");
        if (!instellingenConfig) {
            console.warn("[BeheerCentrumStandalone] Configuratie voor 'gebruikersInstellingen' lijst niet gevonden. Kan thema niet ophalen van SP.");
            return;
        }

        const filterQuery = `$filter=Title eq '${huidigeGebruikerBeheer.normalizedUsername}'`; // Title in gebruikersInstellingen is de username
        const selectQuery = "$select=soortWeergave";
        const instellingenItems = await getBeheerLijstItems("gebruikersInstellingen", selectQuery, filterQuery);

        if (instellingenItems && instellingenItems.length > 0) {
            const themaVanSP = instellingenItems[0].soortWeergave; // 'dark' of 'light'
            if (themaVanSP && (themaVanSP === 'dark' || themaVanSP === 'light')) {
                console.log(`[BeheerCentrumStandalone] Thema opgehaald van SharePoint: ${themaVanSP}`);
                pasThemaKlassenToe(themaVanSP);
                localStorage.setItem('beheerCentrumThema', themaVanSP); // Update localStorage
            } else {
                console.warn(`[BeheerCentrumStandalone] Ongeldige themawaarde '${themaVanSP}' ontvangen van SharePoint. Gebruik default.`);
                // Als localStorage al een thema had, laat dat staan, anders default naar dark
                if (!opgeslagenThema) pasThemaKlassenToe('dark');
            }
        } else {
            console.log("[BeheerCentrumStandalone] Geen specifieke thema-instelling gevonden voor gebruiker in SharePoint. Huidige (localStorage/default) thema blijft actief.");
             // Als localStorage al een thema had, laat dat staan, anders default naar dark
            if (!opgeslagenThema) pasThemaKlassenToe('dark');
        }
    } catch (error) {
        console.error("[BeheerCentrumStandalone] Fout bij ophalen thema-instellingen van SharePoint:", error);
        // Bij fout, val terug op localStorage of default
        if (!opgeslagenThema) pasThemaKlassenToe('dark');
    }
}

function pasThemaKlassenToe(thema) { // 'dark' of 'light'
    if (domBeheerRefs.appBody) {
        domBeheerRefs.appBody.classList.remove('light-theme', 'dark-theme');
        domBeheerRefs.appBody.classList.add(thema === 'dark' ? 'dark-theme' : 'light-theme');
        console.log(`[BeheerCentrumStandalone] Thema klassen toegepast: ${thema}`);
    }
}


// --- Generieke SharePoint Functies (CRUD) ---
async function getBeheerLijstItems(lijstIdentifier, selectQuery = "", filterQuery = "", expandQuery = "", orderbyQuery = "") {
    if (!spWebAbsoluteUrlBeheer) {
        console.error(`[BeheerCentrumStandalone] getBeheerLijstItems: spWebAbsoluteUrlBeheer is niet beschikbaar. Kan lijst '${lijstIdentifier}' niet ophalen.`);
        toonTabStatus(actieveTabId, `Fout: Serververbinding niet beschikbaar voor lijst '${lijstIdentifier}'.`, "error", false);
        return [];
    }
    let apiUrlPath;
    // @ts-ignore getLijstConfig wordt uit configLijst.js gehaald
    const lijstConfigSPObj = getLijstConfig(lijstIdentifier);

    if (!lijstConfigSPObj) {
        console.error(`[BeheerCentrumStandalone] getBeheerLijstItems: Kon lijst configuratie niet vinden voor identifier: '${lijstIdentifier}' in configLijst.js.`);
        toonTabStatus(actieveTabId, `Configuratiefout voor lijst '${lijstIdentifier}'. Controleer configLijst.js.`, "error", false);
        return [];
    }
    const lijstGuidOfTitel = lijstConfigSPObj.lijstId || lijstConfigSPObj.lijstTitel;
    const lijstDisplayName = lijstConfigSPObj.lijstTitel || lijstIdentifier;

    if (/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/.test(lijstGuidOfTitel)) {
        apiUrlPath = `/_api/web/lists(guid'${lijstGuidOfTitel}')/items`;
    } else {
        apiUrlPath = `/_api/web/lists/getByTitle('${encodeURIComponent(lijstGuidOfTitel)}')/items`;
    }

    let queryParams = [];
    if (selectQuery) queryParams.push(selectQuery);
    if (filterQuery) queryParams.push(filterQuery);
    if (expandQuery) queryParams.push(expandQuery);
    if (orderbyQuery) queryParams.push(orderbyQuery);

    const apiUrl = `${spWebAbsoluteUrlBeheer.replace(/\/$/, "")}${apiUrlPath}${queryParams.length > 0 ? '?' + queryParams.join('&') : ''}`;
    console.log(`[BeheerCentrumStandalone] Ophalen items voor lijst '${lijstDisplayName}': ${decodeURIComponent(apiUrl)}`);

    try {
        // Alleen status tonen als het niet de gebruikersInstellingen lijst is (om dubbele meldingen te voorkomen)
        if (lijstIdentifier !== "gebruikersInstellingen") {
            toonTabStatus(actieveTabId, `Laden data voor '${lijstDisplayName}'...`, "info", false);
        }
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json;odata=verbose' }
        });
        if (!response.ok) {
            let errorDetail = `Status: ${response.status} ${response.statusText}. URL: ${apiUrl}`;
            try {
                const errorData = await response.json();
                errorDetail = errorData.error?.message?.value || errorDetail;
            } catch (e) { /* Kon JSON niet parsen, gebruik de statusText */ }
            console.error(`[BeheerCentrumStandalone] Fout bij ophalen lijst '${lijstDisplayName}' (GUID/Titel: ${lijstGuidOfTitel}): ${errorDetail}`);
            if (lijstIdentifier !== "gebruikersInstellingen") {
                toonTabStatus(actieveTabId, `Fout bij laden van lijst '${lijstDisplayName}': ${errorDetail}`, "error", false);
            }
            return [];
        }
        const data = await response.json();
        const itemCount = data.d.results ? data.d.results.length : 0;
        if (lijstIdentifier !== "gebruikersInstellingen") {
            toonTabStatus(actieveTabId, `${itemCount} items geladen voor '${lijstDisplayName}'.`, "success", true);
        }
        return data.d.results || [];
    } catch (error) {
        console.error(`[BeheerCentrumStandalone] Uitzondering bij ophalen lijst '${lijstDisplayName}' (GUID/Titel: ${lijstGuidOfTitel}):`, error, "URL:", apiUrl);
        if (lijstIdentifier !== "gebruikersInstellingen") {
            toonTabStatus(actieveTabId, `Netwerkfout bij laden van lijst '${lijstDisplayName}': ${error.message}`, "error", false);
        }
        return [];
    }
}

async function getBeheerRequestDigest() {
    if (!spWebAbsoluteUrlBeheer) throw new Error("Web absolute URL niet beschikbaar voor Request Digest.");
    const apiUrl = `${spWebAbsoluteUrlBeheer.replace(/\/$/, "")}/_api/contextinfo`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Accept': 'application/json;odata=verbose' }
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("[BeheerCentrumStandalone] Kon Request Digest niet ophalen:", response.status, errorText);
        throw new Error(`Kon Request Digest niet ophalen (${response.status}). Details: ${errorText}`);
    }
    const data = await response.json();
    return data.d.GetContextWebInformation.FormDigestValue;
}

async function createBeheerLijstItem(lijstConfigKeySP, itemData) {
    const requestDigest = await getBeheerRequestDigest();
    // @ts-ignore
    const lijstConfigSP = getLijstConfig(lijstConfigKeySP);
    if (!lijstConfigSP || !lijstConfigSP.lijstId || !lijstConfigSP.lijstTitel) {
        throw new Error(`Lijstconfiguratie (met lijstId en lijstTitel) niet gevonden voor '${lijstConfigKeySP}' in configLijst.js`);
    }
    itemData.__metadata = { "type": `SP.Data.${lijstConfigSP.lijstTitel.replace(/\s+/g, '_')}ListItem` };
    const apiUrl = `${spWebAbsoluteUrlBeheer.replace(/\/$/, "")}/_api/web/lists(guid'${lijstConfigSP.lijstId}')/items`;
    console.log(`[BeheerCentrumStandalone] createBeheerLijstItem - API call naar: ${apiUrl} voor lijst: ${lijstConfigSP.lijstTitel}`, itemData);
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
            'X-RequestDigest': requestDigest
        },
        body: JSON.stringify(itemData)
    });
    if (!response.ok && response.status !== 201) {
        let errorDetail = `HTTP error ${response.status} bij aanmaken item in ${lijstConfigSP.lijstTitel}`;
        try {
            const errorData = await response.json();
            errorDetail = errorData.error?.message?.value || errorDetail;
        } catch (e) { /* ignore parsing error */ }
        console.error(`[BeheerCentrumStandalone] Fout bij aanmaken item: ${errorDetail}`);
        throw new Error(errorDetail);
    }
    console.log(`[BeheerCentrumStandalone] Item succesvol aangemaakt in ${lijstConfigSP.lijstTitel}. Status: ${response.status}`);
    return response.status === 201 ? await response.json() : null;
}

async function updateBeheerLijstItem(lijstConfigKeySP, itemId, itemData) {
    const requestDigest = await getBeheerRequestDigest();
    // @ts-ignore
    const lijstConfigSP = getLijstConfig(lijstConfigKeySP);
     if (!lijstConfigSP || !lijstConfigSP.lijstId || !lijstConfigSP.lijstTitel) {
        throw new Error(`Lijstconfiguratie (met lijstId en lijstTitel) niet gevonden voor '${lijstConfigKeySP}' in configLijst.js`);
    }
    itemData.__metadata = { "type": `SP.Data.${lijstConfigSP.lijstTitel.replace(/\s+/g, '_')}ListItem` };
    const apiUrl = `${spWebAbsoluteUrlBeheer.replace(/\/$/, "")}/_api/web/lists(guid'${lijstConfigSP.lijstId}')/items(${itemId})`;
    console.log(`[BeheerCentrumStandalone] updateBeheerLijstItem - API call naar: ${apiUrl} voor lijst: ${lijstConfigSP.lijstTitel}`, itemData);
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
            'X-RequestDigest': requestDigest,
            'IF-MATCH': '*',
            'X-HTTP-Method': 'MERGE'
        },
        body: JSON.stringify(itemData)
    });
    if (response.status !== 204) {
        let errorDetail = `HTTP error ${response.status}`;
        try {
            const errorData = await response.json();
            errorDetail = errorData.error?.message?.value || errorDetail;
        } catch (e) { /* ignore parsing error */ }
        console.error(`[BeheerCentrumStandalone] Fout bij bijwerken item in ${lijstConfigSP.lijstTitel} (${response.status}): ${errorDetail}`);
        throw new Error(errorDetail);
    }
    console.log(`[BeheerCentrumStandalone] Item succesvol bijgewerkt in ${lijstConfigSP.lijstTitel}. Status: ${response.status}`);
    return true;
}

async function deleteBeheerLijstItem(lijstConfigKeySP, itemId) {
    const requestDigest = await getBeheerRequestDigest();
    // @ts-ignore
    const lijstConfigSP = getLijstConfig(lijstConfigKeySP);
    if (!lijstConfigSP || !lijstConfigSP.lijstId) {
        throw new Error(`Lijstconfiguratie (met lijstId) niet gevonden voor '${lijstConfigKeySP}' in configLijst.js`);
    }
    const apiUrl = `${spWebAbsoluteUrlBeheer.replace(/\/$/, "")}/_api/web/lists(guid'${lijstConfigSP.lijstId}')/items(${itemId})`;
    console.log(`[BeheerCentrumStandalone] deleteBeheerLijstItem - API call naar: ${apiUrl} voor lijst: ${lijstConfigSP.lijstTitel}`);
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json;odata=verbose',
            'X-RequestDigest': requestDigest,
            'IF-MATCH': '*',
            'X-HTTP-Method': 'DELETE'
        }
    });
    if (response.status !== 204) {
        let errorDetail = `HTTP error ${response.status}`;
        try {
            const errorData = await response.json();
            errorDetail = errorData.error?.message?.value || errorDetail;
        } catch (e) { /* ignore parsing error */ }
        console.error(`[BeheerCentrumStandalone] Fout bij verwijderen item in ${lijstConfigSP.lijstTitel} (${response.status}): ${errorDetail}`);
        throw new Error(errorDetail);
    }
    console.log(`[BeheerCentrumStandalone] Item succesvol verwijderd uit ${lijstConfigSP.lijstTitel}. Status: ${response.status}`);
    return true;
}

// --- Specifieke Laadfuncties per Tab ---
async function laadMedewerkers() { await generiekeLaadFunctie('medewerkers'); }
async function laadDagenIndicators() { await generiekeLaadFunctie('dagen-indicators'); }
async function laadKeuzelijstFuncties() { await generiekeLaadFunctie('keuzelijst-functies'); }
async function laadVerlofredenen() { await generiekeLaadFunctie('verlofredenen'); }
async function laadSeniors() { await generiekeLaadFunctie('seniors'); }
async function laadTeams() { await generiekeLaadFunctie('teams'); }

async function generiekeLaadFunctie(tabId) {
    const config = tabConfigMap[tabId];
    if (!config) {
        console.error(`[BeheerCentrumStandalone] Geen configuratie gevonden voor tabId: ${tabId}`);
        return;
    }
    const tabelBody = config.tabelBodyElement();
    if (!tabelBody) {
        console.error(`[BeheerCentrumStandalone] Tabel body element niet gevonden voor tabId: ${tabId}`);
        return;
    }
    tabelBody.innerHTML = `<tr><td colspan="${config.velden.filter(v => v.tabelWeergave !== false).length + 1}" class="text-center p-4 text-gray-400">Laden ${config.lijstNaamSP}...</td></tr>`;

    const selectFieldsInConfig = config.velden.map(v => v.interneNaam);
    if (config.pk && !selectFieldsInConfig.includes(config.pk)) {
        selectFieldsInConfig.unshift(config.pk);
    }
    const uniqueSelectFields = [...new Set(selectFieldsInConfig.filter(Boolean))];
    const selectQuery = uniqueSelectFields.length > 0 ? "$select=" + uniqueSelectFields.join(',') : "";
    const orderby = config.velden[0]?.interneNaam ? `${config.velden[0].interneNaam} asc` : "";

    const items = await getBeheerLijstItems(config.lijstNaamSP, selectQuery, "", "", orderby);

    tabelBody.innerHTML = '';
    if (items.length === 0) {
        tabelBody.innerHTML = `<tr><td colspan="${config.velden.filter(v => v.tabelWeergave !== false).length + 1}" class="text-center p-4 text-gray-400">Geen items gevonden.</td></tr>`;
        return;
    }
    items.forEach(item => createDisplayRow(tabId, item, tabelBody));
    console.log(`[BeheerCentrumStandalone] Data geladen en weergegeven voor tab: ${tabId}`);
}

// --- Generieke UI Functies (Modal, Tabelrijen) ---
function createDisplayRow(tabId, item, tabelBody) {
    const config = tabConfigMap[tabId];
    if (!config) {
        console.error(`[BeheerCentrumStandalone] createDisplayRow: Geen configuratie gevonden voor tabId: ${tabId}`);
        return;
    }
    const tr = document.createElement('tr');
    tr.dataset.id = item[config.pk];

    config.velden.forEach(veldDef => {
        if (veldDef.tabelWeergave === false) return;
        const td = document.createElement('td');
        td.className = 'align-top py-2 px-3 text-sm whitespace-nowrap';
        let displayValue = item[veldDef.interneNaam];

        switch (veldDef.type) {
            case 'color':
                const colorContainer = document.createElement('div');
                colorContainer.className = 'flex items-center space-x-2';
                const colorSwatch = document.createElement('div');
                colorSwatch.style.backgroundColor = displayValue || '#ffffff';
                colorSwatch.className = 'h-6 w-6 border border-gray-400 dark:border-gray-500 rounded';
                const hexText = document.createElement('span');
                hexText.textContent = (displayValue || '').toUpperCase();
                hexText.className = 'text-xs';
                colorContainer.appendChild(colorSwatch);
                colorContainer.appendChild(hexText);
                td.appendChild(colorContainer);
                break;
            case 'boolean':
                const iconClass = displayValue ? "text-green-400 dark:text-green-500" : "text-red-400 dark:text-red-500";
                const icon = displayValue ?
                    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="${iconClass}"><polyline points="20 6 9 17 4 12"></polyline></svg>` :
                    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="${iconClass}"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                td.innerHTML = icon;
                break;
            case 'date':
            case 'datetime':
                td.textContent = displayValue ? new Date(displayValue).toLocaleDateString('nl-NL') : 'N.v.t.';
                break;
            case 'textarea':
                td.textContent = displayValue ? (displayValue.substring(0, 50) + (displayValue.length > 50 ? '...' : '')) : '';
                td.title = displayValue || '';
                break;
            default:
                td.textContent = displayValue === null || displayValue === undefined ? '' : displayValue;
        }
        tr.appendChild(td);
    });

    const actiesTd = document.createElement('td');
    actiesTd.className = 'space-x-1 whitespace-nowrap py-2 px-3';
    const editButton = document.createElement('button');
    editButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
    editButton.title = "Bewerken";
    editButton.className = 'edit-button bg-yellow-500 hover:bg-yellow-600 text-white p-1.5 rounded text-xs shadow transition-colors duration-150';
    editButton.addEventListener('click', () => openModalForItem(tabId, item));

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
    deleteButton.title = "Verwijderen";
    deleteButton.className = 'delete-button bg-red-500 hover:bg-red-600 text-white p-1.5 rounded text-xs shadow transition-colors duration-150';
    deleteButton.addEventListener('click', () => handleDeleteItem(tabId, item[config.pk], tr));

    actiesTd.appendChild(editButton);
    actiesTd.appendChild(deleteButton);
    tr.appendChild(actiesTd);

    tabelBody.appendChild(tr);
}

async function openModalForItem(tabId, item) {
    huidigeBewerkingsTabId = tabId;
    const config = tabConfigMap[tabId];
    if (!config) {
        console.error(`[BeheerCentrumStandalone] openModalForItem: Geen configuratie gevonden voor tabId: ${tabId}`);
        return;
    }
    huidigeBewerkingsItemId = item ? item[config.pk] : null;

    domBeheerRefs.beheerModalTitle.textContent = item ? `${config.lijstNaamSP} Item Bewerken (ID: ${huidigeBewerkingsItemId})` : `Nieuw ${config.lijstNaamSP} Item Toevoegen`;
    domBeheerRefs.beheerModalFieldsContainer.innerHTML = '';

    const dropdownDataPromises = [];
    const dropdownSources = new Set();

    config.velden.forEach(veldDef => {
        if (veldDef.modalConfig && veldDef.modalConfig.type === 'select' && veldDef.modalConfig.optionsSource) {
            dropdownSources.add(veldDef.modalConfig.optionsSource);
        }
    });

    dropdownSources.forEach(sourceListName => {
        if (sourceListName === 'keuzelijstFuncties' && alleKeuzelijstFunctiesData.length === 0) {
            dropdownDataPromises.push(
                getBeheerLijstItems(sourceListName, "$select=ID,Naam", "", "", "Naam asc")
                    .then(data => alleKeuzelijstFunctiesData = data)
                    .catch(err => console.error(`Fout bij laden ${sourceListName}:`, err))
            );
        } else if (sourceListName === 'Teams' && alleTeamsData.length === 0) {
            dropdownDataPromises.push(
                getBeheerLijstItems(sourceListName, "$select=ID,Naam,Naam,Actief", "$filter=Actief eq 1", "", "Naam asc")
                    .then(data => alleTeamsData = data)
                    .catch(err => console.error(`Fout bij laden ${sourceListName}:`, err))
            );
        }
    });

    if (dropdownDataPromises.length > 0) {
        toonModalStatus("Dropdown opties laden...", "info", false);
        try {
            await Promise.all(dropdownDataPromises);
            toonModalStatus("", "info", true);
        } catch (error) {
            console.error("[BeheerCentrumStandalone] Fout bij laden dropdown data voor modal:", error);
            toonModalStatus("Fout bij laden van selectie opties.", "error", false);
        }
    }

    config.velden.forEach(veldDef => {
        if (!veldDef.modalConfig) return;
        const modalVeldConfig = veldDef.modalConfig;
        const div = document.createElement('div');
        div.className = 'mb-3';
        const label = document.createElement('label');
        label.htmlFor = `modal-${veldDef.interneNaam}`;
        label.textContent = veldDef.label + (veldDef.verplicht ? ' *' : '');
        label.className = 'block text-sm font-medium text-gray-300 mb-1';
        div.appendChild(label);

        let inputElement;
        const currentValue = item ? item[veldDef.interneNaam] : (veldDef.default !== undefined ? veldDef.default : '');

        switch (modalVeldConfig.type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'number':
                inputElement = document.createElement('input');
                inputElement.type = modalVeldConfig.type;
                inputElement.value = currentValue;
                if (modalVeldConfig.placeholder) inputElement.placeholder = modalVeldConfig.placeholder;
                break;
            case 'date':
                inputElement = document.createElement('input');
                inputElement.type = 'date';
                if (currentValue) {
                    try {
                        inputElement.value = new Date(currentValue).toISOString().split('T')[0];
                    } catch (e) {
                        console.warn(`Ongeldige datumwaarde voor ${veldDef.interneNaam}: ${currentValue}`);
                        inputElement.value = '';
                    }
                } else {
                    inputElement.value = '';
                }
                break;
            case 'textarea':
                inputElement = document.createElement('textarea');
                inputElement.rows = modalVeldConfig.rows || 3;
                inputElement.value = currentValue;
                if (modalVeldConfig.placeholder) inputElement.placeholder = modalVeldConfig.placeholder;
                break;
            case 'select':
                inputElement = document.createElement('select');
                const placeholderOption = document.createElement('option');
                placeholderOption.value = "";
                placeholderOption.textContent = `Selecteer ${veldDef.label.toLowerCase()}...`;
                inputElement.appendChild(placeholderOption);
                let optionsArray = [];
                if (modalVeldConfig.optionsSource === 'keuzelijstFuncties') {
                    optionsArray = alleKeuzelijstFunctiesData;
                } else if (modalVeldConfig.optionsSource === 'Teams') {
                    optionsArray = alleTeamsData;
                } else if (modalVeldConfig.opties && Array.isArray(modalVeldConfig.opties)) {
                     optionsArray = modalVeldConfig.opties.map(opt => ({ [modalVeldConfig.optionsValueField || 'value']: opt, [modalVeldConfig.optionsTextField || 'text']: opt }));
                }
                optionsArray.forEach(opt => {
                    const option = document.createElement('option');
                    const value = opt[modalVeldConfig.optionsValueField || 'ID'];
                    const text = opt[modalVeldConfig.optionsTextField || 'Title'];
                    option.value = value;
                    option.textContent = text;
                    if (String(currentValue) === String(value)) {
                        option.selected = true;
                    }
                    inputElement.appendChild(option);
                });
                break;
            case 'color':
                inputElement = document.createElement('div');
                inputElement.className = 'flex items-center space-x-2';
                const colorPicker = document.createElement('input');
                colorPicker.type = 'color';
                colorPicker.id = `modal-${veldDef.interneNaam}_picker`;
                colorPicker.name = `${veldDef.interneNaam}_picker`;
                colorPicker.value = currentValue || '#ffffff';
                colorPicker.className = 'h-10 w-12 p-1 border border-gray-500 dark:border-gray-600 rounded';
                const hexInput = document.createElement('input');
                hexInput.type = 'text';
                hexInput.id = `modal-${veldDef.interneNaam}`;
                hexInput.name = veldDef.interneNaam;
                hexInput.value = currentValue || '#ffffff';
                hexInput.className = 'input-class w-full';
                hexInput.placeholder = '#RRGGBB';
                colorPicker.addEventListener('input', () => hexInput.value = colorPicker.value.toUpperCase());
                hexInput.addEventListener('change', () => {
                     if (/^#[0-9A-F]{6}$/i.test(hexInput.value)) {
                        colorPicker.value = hexInput.value;
                    } else {
                        hexInput.value = colorPicker.value.toUpperCase();
                    }
                });
                inputElement.appendChild(colorPicker);
                inputElement.appendChild(hexInput);
                break;
            case 'switch':
                inputElement = document.createElement('label');
                inputElement.className = 'switch';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `modal-${veldDef.interneNaam}`;
                checkbox.name = veldDef.interneNaam;
                checkbox.checked = currentValue === true || currentValue === 'true';
                const slider = document.createElement('span');
                slider.className = 'slider round';
                inputElement.appendChild(checkbox);
                inputElement.appendChild(slider);
                break;
            case 'hidden':
                inputElement = document.createElement('input');
                inputElement.type = 'hidden';
                inputElement.id = `modal-${veldDef.interneNaam}`;
                inputElement.name = veldDef.interneNaam;
                inputElement.value = currentValue;
                div.classList.add('hidden');
                break;
            default:
                console.warn(`[BeheerCentrumStandalone] Onbekend modalConfig type: ${modalVeldConfig.type} voor veld ${veldDef.interneNaam}`);
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.value = `Unsupported type: ${modalVeldConfig.type}`;
                inputElement.readOnly = true;
        }

        if (inputElement && inputElement.tagName !== 'LABEL' && inputElement.type !== 'hidden') {
            inputElement.id = inputElement.id || `modal-${veldDef.interneNaam}`;
            inputElement.name = inputElement.name || veldDef.interneNaam;
            if (!inputElement.classList.contains('input-class') && modalVeldConfig.type !== 'color' && modalVeldConfig.type !== 'switch') {
                inputElement.className = 'input-class w-full';
            }
        }
        if (veldDef.verplicht && inputElement.tagName !== 'LABEL') inputElement.required = true;

        if (modalVeldConfig.readonly && item) {
            if (inputElement.tagName === 'DIV') {
                Array.from(inputElement.querySelectorAll('input')).forEach(child => {
                    child.disabled = true;
                    child.classList.add('bg-gray-500', 'dark:bg-gray-600', 'cursor-not-allowed');
                });
            } else if (inputElement.tagName !== 'LABEL') {
                inputElement.readOnly = true;
                inputElement.disabled = true;
                inputElement.classList.add('bg-gray-500', 'dark:bg-gray-600', 'cursor-not-allowed');
            }
        }
        if (modalVeldConfig.extraClass && inputElement.tagName !== 'LABEL') {
            inputElement.classList.add(...modalVeldConfig.extraClass.split(' '));
        }
        div.appendChild(inputElement);
        if (modalVeldConfig.helpText) {
            const helpTextP = document.createElement('p');
            helpTextP.className = 'mt-1 text-xs text-gray-400 dark:text-gray-500';
            helpTextP.textContent = modalVeldConfig.helpText;
            div.appendChild(helpTextP);
        }
        domBeheerRefs.beheerModalFieldsContainer.appendChild(div);
    });

    domBeheerRefs.beheerModalStatus.textContent = '';
    domBeheerRefs.beheerModalStatus.classList.add('hidden');
    domBeheerRefs.beheerModal.classList.remove('hidden');
    void domBeheerRefs.beheerModal.offsetWidth;
    domBeheerRefs.beheerModal.querySelector('div > div').classList.remove('opacity-0', 'scale-95');
    domBeheerRefs.beheerModal.querySelector('div > div').classList.add('opacity-100', 'scale-100');
}

async function saveModalDataBeheer() {
    const form = domBeheerRefs.beheerModalForm;
    if (!form.checkValidity()) {
        toonModalStatus("Vul a.u.b. alle verplichte velden correct in.", "error");
        form.querySelectorAll(':invalid').forEach(el => {
            el.classList.add('border-red-500', 'dark:border-red-400');
            el.addEventListener('input', () => el.classList.remove('border-red-500', 'dark:border-red-400'), { once: true });
        });
        const firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
    }
    form.querySelectorAll('.border-red-500, .dark\\:border-red-400').forEach(el => el.classList.remove('border-red-500', 'dark:border-red-400'));

    const itemData = {};
    const config = tabConfigMap[huidigeBewerkingsTabId];

    config.velden.forEach(veldDef => {
        if (!veldDef.modalConfig) return;
        const inputField = form.elements[veldDef.interneNaam];
        if (inputField && !inputField.disabled) {
            if (veldDef.modalConfig.type === 'switch') {
                itemData[veldDef.interneNaam] = inputField.checked;
            } else if (veldDef.modalConfig.type === 'date' && inputField.value) {
                try {
                    // Voor SharePoint Date-only velden, stuur alleen YYYY-MM-DD.
                    // Voor DateTime velden, stuur ISO string. Aanname hier is Date-only.
                    // Als het een DateTime veld in SP is, moet dit new Date(inputField.value + 'T00:00:00').toISOString(); zijn.
                    // Controleer het type in SharePoint. Voor nu, uitgaande van Date-only.
                    const dateParts = inputField.value.split('-');
                    if (dateParts.length === 3) {
                         // Om Timezone issues te voorkomen bij Date-only, maak een UTC datum
                        itemData[veldDef.interneNaam] = new Date(Date.UTC(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]))).toISOString();
                    } else {
                        itemData[veldDef.interneNaam] = null; // Ongeldige datum input
                    }
                } catch (e) {
                    itemData[veldDef.interneNaam] = null;
                }
            } else if (inputField.value === "" && (veldDef.type === 'date' || veldDef.type === 'datetime' || veldDef.type === 'number')) {
                itemData[veldDef.interneNaam] = null;
            } else {
                itemData[veldDef.interneNaam] = inputField.value;
            }
        }
    });

    if (huidigeBewerkingsTabId === 'medewerkers' && itemData.Naam && (!itemData.Title || itemData.Title === "")) {
        itemData.Title = itemData.Naam;
    }

    toonModalStatus("Opslaan...", "info", false);
    domBeheerRefs.beheerModalSaveButton.disabled = true;

    try {
        if (huidigeBewerkingsItemId) {
            await updateBeheerLijstItem(config.lijstNaamSP, huidigeBewerkingsItemId, itemData);
            toonModalStatus("Item succesvol bijgewerkt!", "success");
        } else {
            const nieuwItem = await createBeheerLijstItem(config.lijstNaamSP, itemData);
            toonModalStatus(`Nieuw item succesvol aangemaakt (ID: ${nieuwItem?.d?.ID || 'onbekend'})!`, "success");
        }
        closeModalBeheer();
        await config.laadFunctie();
    } catch (error) {
        console.error("[BeheerCentrumStandalone] Fout bij opslaan item:", error);
        toonModalStatus(`Fout: ${error.message}`, "error", false);
    } finally {
        domBeheerRefs.beheerModalSaveButton.disabled = false;
    }
}

async function handleDeleteItem(tabId, itemId, trElement) {
    if (!confirm(`Weet u zeker dat u item ID ${itemId} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`)) {
        return;
    }
    const config = tabConfigMap[tabId];
    const statusElement = config.statusElement();
    toonTabStatus(tabId, `Verwijderen item ID ${itemId}...`, "info", false, statusElement);

    try {
        await deleteBeheerLijstItem(config.lijstNaamSP, itemId);
        toonTabStatus(tabId, `Item ID ${itemId} succesvol verwijderd.`, "success", true, statusElement);
        if (trElement && trElement.parentNode) {
            trElement.remove();
        } else {
            await config.laadFunctie();
        }
    } catch (error) {
        console.error(`[BeheerCentrumStandalone] Fout bij verwijderen item ID ${itemId}:`, error);
        toonTabStatus(tabId, `Fout bij verwijderen: ${error.message}`, "error", false, statusElement);
    }
}

// --- Tab Navigatie ---
async function activateTabBeheer(tabId) {
    actieveTabId = tabId;
    domBeheerRefs.tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    if (domBeheerRefs.tabContentContainer) {
        Array.from(domBeheerRefs.tabContentContainer.children).forEach(content => {
            content.classList.toggle('active', content.id === `tab-content-${tabId}`);
        });
    }
    const config = tabConfigMap[tabId];
    if (config && typeof config.laadFunctie === 'function') {
        try {
            await config.laadFunctie();
        } catch (error) {
            console.error(`[BeheerCentrumStandalone] Fout bij laden data voor tab ${tabId}:`, error);
            const tabelBody = config.tabelBodyElement();
            if(tabelBody) tabelBody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-gray-400">Kon data niet laden voor deze tab: ${error.message}</td></tr>`;
            toonTabStatus(tabId, `Fout bij laden data voor '${config.lijstNaamSP}'.`, "error", false);
        }
    } else {
        console.warn(`[BeheerCentrumStandalone] Geen laadfunctie gevonden voor tab: ${tabId}`);
        const tabelBody = config?.tabelBodyElement();
        if(tabelBody) tabelBody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-gray-400">Configuratie voor deze tab ontbreekt.</td></tr>`;
    }
}

// --- Status Berichten ---
function toonAlgemeenStatusBericht(bericht, type = 'info', autoHide = true) {
    if (domBeheerRefs.algemeenStatusBericht) {
        domBeheerRefs.algemeenStatusBericht.textContent = bericht;
        domBeheerRefs.algemeenStatusBericht.className = 'mt-4 p-3 text-sm rounded-lg';
        switch (type) {
            case 'success': domBeheerRefs.algemeenStatusBericht.classList.add('bg-green-100', 'border', 'border-green-400', 'text-green-700', 'dark:bg-green-700', 'dark:text-green-100', 'dark:border-green-600'); break;
            case 'error': domBeheerRefs.algemeenStatusBericht.classList.add('bg-red-100', 'border', 'border-red-400', 'text-red-700', 'dark:bg-red-700', 'dark:text-red-100', 'dark:border-red-600'); break;
            default: domBeheerRefs.algemeenStatusBericht.classList.add('bg-blue-100', 'border', 'border-blue-400', 'text-blue-700', 'dark:bg-blue-700', 'dark:text-blue-100', 'dark:border-blue-600'); break;
        }
        domBeheerRefs.algemeenStatusBericht.classList.remove('hidden');
        if (autoHide) {
            setTimeout(() => {
                if (domBeheerRefs.algemeenStatusBericht) domBeheerRefs.algemeenStatusBericht.classList.add('hidden');
            }, 7000);
        }
    }
}

function toonTabStatus(tabId, bericht, type = 'info', autoHide = true, statusElement = null) {
    const config = tabConfigMap[tabId];
    const el = statusElement || (config ? config.statusElement() : null);

    if (el) {
        el.textContent = bericht;
        el.className = 'mt-3 text-sm p-2 rounded-md';
         switch (type) {
            case 'success': el.classList.add('bg-green-100', 'border', 'border-green-400', 'text-green-700', 'dark:bg-green-700', 'dark:text-green-100', 'dark:border-green-600'); break;
            case 'error': el.classList.add('bg-red-100', 'border', 'border-red-400', 'text-red-700', 'dark:bg-red-700', 'dark:text-red-100', 'dark:border-red-600'); break;
            default: el.classList.add('bg-blue-100', 'border', 'border-blue-400', 'text-blue-700', 'dark:bg-blue-700', 'dark:text-blue-100', 'dark:border-blue-600'); break;
        }
        el.classList.remove('hidden');
        if (autoHide) {
            setTimeout(() => {
                if (el) el.classList.add('hidden');
            }, 5000);
        }
    } else {
        const lijstNaam = config ? config.lijstNaamSP : tabId;
        toonAlgemeenStatusBericht(`[${lijstNaam}] ${bericht}`, type, autoHide);
    }
}

function toonModalStatus(bericht, type = 'info', autoHide = true) {
    if (domBeheerRefs.beheerModalStatus) {
        domBeheerRefs.beheerModalStatus.textContent = bericht;
        domBeheerRefs.beheerModalStatus.className = 'mt-3 text-sm p-2 rounded-md';
         switch (type) {
            case 'success': domBeheerRefs.beheerModalStatus.classList.add('bg-green-100', 'border', 'border-green-400', 'text-green-700', 'dark:bg-green-700', 'dark:text-green-100', 'dark:border-green-600'); break;
            case 'error': domBeheerRefs.beheerModalStatus.classList.add('bg-red-100', 'border', 'border-red-400', 'text-red-700', 'dark:bg-red-700', 'dark:text-red-100', 'dark:border-red-600'); break;
            default: domBeheerRefs.beheerModalStatus.classList.add('bg-blue-100', 'border', 'border-blue-400', 'text-blue-700', 'dark:bg-blue-700', 'dark:text-blue-100', 'dark:border-blue-600'); break;
        }
        domBeheerRefs.beheerModalStatus.classList.remove('hidden');
        if (autoHide) {
            setTimeout(() => {
                if (domBeheerRefs.beheerModalStatus) domBeheerRefs.beheerModalStatus.classList.add('hidden');
            }, 6000);
        }
    }
}

// --- Event Listeners ---
function initBeheerEventListeners() {
    console.log("[BeheerCentrumStandalone] Initialiseren event listeners...");
    domBeheerRefs.tabButtons.forEach(button => {
        button.addEventListener('click', () => activateTabBeheer(button.dataset.tab));
    });
    if(domBeheerRefs.nieuwMedewerkerButton) domBeheerRefs.nieuwMedewerkerButton.addEventListener('click', () => openModalForItem('medewerkers', null));
    if(domBeheerRefs.nieuwDagenIndicatorButton) domBeheerRefs.nieuwDagenIndicatorButton.addEventListener('click', () => openModalForItem('dagen-indicators', null));
    if(domBeheerRefs.nieuwFunctieButton) domBeheerRefs.nieuwFunctieButton.addEventListener('click', () => openModalForItem('keuzelijst-functies', null));
    if(domBeheerRefs.nieuwVerlofredenButton) domBeheerRefs.nieuwVerlofredenButton.addEventListener('click', () => openModalForItem('verlofredenen', null));
    if(domBeheerRefs.nieuwSeniorButton) domBeheerRefs.nieuwSeniorButton.addEventListener('click', () => openModalForItem('seniors', null));
    if(domBeheerRefs.nieuwTeamButton) domBeheerRefs.nieuwTeamButton.addEventListener('click', () => openModalForItem('teams', null));
    if(domBeheerRefs.beheerModalCloseX) domBeheerRefs.beheerModalCloseX.addEventListener('click', closeModalBeheer);
    if(domBeheerRefs.beheerModalCancelButton) domBeheerRefs.beheerModalCancelButton.addEventListener('click', closeModalBeheer);
    if(domBeheerRefs.beheerModalSaveButton) domBeheerRefs.beheerModalSaveButton.addEventListener('click', saveModalDataBeheer);
    if (domBeheerRefs.beheerModal) {
        domBeheerRefs.beheerModal.addEventListener('click', (event) => {
            if (event.target === domBeheerRefs.beheerModal) {
                closeModalBeheer();
            }
        });
    }
    console.log("[BeheerCentrumStandalone] Event listeners geïnitialiseerd.");
}

function closeModalBeheer() {
    if(domBeheerRefs.beheerModal) {
        const modalContent = domBeheerRefs.beheerModal.querySelector('div > div');
        modalContent.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            domBeheerRefs.beheerModal.classList.add('hidden');
        }, 200);
    }
}

// --- Hoofd Initialisatie ---
async function initializeBeheerCentrumStandalone() {
    console.log("[BeheerCentrumStandalone] Initialiseren pagina...");
    if (domBeheerRefs.currentYearSpan) {
        domBeheerRefs.currentYearSpan.textContent = new Date().getFullYear();
    }

    // Context eerst, want thema ophalen heeft user info nodig
    const contextOK = await initializeBeheerContextStandalone();
    if (!contextOK) {
        // Foutbericht is al getoond door initializeBeheerContextStandalone
        // Pas een default thema toe als context faalt, zodat de pagina niet stijlloos is
        pasThemaKlassenToe('dark'); // Default naar donker bij contextfout
        return;
    }

    // Laad en pas thema toe (kan nu gebruiker info gebruiken)
    await laadEnPasThemaToe();

    try {
        toonAlgemeenStatusBericht("Initiële data voor dropdowns laden...", "info", false);
        const initialDataPromises = [];
        if (alleKeuzelijstFunctiesData.length === 0) {
            initialDataPromises.push(
                getBeheerLijstItems('keuzelijstFuncties', "$select=ID,Title", "", "", "Title asc")
                .then(data => alleKeuzelijstFunctiesData = data)
            );
        }
        if (alleTeamsData.length === 0) {
             initialDataPromises.push(
                getBeheerLijstItems('Teams', "$select=ID,Naam,Title,Actief", "$filter=Actief eq 1", "", "Naam asc")
                .then(data => alleTeamsData = data)
            );
        }
        if(initialDataPromises.length > 0) {
            await Promise.all(initialDataPromises);
        }
        toonAlgemeenStatusBericht("Dropdown data geladen.", "success", true);
    } catch (error) {
        console.error("[BeheerCentrumStandalone] Fout bij laden initiële dropdown data:", error);
        toonAlgemeenStatusBericht("Fout bij laden van selectieopties.", "error", false);
    }

    initBeheerEventListeners();
    await activateTabBeheer(actieveTabId);
    console.log("[BeheerCentrumStandalone] Pagina initialisatie voltooid.");
}

// Start de initialisatie
const checkStandaloneConfigInterval = setInterval(() => {
    // @ts-ignore
    if (typeof getLijstConfig === 'function' && typeof sharepointLijstConfiguraties !== 'undefined') {
        clearInterval(checkStandaloneConfigInterval);
        console.log("[BeheerCentrumStandalone] configLijst.js en functies zijn beschikbaar.");
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeBeheerCentrumStandalone);
        } else {
            initializeBeheerCentrumStandalone();
        }
    } else {
        console.log("[BeheerCentrumStandalone] Wachten op configLijst.js...");
    }
}, 100);

setTimeout(() => {
    // @ts-ignore
    if (typeof getLijstConfig !== 'function') {
        clearInterval(checkStandaloneConfigInterval);
        console.error("[BeheerCentrumStandalone] Kritische fout: configLijst.js of getLijstConfig functie niet geladen na 5 seconden.");
        if(domBeheerRefs.algemeenStatusBericht) toonAlgemeenStatusBericht("Kritische fout: Applicatieconfiguratie kon niet geladen worden.", "error", false);
    }
}, 5000);


console.log("Pages/JS/beheerCentrum_logic_standalone.js geladen.");
