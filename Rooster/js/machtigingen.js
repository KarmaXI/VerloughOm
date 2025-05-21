// js/machtigingen.js

/**
 * Beheert gebruikersmachtigingen en de zichtbaarheid van UI-elementen
 * door middel van SharePoint REST API calls.
 * Haalt SharePoint context (web URL, gebruiker info) ook via REST API.
 * Maakt globale variabelen en functies beschikbaar op het 'window' object.
 */

const GEDEFINIEERDE_SITE_URL = "/sites/MulderT/CustomPW/Verlof/"; // Pas aan indien nodig

// Definieer de mapping van UI secties naar vereiste SharePoint groepen
window.UI_SECTION_PERMISSIONS = {
    "BeheerHeader": ["1. Sharepoint beheer", "1.1. Mulder MT"],
    "AdminInstellingen": ["1. Sharepoint beheer", "1.1. Mulder MT"],
};

// Globale initialisatie promise voor andere scripts om op te wachten
let resolveMachtigingenPromise;
let rejectMachtigingenPromise;
window.machtigingenInitializationPromise = new Promise((resolve, reject) => {
    resolveMachtigingenPromise = resolve;
    rejectMachtigingenPromise = reject;
});

/**
 * Trimt de prefix van een SharePoint loginnaam.
 * @param {string} loginNaam - De volledige loginnaam.
 * @returns {string} De getrimde loginnaam.
 */
function trimLoginNaamPrefixMachtigingen(loginNaam) {
    if (!loginNaam) return '';
    const prefixesToRemove = ["i:0#.w|", "c:0(.s|true|", "i:05.t|"];
    for (const prefix of prefixesToRemove) {
        if (loginNaam.toLowerCase().startsWith(prefix.toLowerCase())) {
            return loginNaam.substring(prefix.length);
        }
    }
    return loginNaam.startsWith('|') ? loginNaam.substring(1) : loginNaam;
}
window.trimLoginNaamPrefixMachtigingen = trimLoginNaamPrefixMachtigingen;

/**
 * Initialiseert de SharePoint context (web URL, huidige gebruiker) via REST API.
 * Zet window.spWebAbsoluteUrl en window.huidigeGebruiker.
 * Resolves/rejects window.machtigingenInitializationPromise.
 */
async function initializeSharePointContextViaAPI() {
    console.log("[Machtigingen] Start initialisatie SharePoint context via API.");
    try {
        let baseUrl = GEDEFINIEERDE_SITE_URL;
        if (!baseUrl.startsWith('http')) {
            baseUrl = window.location.origin + (baseUrl.startsWith('/') ? '' : '/') + baseUrl;
        }
        window.spWebAbsoluteUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
        console.log("[Machtigingen] SharePoint site URL ingesteld op:", window.spWebAbsoluteUrl);

        const userResponse = await fetch(`${window.spWebAbsoluteUrl}_api/web/currentuser?$select=LoginName,Title,Id,Email,IsSiteAdmin`, {
            method: 'GET',
            headers: { 'Accept': 'application/json;odata=verbose' }
        });

        if (!userResponse.ok) {
            const errorText = await userResponse.text();
            console.error(`[Machtigingen] Fout bij ophalen gebruikersinformatie: ${userResponse.status} ${userResponse.statusText}`, errorText);
            throw new Error(`HTTP error ${userResponse.status} bij ophalen huidige gebruiker.`);
        }
        const userData = await userResponse.json();
        
        window.huidigeGebruiker = {
            loginNaam: userData.d.LoginName,
            normalizedUsername: trimLoginNaamPrefixMachtigingen(userData.d.LoginName),
            Id: userData.d.Id,
            Title: userData.d.Title,
            Email: userData.d.Email,
            isSiteAdmin: userData.d.IsSiteAdmin,
            sharePointGroepen: [] 
        };
        console.log("[Machtigingen] Basis gebruikersinfo opgehaald:", window.huidigeGebruiker.Title, window.huidigeGebruiker.loginNaam);

        window.huidigeGebruiker.sharePointGroepen = await getGebruikerSharePointGroepenViaAPI();

        console.log("[Machtigingen] Context init VOLTOOID. Globals (spWebAbsoluteUrl, huidigeGebruiker) zijn nu gezet.");
        
        if (resolveMachtigingenPromise) resolveMachtigingenPromise(); // Resolve de promise NA het zetten van globals
        return true;
    } catch (error) {
        console.error("[Machtigingen] Kritische fout bij initialiseren SharePoint context via API:", error);
        if (!window.spWebAbsoluteUrl) window.spWebAbsoluteUrl = GEDEFINIEERDE_SITE_URL.endsWith('/') ? GEDEFINIEERDE_SITE_URL : GEDEFINIEERDE_SITE_URL + '/';
        if (rejectMachtigingenPromise) rejectMachtigingenPromise(error); // Reject de promise bij fout
        return false;
    }
}

/**
 * Haalt de SharePoint groepen op waar de huidige gebruiker lid van is.
 * @returns {Promise<string[]>} Een array met de namen van de groepen.
 */
async function getGebruikerSharePointGroepenViaAPI() {
    // Deze functie gebruikt window.spWebAbsoluteUrl en window.huidigeGebruiker,
    // dus die moeten al gezet zijn voordat deze wordt aangeroepen.
    if (!window.spWebAbsoluteUrl || !window.huidigeGebruiker || !window.huidigeGebruiker.loginNaam) {
        console.warn("[Machtigingen] Kan groepen niet ophalen: context (URL/loginNaam) niet volledig.");
        return [];
    }
    const apiUrl = `${window.spWebAbsoluteUrl.replace(/\/$/, "")}/_api/web/currentuser/groups`;
    try {
        const response = await fetch(apiUrl, { method: 'GET', headers: { 'Accept': 'application/json;odata=verbose' } });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`[Machtigingen] Fout bij ophalen gebruikersgroepen: ${response.status}`, errorData.error?.message?.value);
            return [];
        }
        const data = await response.json();
        const groupTitles = data.d.results.map(group => group.Title);
        console.log("[Machtigingen] Gebruikersgroepen opgehaald via API:", groupTitles);
        return groupTitles;
    } catch (error) {
        console.error("[Machtigingen] Uitzondering bij ophalen gebruikersgroepen:", error);
        return [];
    }
}
window.getGebruikerSharePointGroepenViaAPI = getGebruikerSharePointGroepenViaAPI;


/**
 * Haalt items op uit een SharePoint lijst via REST API.
 */
async function getLijstItemsAlgemeen(lijstConfigKey, selectQuery = "", filterQuery = "", expandQuery = "", orderbyQuery = "") {
    if (!window.spWebAbsoluteUrl) { /* ... */ return []; } // Onveranderd
    const lijstConfig = getLijstConfig(lijstConfigKey);
    if (!lijstConfig || !lijstConfig.lijstId) { /* ... */ return []; } // Onveranderd
    const lijstId = lijstConfig.lijstId;
    let apiUrlPath = `/_api/web/lists(guid'${lijstId}')/items`;
    let queryParams = [];
    if (selectQuery) queryParams.push(selectQuery);
    if (filterQuery) queryParams.push(filterQuery);
    if (expandQuery) queryParams.push(expandQuery);
    if (orderbyQuery) queryParams.push(orderbyQuery);
    const baseApiUrl = window.spWebAbsoluteUrl.replace(/\/$/, "");
    const apiUrl = `${baseApiUrl}${apiUrlPath}${queryParams.length > 0 ? '?' + queryParams.join('&') : ''}`;
    try {
        const response = await fetch(apiUrl, { method: 'GET', headers: { 'Accept': 'application/json;odata=verbose' } });
        if (!response.ok) { /* ... */ throw new Error(spErrorMessage); } // Onveranderd
        const data = await response.json();
        return data.d.results;
    } catch (error) { /* ... */ return []; } // Onveranderd
}
window.getLijstItemsAlgemeen = getLijstItemsAlgemeen;

/**
 * Haalt een X-RequestDigest op.
 */
async function getRequestDigestGlobally() { /* ... Onveranderd ... */ 
    if (!window.spWebAbsoluteUrl) throw new Error("Web absolute URL niet beschikbaar voor Request Digest.");
    const apiUrl = `${window.spWebAbsoluteUrl.replace(/\/$/, "")}/_api/contextinfo`;
    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Accept': 'application/json;odata=verbose' } });
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Machtigingen] Fout bij ophalen Request Digest: ${response.status}`, errorText);
        throw new Error("Kon Request Digest niet ophalen.");
    }
    const data = await response.json();
    return data.d.GetContextWebInformation.FormDigestValue;
}
window.getRequestDigestGlobally = getRequestDigestGlobally;

/**
 * Maakt een nieuw item aan in een SharePoint lijst.
 */
async function createSPListItem(lijstConfigKey, itemData) { /* ... Onveranderd ... */ 
    if (!window.spWebAbsoluteUrl) throw new Error("Web absolute URL niet beschikbaar voor item creatie.");
    const requestDigest = await getRequestDigestGlobally();
    const lijstConfig = getLijstConfig(lijstConfigKey);
    if (!lijstConfig || !lijstConfig.lijstId || !lijstConfig.lijstTitel) {
        throw new Error(`Lijstconfiguratie (met lijstId en lijstTitel) niet gevonden voor '${lijstConfigKey}' in configLijst.js`);
    }
    itemData.__metadata = { "type": `SP.Data.${lijstConfig.lijstTitel.replace(/\s+/g, '_')}ListItem` };
    const apiUrl = `${window.spWebAbsoluteUrl.replace(/\/$/, "")}/_api/web/lists(guid'${lijstConfig.lijstId}')/items`;
    console.log(`[Machtigingen] createSPListItem - API call naar: ${apiUrl} voor lijst: ${lijstConfig.lijstTitel}`, itemData);
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
        const errorData = await response.json().catch(() => ({ "error": { "message": { "value": "Onbekende serverfout bij parsen error response."}} }));
        const spErrorMessage = errorData.error?.message?.value || `HTTP error ${response.status}`;
        console.error(`[Machtigingen] Fout bij aanmaken item in ${lijstConfig.lijstTitel} (${response.status}): ${spErrorMessage}`);
        throw new Error(spErrorMessage);
    }
    console.log(`[Machtigingen] Item succesvol aangemaakt in ${lijstConfig.lijstTitel}. Status: ${response.status}`);
    return response.status === 201 ? await response.json() : null;
}
window.createSPListItem = createSPListItem;

/**
 * Controleert of de gebruiker lid is van ten minste één van de vereiste groepen.
 */
window.heeftGebruikerMachtiging = function(gedeelteNaam, gebruikersGroepen) { /* ... Onveranderd ... */ 
    if (!gedeelteNaam || typeof gedeelteNaam !== 'string') {
        console.warn(`[Machtigingen] Ongeldige gedeelteNaam voor heeftGebruikerMachtiging: ${gedeelteNaam}`);
        return false;
    }
    if (!window.UI_SECTION_PERMISSIONS || typeof window.UI_SECTION_PERMISSIONS !== 'object') {
        console.error("[Machtigingen] UI_SECTION_PERMISSIONS is niet gedefinieerd of geen object.");
        return false;
    }
    const vereisteGroepenVoorGedeelte = window.UI_SECTION_PERMISSIONS[gedeelteNaam];
    if (!vereisteGroepenVoorGedeelte || !Array.isArray(vereisteGroepenVoorGedeelte) || vereisteGroepenVoorGedeelte.length === 0) {
        console.log(`[Machtigingen] Geen machtigingsregel gedefinieerd of lege regel voor sectie: ${gedeelteNaam}. Toegang standaard geweigerd.`);
        return false; 
    }
    if (!gebruikersGroepen || !Array.isArray(gebruikersGroepen)) {
        console.warn(`[Machtigingen] Ongeldige of lege gebruikersGroepen array voor heeftGebruikerMachtiging: ${JSON.stringify(gebruikersGroepen)}`);
        return false;
    }
    return vereisteGroepenVoorGedeelte.some(vereisteGroep => 
        gebruikersGroepen.some(userGroup => userGroup.toLowerCase() === vereisteGroep.toLowerCase())
    );
};

/**
 * Past UI elementen aan op basis van gebruikersmachtigingen.
 */
async function pasUIMachtigingenToe() {
    if (!window.huidigeGebruiker || !window.huidigeGebruiker.loginNaam || !window.huidigeGebruiker.sharePointGroepen) {
        console.warn("[Machtigingen] pasUIMachtigingenToe: Wachten op volledige initialisatie van huidigeGebruiker (incl. groepen)...");
        // De promise zou dit moeten afvangen, maar een extra check kan geen kwaad.
        // Als de promise nog niet resolved is, zal deze functie later opnieuw worden aangeroepen.
        return; 
    }
    console.log("[Machtigingen] Toepassen UI machtigingen met groepen:", window.huidigeGebruiker.sharePointGroepen);

    try {
        const beheerButton = document.getElementById('beheer-centrum-button'); 
        const adminInstellingenButton = document.getElementById('admin-instellingen-button');

        if (beheerButton) {
            beheerButton.classList.toggle('hidden', !window.heeftGebruikerMachtiging("BeheerHeader", window.huidigeGebruiker.sharePointGroepen));
        } else { console.warn("[Machtigingen] Element 'beheer-centrum-button' niet gevonden."); }

        if (adminInstellingenButton) {
            adminInstellingenButton.classList.toggle('hidden', !window.heeftGebruikerMachtiging("AdminInstellingen", window.huidigeGebruiker.sharePointGroepen));
        } else { console.warn("[Machtigingen] Element 'admin-instellingen-button' niet gevonden."); }
        
        console.log("[Machtigingen] UI machtigingen succesvol toegepast.");

    } catch (error) {
        console.error("[Machtigingen] Fout bij het toepassen van UI machtigingen:", error);
    }
}

/**
 * Hoofd initialisatiefunctie voor machtigingen.js.
 */
async function initializeMachtigingen() {
    console.log("[Machtigingen] DOM geladen. Starten met initialisatie SharePoint context...");
    // initializeSharePointContextViaAPI zal de promise resolven/rejecten.
    const contextInitialized = await initializeSharePointContextViaAPI(); 
    
    if (contextInitialized) {
        console.log("[Machtigingen] SharePoint context succesvol geïnitialiseerd. UI machtigingen worden nu toegepast.");
        // pasUIMachtigingenToe heeft toegang tot de globale window.huidigeGebruiker.sharePointGroepen
        await pasUIMachtigingenToe(); 
    } else {
        console.error("[Machtigingen] Initialisatie SharePoint context MISLUKT. UI machtigingen worden mogelijk niet correct toegepast.");
        // De promise is al gereject in initializeSharePointContextViaAPI
    }
}

document.addEventListener('DOMContentLoaded', initializeMachtigingen);
console.log("js/machtigingen.js geladen en wacht op DOMContentLoaded.");