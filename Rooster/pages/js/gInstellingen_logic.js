// Pages/JS/gInstellingen_logic.js

/**
 * Logica voor de gInstellingen.html pagina.
 * Beheert het laden en opslaan van gebruikersspecifieke instellingen en
 * het weergeven van persoonlijke gegevens en werkroosterinformatie, inclusief het bewerken van het werkrooster.
 */

// BELANGRIJK: Statisch gedefinieerd relatief pad naar de SharePoint-site.
const GINSTELLINGEN_SITE_URL = "/sites/MulderT/CustomPW/Verlof/"; // Pas aan indien nodig!

// Globale variabelen
let spWebAbsoluteUrlInstellingen = '';
let huidigeGebruikerInstellingen = {
    loginNaam: null,
    normalizedUsername: null,
    Id: null,
    Title: null,
    Email: null,
    medewerkerData: null,
    gebruikersInstellingenSP: null,
    urenPerWeekActueel: null,
    alleUrenPerWeekHistorie: []
};
let alleDagenIndicatorsData = [];

// DOM Referenties
const domInstellingenRefs = {
    appBody: document.body,
    tabButtons: document.querySelectorAll('.tab-button'),
    tabContents: document.querySelectorAll('.tab-content'),
    pgNaamInput: document.getElementById('pg-naam'),
    pgUsernameInput: document.getElementById('pg-username'),
    pgEmailInput: document.getElementById('pg-email'),
    pgTeamInput: document.getElementById('pg-team'),
    pgFunctieInput: document.getElementById('pg-functie'),
    werkdagenDisplayContainer: document.getElementById('werkdagen-display-container'),
    wijzigWerkroosterKnop: document.getElementById('wijzig-werkrooster-knop'),
    werkroosterEditFormContainer: document.getElementById('werkrooster-edit-form-container'),
    werkroosterIngangsdatumInput: document.getElementById('werkrooster-ingangsdatum'),
    // De input rows container:
    werkroosterInputRows: document.getElementById('werkrooster-input-rows'), // Belangrijk voor het dynamisch vullen
    opslaanWerkroosterKnop: document.getElementById('opslaan-werkrooster-knop'),
    annuleerWerkroosterKnop: document.getElementById('annuleer-werkrooster-knop'),
    werkroosterStatusBericht: document.getElementById('werkrooster-status-bericht'),
    instellingenForm: document.getElementById('rooster-instellingen-form'),
    instThemaSelect: document.getElementById('inst-thema'),
    instEigenTeamCheckbox: document.getElementById('inst-eigen-team'),
    instWeekendenCheckbox: document.getElementById('inst-weekenden'),
    opslaanInstellingenButton: document.getElementById('opslaan-instellingen-button'),
    instellingenStatusBericht: document.getElementById('instellingen-status-bericht'),
    currentYearSpan: document.getElementById('current-year'),
    pageTitleHeader: document.querySelector('#app-container > header h1'),
    pageSubtitleHeader: document.querySelector('#app-container > header p'),
    persGegevensTitle: document.querySelector('#tab-content-persoonlijk > h2'),
    roosterInstTitle: document.querySelector('#tab-content-instellingen > h2'),
    werkdagenTitle: document.querySelector('#persoonlijke-gegevens-form > div > div > h3')
};

const DAGEN_VAN_DE_WEEK = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"];

// --- Functie om prefix van loginnaam te trimmen ---
function trimLoginNaamPrefixInstellingen(loginNaam) {
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
 * Initialiseert de SharePoint context (web URL en gebruikersinformatie).
 */
async function initializeInstellingenContext() {
    console.log("[gInstellingen] Initialiseren context met statische URL...");
    if (!GINSTELLINGEN_SITE_URL || typeof GINSTELLINGEN_SITE_URL !== 'string' || GINSTELLINGEN_SITE_URL.trim() === "") {
        const errorMsg = "[gInstellingen] Kritische fout: GINSTELLINGEN_SITE_URL is niet correct gedefinieerd in dit script. Pagina kan niet laden.";
        console.error(errorMsg);
        toonInstellingenStatusBericht(errorMsg, "error", false);
        if(domInstellingenRefs.opslaanInstellingenButton) domInstellingenRefs.opslaanInstellingenButton.disabled = true;
        if(domInstellingenRefs.opslaanWerkroosterKnop) domInstellingenRefs.opslaanWerkroosterKnop.disabled = true;
        return false;
    }
    const sitePath = GINSTELLINGEN_SITE_URL.replace(/\/$/, "");
    try {
        const absoluteSiteApiUrl = `${window.location.origin}${sitePath}/_api/web?$select=Url`;
        const webResponse = await fetch(absoluteSiteApiUrl, { headers: { 'Accept': 'application/json;odata=verbose' } });
        if (!webResponse.ok) {
            const errorDetail = await webResponse.text().catch(() => `Status: ${webResponse.statusText}`);
            console.error(`[gInstellingen] Fout ${webResponse.status} bij ophalen web URL via ${absoluteSiteApiUrl}. Details: ${errorDetail}.`);
            throw new Error(`Kan web URL niet ophalen (status: ${webResponse.status})`);
        }
        const webData = await webResponse.json();
        spWebAbsoluteUrlInstellingen = webData.d.Url;
        if (!spWebAbsoluteUrlInstellingen.endsWith('/')) spWebAbsoluteUrlInstellingen += '/';

        const userResponse = await fetch(`${spWebAbsoluteUrlInstellingen}_api/web/currentuser?$select=LoginName,Title,Id,Email`, { headers: { 'Accept': 'application/json;odata=verbose' } });
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
        console.log("[gInstellingen] Context succesvol opgehaald. User:", huidigeGebruikerInstellingen.normalizedUsername);
        return true;
    } catch (error) {
        console.error("[gInstellingen] Kritische fout bij ophalen context:", error);
        toonInstellingenStatusBericht(`Kan geen verbinding maken met de server (${error.message}).`, "error", false);
        if(domInstellingenRefs.opslaanInstellingenButton) domInstellingenRefs.opslaanInstellingenButton.disabled = true;
        if(domInstellingenRefs.opslaanWerkroosterKnop) domInstellingenRefs.opslaanWerkroosterKnop.disabled = true;
        return false;
    }
}

/**
 * Haalt items op uit een SharePoint lijst via REST API.
 */
async function haalInstellingenLijstItems(lijstIdentifier, selectQuery = "", filterQuery = "", expandQuery = "", orderbyQuery = "") {
    if (!spWebAbsoluteUrlInstellingen) {
        console.error(`[gInstellingen] haalInstellingenLijstItems: spWebAbsoluteUrlInstellingen is niet beschikbaar. Kan lijst '${lijstIdentifier}' niet ophalen.`);
        toonInstellingenStatusBericht(`Fout: Serververbinding niet beschikbaar voor lijst '${lijstIdentifier}'.`, "error", false);
        return [];
    }
    // @ts-ignore
    const lijstConfig = getLijstConfig(lijstIdentifier);
    if (!lijstConfig) {
        console.error(`[gInstellingen] Kon lijst configuratie niet vinden voor identifier: ${lijstIdentifier}`);
        if (lijstIdentifier !== "gebruikersInstellingen") {
             toonInstellingenStatusBericht(`Configuratiefout voor lijst '${lijstIdentifier}'.`, "error", false);
        }
        return [];
    }
    const lijstIdOfTitel = lijstConfig.lijstId || lijstConfig.lijstTitel;
    const lijstDisplayName = lijstConfig.lijstTitel || lijstIdentifier;
    let apiUrlPath;
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
    console.log(`[gInstellingen] Ophalen items voor lijst '${lijstDisplayName}': ${decodeURIComponent(apiUrl)}`);
    try {
        if (lijstIdentifier !== "gebruikersInstellingen") {
            toonInstellingenStatusBericht(`Laden data voor '${lijstDisplayName}'...`, "info", false);
        }
        const response = await fetch(apiUrl, { method: 'GET', headers: { 'Accept': 'application/json;odata=verbose' } });
        if (!response.ok) {
            let errorDetail = `Status: ${response.status} ${response.statusText}. URL: ${apiUrl}`;
            try { const errorData = await response.json(); errorDetail = errorData.error?.message?.value || errorDetail; } catch (e) { /* ignore */ }
            console.error(`[gInstellingen] Fout bij ophalen lijst '${lijstDisplayName}': ${errorDetail}`);
            if (lijstIdentifier !== "gebruikersInstellingen") {
                toonInstellingenStatusBericht(`Fout bij laden van lijst '${lijstDisplayName}': ${errorDetail}`, "error", false);
            }
            return [];
        }
        const data = await response.json();
        const itemCount = data.d.results ? data.d.results.length : 0;
        if (lijstIdentifier !== "gebruikersInstellingen") {
            toonInstellingenStatusBericht(`${itemCount} items geladen voor '${lijstDisplayName}'.`, "success", true);
        }
        return data.d.results || [];
    } catch (error) {
        console.error(`[gInstellingen] Uitzondering bij ophalen lijst '${lijstDisplayName}':`, error);
         if (lijstIdentifier !== "gebruikersInstellingen") {
            toonInstellingenStatusBericht(`Netwerkfout bij laden van lijst '${lijstDisplayName}': ${error.message}`, "error", false);
        }
        return [];
    }
}

// --- Thema Functies ---
function pasThemaKlassenToe(thema) {
    const isLichtThema = thema === 'light';
    if (domInstellingenRefs.appBody) {
        domInstellingenRefs.appBody.classList.toggle('light-theme', isLichtThema);
        domInstellingenRefs.appBody.classList.toggle('dark-theme', !isLichtThema);
        console.log(`[gInstellingen] Thema klassen op body: ${domInstellingenRefs.appBody.className}`);
    }
}

async function laadEnPasThemaToe() {
    const opgeslagenThema = localStorage.getItem('gInstellingenThema');
    if (opgeslagenThema) {
        pasThemaKlassenToe(opgeslagenThema);
    } else {
        pasThemaKlassenToe('dark');
    }

    if (!huidigeGebruikerInstellingen.normalizedUsername) {
        console.warn("[gInstellingen] Kan thema niet ophalen van SharePoint: normalizedUsername ontbreekt.");
        return;
    }
    try {
        // @ts-ignore
        const instellingenConfig = getLijstConfig("gebruikersInstellingen");
        if (!instellingenConfig) return;

        const filterQuery = `$filter=Title eq '${huidigeGebruikerInstellingen.normalizedUsername}'`;
        const selectQuery = "$select=ID,Title,soortWeergave,EigenTeamWeergeven,WeekendenWeergeven";
        const instellingenItems = await haalInstellingenLijstItems("gebruikersInstellingen", selectQuery, filterQuery);

        if (instellingenItems && instellingenItems.length > 0) {
            huidigeGebruikerInstellingen.gebruikersInstellingenSP = instellingenItems[0];
            const themaVanSP = instellingenItems[0].soortWeergave;
            if (themaVanSP === 'dark' || themaVanSP === 'light') {
                pasThemaKlassenToe(themaVanSP);
                localStorage.setItem('gInstellingenThema', themaVanSP);
            }
        } else {
             huidigeGebruikerInstellingen.gebruikersInstellingenSP = {
                Title: huidigeGebruikerInstellingen.normalizedUsername,
                soortWeergave: opgeslagenThema || 'dark',
                EigenTeamWeergeven: false,
                WeekendenWeergeven: true
            };
        }
    } catch (error) {
        console.error("[gInstellingen] Fout bij ophalen thema-instellingen van SharePoint:", error);
    }
}

function pasThemaEnSlaOp(thema) {
    pasThemaKlassenToe(thema);
    localStorage.setItem('gInstellingenThema', thema);
    if (domInstellingenRefs.instThemaSelect.value !== thema) {
        domInstellingenRefs.instThemaSelect.value = thema;
    }
}

/**
 * Load teams and functions for dropdowns
 */
async function loadTeamsAndFunctions() {
    try {
        // Get Teams from the Teams list - use Naam field
        const teamsData = await haalInstellingenLijstItems("Teams", "$select=ID,Title,Naam,Actief");
        const pgTeamSelect = document.getElementById('pg-team');
        
        if (pgTeamSelect) {
            pgTeamSelect.innerHTML = '<option value="">Selecteer een team</option>';
            
            // Filter active teams and sort them
            const activeTeams = teamsData.filter(team => team.Actief !== false)
                                       .sort((a, b) => (a.Naam || a.Title || "").localeCompare(b.Naam || b.Title || ""));
            
            activeTeams.forEach(team => {
                const option = document.createElement('option');
                option.value = team.Naam || team.Title;
                option.textContent = team.Naam || team.Title;
                pgTeamSelect.appendChild(option);
            });
        }
        
        // Get Functions from the keuzelijstFuncties list - use Title field
        const functiesData = await haalInstellingenLijstItems("keuzelijstFuncties", "$select=ID,Title");
        const pgFunctieSelect = document.getElementById('pg-functie');
        
        if (pgFunctieSelect) {
            pgFunctieSelect.innerHTML = '<option value="">Selecteer een functie</option>';
            
            // Sort functions alphabetically
            const sortedFuncties = functiesData.sort((a, b) => (a.Title || "").localeCompare(b.Title || ""));
            
            sortedFuncties.forEach(functie => {
                const option = document.createElement('option');
                option.value = functie.Title;
                option.textContent = functie.Title;
                pgFunctieSelect.appendChild(option);
            });
        }
        
        // Set current values if available
        if (huidigeGebruikerInstellingen.medewerkerData) {
            if (pgTeamSelect && huidigeGebruikerInstellingen.medewerkerData.Team) {
                pgTeamSelect.value = huidigeGebruikerInstellingen.medewerkerData.Team;
            }
            if (pgFunctieSelect && huidigeGebruikerInstellingen.medewerkerData.Functie) {
                pgFunctieSelect.value = huidigeGebruikerInstellingen.medewerkerData.Functie;
            }
        }
        
        console.log("[gInstellingen] Teams and functions loaded successfully");
    } catch (error) {
        console.error("[gInstellingen] Error loading teams or functions:", error);
        toonInstellingenStatusBericht("Fout bij laden van teams of functies.", "error", false);
    }
}

/**
 * Sets the profile picture for the user
 */
function setProfilePicture() {
    const profilePicElement = document.getElementById('pg-profile-pic');
    if (!profilePicElement) return;
    
    if (typeof window.getProfilePhotoUrl === 'function' && huidigeGebruikerInstellingen.medewerkerData) {
        // If the main application's getProfilePhotoUrl function exists
        profilePicElement.src = window.getProfilePhotoUrl(huidigeGebruikerInstellingen.medewerkerData, 'M');
    } else {
        // Fallback to using initials or default image
        if (huidigeGebruikerInstellingen.medewerkerData && huidigeGebruikerInstellingen.medewerkerData.Naam) {
            // Create canvas for initials
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            
            // Draw background
            ctx.fillStyle = '#60a5fa'; // Blue background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw initials
            const name = huidigeGebruikerInstellingen.medewerkerData.Naam;
            const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 40px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(initials, canvas.width/2, canvas.height/2);
            
            // Set as image src
            profilePicElement.src = canvas.toDataURL();
        } else {
            // Default user icon
            profilePicElement.src = '../Icoon/default-profile.svg';
        }
    }
    
    // Add error handler to fallback to default image
    profilePicElement.onerror = function() {
        this.src = '../Icoon/default-profile.svg';
        this.alt = 'Standaard profielicoon';
    };
}

async function laadGebruikersGegevens() {
    if (!huidigeGebruikerInstellingen.normalizedUsername) {
        toonInstellingenStatusBericht("Gebruikersinformatie is onvolledig.", "error", false);
        return;
    }
    toonInstellingenStatusBericht("Bezig met laden van uw gegevens...", "info", false);
    try {
        const dataPromises = [
            // @ts-ignore
            haalInstellingenLijstItems("Medewerkers", "$select=ID,Title,Naam,Username,E_x002d_mail,Team,Functie", `$filter=Username eq '${huidigeGebruikerInstellingen.normalizedUsername}'`)
                .then(medArray => {
                    if (medArray.length > 0) huidigeGebruikerInstellingen.medewerkerData = medArray[0];
                    else huidigeGebruikerInstellingen.medewerkerData = { Naam: huidigeGebruikerInstellingen.Title, Username: huidigeGebruikerInstellingen.normalizedUsername, E_x002d_mail: huidigeGebruikerInstellingen.Email, Team: "N.v.t.", Functie: "N.v.t." };
                }),
            // @ts-ignore
            haalInstellingenLijstItems("UrenPerWeek", `$select=ID,Ingangsdatum,VeranderingsDatum,${DAGEN_VAN_DE_WEEK.map(d => `${d}Start,${d}Eind,${d}Soort`).join(',')}`, `$filter=MedewerkerID eq '${huidigeGebruikerInstellingen.normalizedUsername}'`, "", "$orderby=Ingangsdatum desc")
                .then(historieArray => {
                    huidigeGebruikerInstellingen.alleUrenPerWeekHistorie = historieArray || [];
                    // Bepaal het huidige actieve rooster (geen VeranderingsDatum of VeranderingsDatum in de toekomst)
                    huidigeGebruikerInstellingen.urenPerWeekActueel = (historieArray || []).find(item => !item.VeranderingsDatum || new Date(item.VeranderingsDatum) > new Date()) || null;
                    if (!huidigeGebruikerInstellingen.urenPerWeekActueel && historieArray.length > 0) {
                        // Fallback als geen "actief" rooster is, neem de meest recente
                        huidigeGebruikerInstellingen.urenPerWeekActueel = historieArray[0];
                    }
                }),
            // @ts-ignore
            haalInstellingenLijstItems("DagenIndicators", "$select=ID,Title,Beschrijving")
                .then(indicators => alleDagenIndicatorsData = indicators || [])
        ];
        await Promise.all(dataPromises);
        vulPersoonlijkeGegevensTab();
        vulRoosterInstellingenTab();
        toonInstellingenStatusBericht("Gegevens succesvol geladen.", "success");
    } catch (error) {
        console.error("[gInstellingen] Fout bij laden gebruikersgegevens:", error);
        toonInstellingenStatusBericht("Fout bij het laden van uw gegevens.", "error", false);
    }
}

function vulPersoonlijkeGegevensTab() {
    if (huidigeGebruikerInstellingen.medewerkerData) {
        domInstellingenRefs.pgNaamInput.value = huidigeGebruikerInstellingen.medewerkerData.Naam || huidigeGebruikerInstellingen.Title || '';
        domInstellingenRefs.pgUsernameInput.value = huidigeGebruikerInstellingen.medewerkerData.Username || huidigeGebruikerInstellingen.loginNaam || '';
        domInstellingenRefs.pgEmailInput.value = huidigeGebruikerInstellingen.medewerkerData.E_x002d_mail || huidigeGebruikerInstellingen.Email || '';
        
        // Set profile picture
        setProfilePicture();
    }
    vulWerkdagenDisplayEnEditForm();
}

/**
 * Automatically determines the status (VVD, VVM, VVO) based on working hours
 */
function updateSoortBasedOnTime(dagId, startValue, endValue, soortSelect) {
    // If both start and end are empty, it's VVD
    if (!startValue && !endValue) {
        soortSelect.value = 'VVD';
        return;
    }
    
    // If one is filled and the other empty, keep current value
    if ((!startValue && endValue) || (startValue && !endValue)) {
        return;
    }
    
    // Both have values, determine status based on time
    const startHour = parseInt(startValue.split(':')[0]);
    const endHour = parseInt(endValue.split(':')[0]);
    
    if (startHour >= 7 && startHour <= 9 && endHour <= 13) {
        // Morning work = VVM
        soortSelect.value = 'VVM';
    } else if (startHour >= 12 && startHour <= 13 && endHour >= 15 && endHour <= 17) {
        // Afternoon work = VVO
        soortSelect.value = 'VVO';
    } else {
        // Full day work = Werken
        soortSelect.value = 'Werken';
    }
    
    console.log(`[gInstellingen] Auto-updated ${dagId} status to: ${soortSelect.value} based on ${startValue} - ${endValue}`);
}

/**
 * Updates the uneditable display of the werkdagen as a table
 */
function vulWerkdagenDisplayEnEditForm() {
    // Get the table body for the display section
    const tableBody = document.getElementById('werkdagen-tabel-body');
    if (!tableBody) {
        console.error("[gInstellingen] Werkdagen tabel body niet gevonden");
        return;
    }
    
    // Clear the table body
    tableBody.innerHTML = '';
    
    const rooster = huidigeGebruikerInstellingen.urenPerWeekActueel;
    const geldigVanafElement = document.getElementById('rooster-geldig-vanaf');

    if (rooster) {
        DAGEN_VAN_DE_WEEK.forEach(dag => {
            const start = rooster[`${dag}Start`];
            const eind = rooster[`${dag}Eind`];
            const soort = rooster[`${dag}Soort`];
            
            const row = document.createElement('tr');
            
            // Day column
            const dayCell = document.createElement('td');
            dayCell.className = 'py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300';
            dayCell.textContent = dag;
            
            // Working hours column
            const timeCell = document.createElement('td');
            timeCell.className = 'py-2 px-3 text-sm text-gray-700 dark:text-gray-300';
            if (start && eind) {
                timeCell.textContent = `${start} - ${eind}`;
            } else {
                timeCell.textContent = 'Niet ingeroosterd';
                timeCell.className = 'py-2 px-3 text-sm text-gray-500 dark:text-gray-500';
            }
            
            // Status column
            const statusCell = document.createElement('td');
            statusCell.className = 'py-2 px-3 text-sm';
            
            if (soort && soort !== 'Werken') {
                statusCell.textContent = soort;
                
                // Add color based on the status
                if (soort === 'VVD') {
                    statusCell.className += ' text-blue-600 dark:text-blue-400 font-medium';
                } else if (soort === 'VVM') {
                    statusCell.className += ' text-orange-600 dark:text-orange-400 font-medium';
                } else if (soort === 'VVO') {
                    statusCell.className += ' text-green-600 dark:text-green-400 font-medium';
                } else {
                    statusCell.className += ' text-gray-700 dark:text-gray-300';
                }
            } else if (start && eind) {
                statusCell.textContent = 'Werken';
                statusCell.className += ' text-gray-700 dark:text-gray-300';
            } else {
                statusCell.textContent = '-';
                statusCell.className += ' text-gray-500 dark:text-gray-500';
            }
            
            row.appendChild(dayCell);
            row.appendChild(timeCell);
            row.appendChild(statusCell);
            tableBody.appendChild(row);
        });
        
        // Show the "geldig vanaf" date
        if (rooster.Ingangsdatum && geldigVanafElement) {
            geldigVanafElement.textContent = `Huidig rooster geldig vanaf: ${new Date(rooster.Ingangsdatum).toLocaleDateString('nl-NL')}`;
            geldigVanafElement.classList.remove('hidden');
        }
    } else {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 3;
        cell.className = 'py-2 px-3 text-sm text-gray-500 dark:text-gray-500';
        cell.textContent = 'Geen standaard werkrooster gevonden.';
        row.appendChild(cell);
        tableBody.appendChild(row);
        
        if (geldigVanafElement) {
            geldigVanafElement.classList.add('hidden');
        }
    }
    
    // Create or update work day edit inputs
    if (domInstellingenRefs.werkroosterInputRows) {
        domInstellingenRefs.werkroosterInputRows.innerHTML = ''; // Clear existing rows
        
        DAGEN_VAN_DE_WEEK.forEach(dag => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'werkrooster-edit-row grid grid-cols-4 gap-x-4 items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600';
            
            // Day label
            const dayLabelDiv = document.createElement('div');
            dayLabelDiv.className = 'dag-label text-sm';
            dayLabelDiv.textContent = dag;
            
            // Start time input
            const startDiv = document.createElement('div');
            const startInput = document.createElement('input');
            startInput.type = 'time';
            startInput.id = `${dag.toLowerCase()}-start`;
            startInput.name = `${dag.toLowerCase()}-start`;
            startInput.className = 'form-input w-full';
            startDiv.appendChild(startInput);
            
            // End time input
            const endDiv = document.createElement('div');
            const endInput = document.createElement('input');
            endInput.type = 'time';
            endInput.id = `${dag.toLowerCase()}-eind`;
            endInput.name = `${dag.toLowerCase()}-eind`;
            endInput.className = 'form-input w-full';
            endDiv.appendChild(endInput);
            
            // Status select
            const statusDiv = document.createElement('div');
            const statusSelect = document.createElement('select');
            statusSelect.id = `${dag.toLowerCase()}-soort`;
            statusSelect.name = `${dag.toLowerCase()}-soort`;
            statusSelect.className = 'form-select w-full';
            
            // Add options to select
            const defaultOption = document.createElement('option');
            defaultOption.value = 'Werken';
            defaultOption.textContent = 'Werken';
            statusSelect.appendChild(defaultOption);
            
            alleDagenIndicatorsData.forEach(indicator => {
                const option = document.createElement('option');
                option.value = indicator.Title;
                option.textContent = indicator.Beschrijving || indicator.Title;
                statusSelect.appendChild(option);
            });
            
            statusDiv.appendChild(statusSelect);
            
            // Append all elements to row
            rowDiv.appendChild(dayLabelDiv);
            rowDiv.appendChild(startDiv);
            rowDiv.appendChild(endDiv);
            rowDiv.appendChild(statusDiv);
            
            // Add row to container
            domInstellingenRefs.werkroosterInputRows.appendChild(rowDiv);
            
            // Set initial values if rooster exists
            if (rooster) {
                startInput.value = rooster[`${dag}Start`] || '';
                endInput.value = rooster[`${dag}Eind`] || '';
                statusSelect.value = rooster[`${dag}Soort`] || 'Werken';
            }
            
            // Add event listeners to auto-update status
            startInput.addEventListener('change', function() {
                updateSoortBasedOnTime(dag.toLowerCase(), this.value, endInput.value, statusSelect);
            });
            
            endInput.addEventListener('change', function() {
                updateSoortBasedOnTime(dag.toLowerCase(), startInput.value, this.value, statusSelect);
            });
        });
    }
    
    // Set default date for new schedule
    const morgen = new Date();
    morgen.setDate(morgen.getDate() + 1);
    if (domInstellingenRefs.werkroosterIngangsdatumInput) {
        domInstellingenRefs.werkroosterIngangsdatumInput.value = morgen.toISOString().split('T')[0];
    }
}

function vulRoosterInstellingenTab() {
    const inst = huidigeGebruikerInstellingen.gebruikersInstellingenSP;
    if (inst) {
        domInstellingenRefs.instThemaSelect.value = inst.soortWeergave || 'dark';
        domInstellingenRefs.instEigenTeamCheckbox.checked = inst.EigenTeamWeergeven || false;
        domInstellingenRefs.instWeekendenCheckbox.checked = (inst.WeekendenWeergeven === null || inst.WeekendenWeergeven === undefined) ? true : inst.WeekendenWeergeven;
    } else {
        domInstellingenRefs.instThemaSelect.value = 'dark';
        domInstellingenRefs.instEigenTeamCheckbox.checked = false;
        domInstellingenRefs.instWeekendenCheckbox.checked = true;
    }
}

async function handleInstellingenOpslaan(event) {
    event.preventDefault();
    toonInstellingenStatusBericht("Bezig met opslaan van instellingen...", "info", false);
    if(domInstellingenRefs.opslaanInstellingenButton) domInstellingenRefs.opslaanInstellingenButton.disabled = true;

    const nieuweInstellingen = {
        soortWeergave: domInstellingenRefs.instThemaSelect.value,
        EigenTeamWeergeven: domInstellingenRefs.instEigenTeamCheckbox.checked,
        WeekendenWeergeven: domInstellingenRefs.instWeekendenCheckbox.checked
    };

    try {
        const gebruikersInstConfigKey = "gebruikersInstellingen";
        // @ts-ignore
        const gebruikersInstConfig = getLijstConfig(gebruikersInstConfigKey);
        if (!gebruikersInstConfig) throw new Error(`Configuratie voor lijst '${gebruikersInstConfigKey}' niet gevonden.`);
        if (!huidigeGebruikerInstellingen.normalizedUsername) throw new Error("Gebruikers normalizedUsername is niet beschikbaar.");

        const listTitleForType = gebruikersInstConfig.lijstTitel;
        const typeName = listTitleForType.charAt(0).toUpperCase() + listTitleForType.slice(1).replace(/\s+/g, '_');

        const itemData = {
            __metadata: { "type": `SP.Data.${typeName}ListItem` },
            Title: huidigeGebruikerInstellingen.normalizedUsername,
            soortWeergave: nieuweInstellingen.soortWeergave,
            EigenTeamWeergeven: nieuweInstellingen.EigenTeamWeergeven,
            WeekendenWeergeven: nieuweInstellingen.WeekendenWeergeven
        };

        let itemBestaat = false;
        let bestaandItemId = null;

        if (huidigeGebruikerInstellingen.gebruikersInstellingenSP && huidigeGebruikerInstellingen.gebruikersInstellingenSP.ID) {
            itemBestaat = true;
            bestaandItemId = huidigeGebruikerInstellingen.gebruikersInstellingenSP.ID;
        } else {
            const filter = `$filter=Title eq '${huidigeGebruikerInstellingen.normalizedUsername}'`;
            const bestaandeItems = await haalInstellingenLijstItems(gebruikersInstConfigKey, "$select=ID", filter);
            if (bestaandeItems.length > 0) {
                itemBestaat = true;
                bestaandItemId = bestaandeItems[0].ID;
                huidigeGebruikerInstellingen.gebruikersInstellingenSP = {
                     ...(huidigeGebruikerInstellingen.gebruikersInstellingenSP || {}),
                     ID: bestaandItemId,
                     Title: huidigeGebruikerInstellingen.normalizedUsername
                };
            }
        }

        if (itemBestaat && bestaandItemId) {
            await updateInstellingenItem(gebruikersInstConfig.lijstId, bestaandItemId, itemData);
        } else {
            const nieuwItem = await createInstellingenItem(gebruikersInstConfig.lijstId, itemData);
            if (nieuwItem && nieuwItem.d) {
                 huidigeGebruikerInstellingen.gebruikersInstellingenSP = nieuwItem.d;
            } else {
                const filter = `$filter=Title eq '${huidigeGebruikerInstellingen.normalizedUsername}'`;
                const itemsNaCreate = await haalInstellingenLijstItems(gebruikersInstConfigKey, "$select=ID,Title,EigenTeamWeergeven,soortWeergave,WeekendenWeergeven", filter);
                if (itemsNaCreate.length > 0) huidigeGebruikerInstellingen.gebruikersInstellingenSP = itemsNaCreate[0];
            }
        }
        huidigeGebruikerInstellingen.gebruikersInstellingenSP = {
            ...huidigeGebruikerInstellingen.gebruikersInstellingenSP,
            soortWeergave: nieuweInstellingen.soortWeergave,
            EigenTeamWeergeven: nieuweInstellingen.EigenTeamWeergeven,
            WeekendenWeergeven: nieuweInstellingen.WeekendenWeergeven
        };

        toonInstellingenStatusBericht("Instellingen succesvol opgeslagen!", "success");
        pasThemaEnSlaOp(nieuweInstellingen.soortWeergave);

        if (window.opener && typeof window.opener.updateGebruikersInstellingen === 'function') {
            window.opener.updateGebruikersInstellingen(huidigeGebruikerInstellingen.gebruikersInstellingenSP);
        } else if (window.parent && window.parent !== window && typeof window.parent.updateGebruikersInstellingen === 'function') {
            window.parent.updateGebruikersInstellingen(huidigeGebruikerInstellingen.gebruikersInstellingenSP);
        }

    } catch (error) {
        console.error("[gInstellingen] Fout tijdens opslaan instellingen:", error);
        toonInstellingenStatusBericht(`Fout: ${error.message || "Kon instellingen niet opslaan."}`, "error", false);
    } finally {
        if(domInstellingenRefs.opslaanInstellingenButton) domInstellingenRefs.opslaanInstellingenButton.disabled = false;
    }
}

async function getInstellingenRequestDigest() {
    if (!spWebAbsoluteUrlInstellingen) throw new Error("Web absolute URL niet beschikbaar.");
    const apiUrl = `${spWebAbsoluteUrlInstellingen.replace(/\/$/, "")}/_api/contextinfo`;
    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Accept': 'application/json;odata=verbose' }});
    if (!response.ok) throw new Error("Kon Request Digest niet ophalen.");
    const data = await response.json();
    return data.d.GetContextWebInformation.FormDigestValue;
}

async function createInstellingenItem(lijstGuid, itemData) {
    const requestDigest = await getInstellingenRequestDigest();
    const apiUrl = `${spWebAbsoluteUrlInstellingen.replace(/\/$/, "")}/_api/web/lists(guid'${lijstGuid}')/items`;
    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Accept': 'application/json;odata=verbose', 'Content-Type': 'application/json;odata=verbose', 'X-RequestDigest': requestDigest }, body: JSON.stringify(itemData) });
    if (!response.ok && response.status !== 201) throw new Error(`Fout bij aanmaken item (${response.status})`);
    return response.status === 201 ? await response.json() : null;
}

async function updateInstellingenItem(lijstGuid, itemId, itemData) {
    const requestDigest = await getInstellingenRequestDigest();
    const apiUrl = `${spWebAbsoluteUrlInstellingen.replace(/\/$/, "")}/_api/web/lists(guid'${lijstGuid}')/items(${itemId})`;
    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Accept': 'application/json;odata=verbose', 'Content-Type': 'application/json;odata=verbose', 'X-RequestDigest': requestDigest, 'IF-MATCH': '*', 'X-HTTP-Method': 'MERGE' }, body: JSON.stringify(itemData) });
    if (response.status !== 204) throw new Error(`Fout bij bijwerken item (${response.status})`);
    return true;
}

function toonInstellingenStatusBericht(bericht, type = 'info', autoHide = true) {
    if (domInstellingenRefs.instellingenStatusBericht) {
        domInstellingenRefs.instellingenStatusBericht.innerHTML = bericht;
        domInstellingenRefs.instellingenStatusBericht.className = 'mt-4 p-3 text-sm rounded-lg border';
        switch (type) {
            case 'success': domInstellingenRefs.instellingenStatusBericht.classList.add('bg-green-100', 'border-green-400', 'text-green-700', 'dark:bg-green-700', 'dark:text-green-100', 'dark:border-green-600'); break;
            case 'error': domInstellingenRefs.instellingenStatusBericht.classList.add('bg-red-100', 'border-red-400', 'text-red-700', 'dark:bg-red-700', 'dark:text-red-100', 'dark:border-red-600'); break;
            default: domInstellingenRefs.instellingenStatusBericht.classList.add('bg-blue-100', 'border-blue-400', 'text-blue-700', 'dark:bg-blue-700', 'dark:text-blue-100', 'dark:border-blue-600'); break;
        }
        domInstellingenRefs.instellingenStatusBericht.classList.remove('hidden');
        if (autoHide) setTimeout(() => { if (domInstellingenRefs.instellingenStatusBericht) domInstellingenRefs.instellingenStatusBericht.classList.add('hidden'); }, 7000);
    }
}

function initializeTabs() {
    const urlParams = new URLSearchParams(window.location.search);
    const requestedTab = urlParams.get('tab') || 'persoonlijk';
    domInstellingenRefs.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            activateTab(tabId);
            const newUrl = `${window.location.pathname}?tab=${tabId}`;
            window.history.replaceState({path:newUrl},'',newUrl);
        });
    });
    activateTab(requestedTab);
}

function activateTab(tabId) {
    domInstellingenRefs.tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
    domInstellingenRefs.tabContents.forEach(content => content.classList.toggle('active', content.id === `tab-content-${tabId}`));
    console.log(`[gInstellingen] Tab geactiveerd: ${tabId}`);
}

// --- Werkrooster Edit Functies ---
function toggleWerkroosterEditModus(bewerken) {
    if (domInstellingenRefs.werkdagenDisplayContainer && domInstellingenRefs.werkroosterEditFormContainer && domInstellingenRefs.wijzigWerkroosterKnop) {
        if (bewerken) {
            domInstellingenRefs.werkdagenDisplayContainer.classList.add('hidden');
            domInstellingenRefs.werkroosterEditFormContainer.classList.remove('hidden');
            domInstellingenRefs.wijzigWerkroosterKnop.textContent = 'Annuleer Wijziging';
            domInstellingenRefs.wijzigWerkroosterKnop.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            domInstellingenRefs.wijzigWerkroosterKnop.classList.add('bg-gray-500', 'hover:bg-gray-600');
        } else {
            domInstellingenRefs.werkdagenDisplayContainer.classList.remove('hidden');
            domInstellingenRefs.werkroosterEditFormContainer.classList.add('hidden');
            domInstellingenRefs.wijzigWerkroosterKnop.textContent = 'Wijzig Werkrooster';
            domInstellingenRefs.wijzigWerkroosterKnop.classList.add('bg-blue-500', 'hover:bg-blue-600');
            domInstellingenRefs.wijzigWerkroosterKnop.classList.remove('bg-gray-500', 'hover:bg-gray-600');
            vulWerkdagenDisplayEnEditForm(); // Reset formulier bij annuleren
            if(domInstellingenRefs.werkroosterStatusBericht) domInstellingenRefs.werkroosterStatusBericht.classList.add('hidden');
        }
    } else {
        console.warn("[gInstellingen] Werkrooster DOM elementen niet gevonden voor toggle.");
    }
}

async function handleWerkroosterOpslaan() {
    console.log("[gInstellingen] Poging tot opslaan werkrooster...");
    toonWerkroosterStatus("Werkrooster opslaan...", "info", false);
    if(domInstellingenRefs.opslaanWerkroosterKnop) domInstellingenRefs.opslaanWerkroosterKnop.disabled = true;

    const ingangsdatumNieuw = domInstellingenRefs.werkroosterIngangsdatumInput.value;
    if (!ingangsdatumNieuw) {
        toonWerkroosterStatus("Ingangsdatum voor het nieuwe rooster is verplicht.", "error", false);
        if(domInstellingenRefs.opslaanWerkroosterKnop) domInstellingenRefs.opslaanWerkroosterKnop.disabled = false;
        return;
    }
    const nieuweIngangsdatumDate = new Date(ingangsdatumNieuw + "T00:00:00Z"); // Gebruik Z voor UTC

    // REMOVED: Date validation that checks if date is in the future

    const nieuwRoosterData = {
        Title: `Werkrooster ${huidigeGebruikerInstellingen.medewerkerData?.Naam || huidigeGebruikerInstellingen.Title} per ${nieuweIngangsdatumDate.toLocaleDateString('nl-NL')}`,
        MedewerkerID: huidigeGebruikerInstellingen.normalizedUsername,
        Ingangsdatum: nieuweIngangsdatumDate.toISOString(),
        VeranderingsDatum: null
    };

    let isFormulierValide = true;
    DAGEN_VAN_DE_WEEK.forEach(dag => {
        const startInput = document.getElementById(`${dag.toLowerCase()}-start`);
        const eindInput = document.getElementById(`${dag.toLowerCase()}-eind`);
        const soortSelect = document.getElementById(`${dag.toLowerCase()}-soort`);

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
        if(domInstellingenRefs.opslaanWerkroosterKnop) domInstellingenRefs.opslaanWerkroosterKnop.disabled = false;
        return;
    }

    try {
        // @ts-ignore
        const urenConfig = getLijstConfig("UrenPerWeek");
        if (!urenConfig) throw new Error("Configuratie voor UrenPerWeek lijst niet gevonden.");

        const listTitleForType = urenConfig.lijstTitel;
        const typeName = listTitleForType.charAt(0).toUpperCase() + listTitleForType.slice(1).replace(/\s+/g, '_');
        nieuwRoosterData.__metadata = { "type": `SP.Data.${typeName}ListItem` };


        // Zoek het huidige actieve rooster (geen VeranderingsDatum of VeranderingsDatum in de toekomst)
        // uit de reeds geladen historie.
        const huidigActiefRoosterItem = huidigeGebruikerInstellingen.alleUrenPerWeekHistorie.find(
            item => !item.VeranderingsDatum || new Date(item.VeranderingsDatum) > new Date()
        );


        if (huidigActiefRoosterItem && huidigActiefRoosterItem.ID) {
            const huidigActiefId = huidigActiefRoosterItem.ID;
            const veranderingsDatum = new Date(nieuweIngangsdatumDate);
            veranderingsDatum.setDate(veranderingsDatum.getDate() - 1); // Dag ervoor

            const updateData = {
                __metadata: { "type": `SP.Data.${typeName}ListItem` },
                VeranderingsDatum: veranderingsDatum.toISOString()
            };
            console.log(`[gInstellingen] Huidig werkrooster (ID: ${huidigActiefId}) bijwerken met VeranderingsDatum: ${veranderingsDatum.toISOString()}`);
            await updateInstellingenItem(urenConfig.lijstId, huidigActiefId, updateData);
        }

        console.log("[gInstellingen] Nieuw werkrooster item aanmaken:", nieuwRoosterData);
        const aangemaaktItem = await createInstellingenItem(urenConfig.lijstId, nieuwRoosterData);

        // Herlaad alle UrenPerWeek items om de lokale cache bij te werken
        toonInstellingenStatusBericht("Werkrooster data herladen...", "info", false);
        // @ts-ignore
        const alleItemsNaUpdate = await haalInstellingenLijstItems("UrenPerWeek", `$select=ID,Ingangsdatum,VeranderingsDatum,${DAGEN_VAN_DE_WEEK.map(d => `${d}Start,${d}Eind,${d}Soort`).join(',')}`, `$filter=MedewerkerID eq '${huidigeGebruikerInstellingen.normalizedUsername}'`, "", "$orderby=Ingangsdatum desc");
        huidigeGebruikerInstellingen.alleUrenPerWeekHistorie = alleItemsNaUpdate || [];
        huidigeGebruikerInstellingen.urenPerWeekActueel = (alleItemsNaUpdate || []).find(item => !item.VeranderingsDatum || new Date(item.VeranderingsDatum) > new Date()) || ((alleItemsNaUpdate.length > 0) ? alleItemsNaUpdate[0] : null);


        toonWerkroosterStatus("Nieuw werkrooster succesvol opgeslagen!", "success");
        toggleWerkroosterEditModus(false);
        vulWerkdagenDisplayEnEditForm();

    } catch (error) {
        console.error("[gInstellingen] Fout bij opslaan werkrooster:", error);
        toonWerkroosterStatus(`Fout bij opslaan werkrooster: ${error.message}`, "error", false);
    } finally {
        if(domInstellingenRefs.opslaanWerkroosterKnop) domInstellingenRefs.opslaanWerkroosterKnop.disabled = false;
    }
}

function toonWerkroosterStatus(bericht, type = 'info', autoHide = true) {
    if (domInstellingenRefs.werkroosterStatusBericht) {
        domInstellingenRefs.werkroosterStatusBericht.innerHTML = bericht;
        domInstellingenRefs.werkroosterStatusBericht.className = 'mt-4 p-3 text-sm rounded-lg border';
        switch (type) {
            case 'success': domInstellingenRefs.werkroosterStatusBericht.classList.add('bg-green-100', 'border-green-400', 'text-green-700', 'dark:bg-green-700', 'dark:text-green-100', 'dark:border-green-600'); break;
            case 'error': domInstellingenRefs.werkroosterStatusBericht.classList.add('bg-red-100', 'border-red-400', 'text-red-700', 'dark:bg-red-700', 'dark:text-red-100', 'dark:border-red-600'); break;
            default: domInstellingenRefs.werkroosterStatusBericht.classList.add('bg-blue-100', 'border-blue-400', 'text-blue-700', 'dark:bg-blue-700', 'dark:text-blue-100', 'dark:border-blue-600'); break;
        }
        domInstellingenRefs.werkroosterStatusBericht.classList.remove('hidden');
        if (autoHide) setTimeout(() => { if (domInstellingenRefs.werkroosterStatu