// Pages/JS/meldingMaken_logic.js

/**
 * Logica voor de meldingMaken.html pagina.
 */

let spWebAbsoluteUrlMelding = '';
let huidigeGebruikerMelding = { loginNaam: null, Id: null, Title: null, medewerkerData: null, normalizedUsername: null };

const domMeldingRefs = {
    appBody: document.body, // Toegevoegd voor thema
    form: document.getElementById('melding-form'),
    formTitle: document.getElementById('form-title'),
    formSubtitle: document.getElementById('form-subtitle'),
    meldingTypeInput: document.getElementById('melding-type'),
    medewerkerNaamInput: document.getElementById('medewerker-naam'),
    medewerkerTeamInput: document.getElementById('medewerker-team'),
    verlofVelden: document.getElementById('verlof-velden'),
    compensatieVelden: document.getElementById('compensatie-velden'),
    ziekVelden: document.getElementById('ziek-velden'),
    zittingvrijVelden: document.getElementById('zittingvrij-velden'),
    verlofRedenSelect: document.getElementById('verlof-reden'),
    startDatumInput: document.getElementById('start-datum'), 
    eindDatumInput: document.getElementById('eind-datum'),   
    annulerenButton: document.getElementById('annuleren-button'),
    indienenButton: document.getElementById('indienen-button'),
    statusBericht: document.getElementById('status-bericht'),
    currentYearSpan: document.getElementById('current-year'),
    compensatieStartDatumInput: document.getElementById('compensatie-start-datum'),
    compensatieEindDatumInput: document.getElementById('compensatie-eind-datum'),
    compensatieUrenTotaalInput: document.getElementById('compensatie-uren-totaal'),
    compensatieOmschrijving: document.getElementById('compensatie-omschrijving'),
    ziekStatusSelect: document.getElementById('ziek-status'),
    ziekStartDatumContainer: document.getElementById('ziek-start-datum-container'),
    ziekStartDatumInput: document.getElementById('ziek-start-datum'),
    zittingvrijStartDatumInput: document.getElementById('zittingvrij-start-datum'),
    zittingvrijEindDatumInput: document.getElementById('zittingvrij-eind-datum'),
    zittingvrijOpmerkingTextarea: document.getElementById('zittingvrij-opmerking')
};

// Functie om prefix te trimmen (hergebruik indien mogelijk, anders lokaal definiëren)
function trimLoginNaamPrefixMelding(loginNaam) {
    if (!loginNaam) return '';
    const prefixesToRemove = ["i:0#.w|", "c:0(.s|true|", "i:05.t|"];
    for (const prefix of prefixesToRemove) {
        if (loginNaam.toLowerCase().startsWith(prefix.toLowerCase())) {
            return loginNaam.substring(prefix.length);
        }
    }
    return loginNaam.startsWith('|') ? loginNaam.substring(1) : loginNaam;
}


async function initializeMeldingContext() {
    console.log("[MeldingMaken] Initialiseren context...");
    let contextSource = "onbekend";
    
    if (window.opener && window.opener.spWebAbsoluteUrl && window.opener.huidigeGebruiker) {
        spWebAbsoluteUrlMelding = window.opener.spWebAbsoluteUrl;
        huidigeGebruikerMelding = JSON.parse(JSON.stringify(window.opener.huidigeGebruiker));
        contextSource = "opener window";
    } else if (window.parent && window.parent !== window && window.parent.spWebAbsoluteUrl && window.parent.huidigeGebruiker) {
        spWebAbsoluteUrlMelding = window.parent.spWebAbsoluteUrl;
        huidigeGebruikerMelding = JSON.parse(JSON.stringify(window.parent.huidigeGebruiker));
        contextSource = "parent window";
    } else {
        contextSource = "API call";
        console.log("[MeldingMaken] Geen opener/parent context gevonden, context zelf ophalen...");
        try {
            // Gebruik de GEDEFINIEERDE_SITE_URL uit configLijst.js als die bestaat, anders relatief pad
            const baseUrl = typeof GEDEFINIEERDE_SITE_URL !== 'undefined' ? GEDEFINIEERDE_SITE_URL.replace(/\/$/, "") : ".."; // Fallback naar relatief pad
            
            const webResponse = await fetch(`${baseUrl}/_api/web?$select=Url`, { headers: { 'Accept': 'application/json;odata=verbose' } });
            if (!webResponse.ok) throw new Error('Kan web URL niet ophalen');
            const webData = await webResponse.json();
            spWebAbsoluteUrlMelding = webData.d.Url;
            if (!spWebAbsoluteUrlMelding.endsWith('/')) spWebAbsoluteUrlMelding += '/';


            const userResponse = await fetch(`${spWebAbsoluteUrlMelding}_api/web/currentuser?$select=LoginName,Title,Id,Email`, { headers: { 'Accept': 'application/json;odata=verbose' } });
            if (!userResponse.ok) throw new Error('Kan gebruiker info niet ophalen');
            const userData = await userResponse.json();
            huidigeGebruikerMelding.loginNaam = userData.d.LoginName;
            huidigeGebruikerMelding.Id = userData.d.Id;
            huidigeGebruikerMelding.Title = userData.d.Title;
            huidigeGebruikerMelding.Email = userData.d.Email;
        } catch (error) {
            console.error("[MeldingMaken] Kritische fout bij ophalen context:", error);
            toonStatusBericht("Kan geen verbinding maken met de server. Probeer later opnieuw.", "error", false);
            if(domMeldingRefs.indienenButton) domMeldingRefs.indienenButton.disabled = true;
            return false;
        }
    }
    // Zorg dat normalizedUsername altijd beschikbaar is
    huidigeGebruikerMelding.normalizedUsername = trimLoginNaamPrefixMelding(huidigeGebruikerMelding.loginNaam);
    console.log(`[MeldingMaken] Context succesvol verkregen via ${contextSource}. User:`, huidigeGebruikerMelding.normalizedUsername);
    
    if (huidigeGebruikerMelding.loginNaam && (!huidigeGebruikerMelding.medewerkerData || !huidigeGebruikerMelding.medewerkerData.Team)) {
        const medewerkersLijstConfig = getLijstConfig("Medewerkers");
        if (medewerkersLijstConfig && typeof window.getLijstItemsAlgemeen === 'function') { // Check of getLijstItemsAlgemeen bestaat
            const filterQuery = `$filter=Username eq '${escapeODataString(huidigeGebruikerMelding.normalizedUsername)}'`;
            const selectQuery = "$select=ID,Title,Username,Team,Actief,Naam";
            const gevondenMedewerkers = await window.getLijstItemsAlgemeen(medewerkersLijstConfig.lijstId, selectQuery, filterQuery);
            if (gevondenMedewerkers.length > 0) {
                huidigeGebruikerMelding.medewerkerData = gevondenMedewerkers[0];
            } else {
                 huidigeGebruikerMelding.medewerkerData = { Naam: huidigeGebruikerMelding.Title, Team: 'N.v.t.', Username: huidigeGebruikerMelding.normalizedUsername };
            }
        } else {
            console.warn("[MeldingMaken] getLijstItemsAlgemeen niet beschikbaar of Medewerkers config mist. Kan aanvullende medewerker data niet laden.");
            huidigeGebruikerMelding.medewerkerData = { Naam: huidigeGebruikerMelding.Title, Team: 'Configuratiefout', Username: huidigeGebruikerMelding.normalizedUsername };
        }
    }
    return true;
}

async function haalMeldingLijstItemsOp(lijstIdentifier, selectQuery = "", filterQuery = "", expandQuery = "", topQuery = 0) {
    if (!spWebAbsoluteUrlMelding) {
        console.error("[MeldingMaken] spWebAbsoluteUrlMelding is niet beschikbaar.");
        return [];
    }
    if (typeof window.getLijstItemsAlgemeen === 'function') {
        // Gebruik de globale functie als die bestaat (vanuit machtigingen.js op hoofdpagina)
        // Zorg dat de context (URL) correct is voor deze globale functie.
        // De globale functie gebruikt window.spWebAbsoluteUrl, dus we moeten zorgen dat die correct is voor de hoofdsite.
        // Echter, voor subpagina's is het veiliger om de URL expliciet mee te geven of een lokale variant te gebruiken.
        // Voor nu, aanname: window.getLijstItemsAlgemeen gebruikt de correcte context.
        // Dit kan een bron van fouten zijn als meldingMaken.html in een andere site context draait dan Verlofrooster.html
        // en de globale window.spWebAbsoluteUrl niet overeenkomt.
        // De initializeMeldingContext probeert dit op te vangen.
        return await window.getLijstItemsAlgemeen(lijstIdentifier, selectQuery, filterQuery, expandQuery, "", topQuery); // Geen orderby hier
    } else {
        // Fallback naar een lokale implementatie als de globale functie niet bestaat.
        console.warn("[MeldingMaken] Globale functie getLijstItemsAlgemeen niet gevonden, gebruik lokale fallback.");
        let apiUrlPath;
        if (/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/.test(lijstIdentifier)) {
            apiUrlPath = `/_api/web/lists(guid'${lijstIdentifier}')/items`;
        } else {
            apiUrlPath = `/_api/web/lists/getByTitle('${encodeURIComponent(lijstIdentifier)}')/items`;
        }
        let queryParams = [];
        if (selectQuery) queryParams.push(selectQuery);
        if (filterQuery) queryParams.push(filterQuery);
        if (expandQuery) queryParams.push(expandQuery);
        if (topQuery > 0) queryParams.push(`$top=${topQuery}`);
        const apiUrl = `${spWebAbsoluteUrlMelding.replace(/\/$/, "")}${apiUrlPath}${queryParams.length > 0 ? '?' + queryParams.join('&') : ''}`;
        try {
            const response = await fetch(apiUrl, { method: 'GET', headers: { 'Accept': 'application/json;odata=verbose' } });
            if (!response.ok) {
                const err = await response.json().catch(()=>({})); console.error(`Fout bij ophalen ${lijstIdentifier}: ${response.status}`, err); return [];
            }
            const data = await response.json(); return data.d.results;
        } catch (error) { console.error(`Uitzondering bij ophalen ${lijstIdentifier}:`, error); return []; }
    }
}

function updateFormulierVoorType(type) {
    document.querySelectorAll('.melding-specifiek').forEach(el => el.classList.add('hidden'));
    let titel = "Nieuwe Melding";
    let subtitel = "Vul de onderstaande gegevens in.";
    domMeldingRefs.form.querySelectorAll('input[required], select[required], textarea[required]').forEach(el => el.required = false);

    switch (type) {
        case 'verlof':
            domMeldingRefs.verlofVelden.classList.remove('hidden');
            titel = "Verlof Aanvragen";
            subtitel = "Dien hier uw verlofaanvraag in.";
            domMeldingRefs.startDatumInput.required = true;
            domMeldingRefs.eindDatumInput.required = true;
            domMeldingRefs.verlofRedenSelect.required = true;
            laadVerlofRedenen();
            break;
        case 'compensatie':
            domMeldingRefs.compensatieVelden.classList.remove('hidden');
            titel = "Compensatieuren Doorgeven";
            subtitel = "Geef hier uw compensatie-uren op.";
            domMeldingRefs.compensatieStartDatumInput.required = true;
            domMeldingRefs.compensatieEindDatumInput.required = true;
            domMeldingRefs.compensatieOmschrijving.required = true;
            break;
        case 'ziek':
            domMeldingRefs.ziekVelden.classList.remove('hidden');
            titel = "Ziek/Beter Melding";
            subtitel = "Meld u hier ziek of beter.";
            domMeldingRefs.ziekStatusSelect.required = true;
            domMeldingRefs.ziekStartDatumInput.valueAsDate = new Date(); 
            toggleZiekStartDatum();
            break;
        case 'zittingvrij':
            domMeldingRefs.zittingvrijVelden.classList.remove('hidden');
            titel = "Incidenteel Zittingvrij Aanvragen";
            subtitel = "Vraag hier incidenteel zittingvrij aan.";
            domMeldingRefs.zittingvrijStartDatumInput.required = true;
            domMeldingRefs.zittingvrijEindDatumInput.required = true;
            domMeldingRefs.zittingvrijOpmerkingTextarea.required = true;
            break;
        default:
            console.warn("[MeldingMaken] Onbekend meldingstype:", type);
            titel = "Onbekend Meldingstype";
            subtitel = "Selecteer een geldig type melding via de hoofdpagina.";
            if(domMeldingRefs.indienenButton) domMeldingRefs.indienenButton.disabled = true;
    }
    if(domMeldingRefs.formTitle) domMeldingRefs.formTitle.textContent = titel;
    if(domMeldingRefs.formSubtitle) domMeldingRefs.formSubtitle.textContent = subtitel;
    if(domMeldingRefs.meldingTypeInput) domMeldingRefs.meldingTypeInput.value = type;
    console.log(`[MeldingMaken] Formulier bijgewerkt voor type: ${type}`);
}

async function laadVerlofRedenen() {
    const verlofredenenConfig = getLijstConfig("Verlofredenen");
    if (!verlofredenenConfig) return;
    const redenen = await haalMeldingLijstItemsOp(verlofredenenConfig.lijstId, "$select=ID,Title,Naam", "", "$orderby=Title asc"); // orderby toegevoegd
    domMeldingRefs.verlofRedenSelect.innerHTML = '<option value="">Selecteer een reden...</option>'; 
    redenen.forEach(reden => {
        const option = document.createElement('option');
        option.value = reden.ID; 
        option.textContent = reden.Naam || reden.Title;
        domMeldingRefs.verlofRedenSelect.appendChild(option);
    });
}

function vulMedewerkerInfoIn() {
    if (huidigeGebruikerMelding && huidigeGebruikerMelding.medewerkerData) {
        domMeldingRefs.medewerkerNaamInput.value = huidigeGebruikerMelding.medewerkerData.Naam || huidigeGebruikerMelding.Title || 'Niet gevonden';
        domMeldingRefs.medewerkerTeamInput.value = huidigeGebruikerMelding.medewerkerData.Team || 'Niet gevonden';
    } else if (huidigeGebruikerMelding && huidigeGebruikerMelding.Title) {
         domMeldingRefs.medewerkerNaamInput.value = huidigeGebruikerMelding.Title;
         domMeldingRefs.medewerkerTeamInput.value = 'Team onbekend';
    } else {
        domMeldingRefs.medewerkerNaamInput.value = 'Laden mislukt...';
        domMeldingRefs.medewerkerTeamInput.value = 'Laden mislukt...';
    }
}

function berekenCompensatieUren() {
    const start = domMeldingRefs.compensatieStartDatumInput.value;
    const eind = domMeldingRefs.compensatieEindDatumInput.value;
    if (start && eind) {
        const startDate = new Date(start);
        const endDate = new Date(eind);
        if (endDate > startDate) {
            const diffMs = endDate - startDate;
            const diffUren = diffMs / (1000 * 60 * 60);
            domMeldingRefs.compensatieUrenTotaalInput.value = diffUren.toFixed(2) + " uur";
        } else {
            domMeldingRefs.compensatieUrenTotaalInput.value = "Ongeldige periode";
        }
    } else {
        domMeldingRefs.compensatieUrenTotaalInput.value = "";
    }
}

function toggleZiekStartDatum() {
    if (domMeldingRefs.ziekStatusSelect.value === 'ziek') {
        domMeldingRefs.ziekStartDatumContainer.classList.remove('hidden');
        domMeldingRefs.ziekStartDatumInput.required = true;
    } else { 
        domMeldingRefs.ziekStartDatumContainer.classList.add('hidden');
        domMeldingRefs.ziekStartDatumInput.required = false;
        domMeldingRefs.ziekStartDatumInput.value = '';
    }
}

function valideerFormulier() {
    const type = domMeldingRefs.meldingTypeInput.value;
    let isValid = domMeldingRefs.form.checkValidity(); 

    if (!isValid) {
        let firstInvalidField = domMeldingRefs.form.querySelector(':invalid');
        if (firstInvalidField) {
             toonStatusBericht(`Vul a.u.b. alle verplichte velden correct in. '${firstInvalidField.labels[0]?.textContent || firstInvalidField.name}' is ongeldig.`, "error", false);
             firstInvalidField.focus();
        } else {
            toonStatusBericht("Vul a.u.b. alle verplichte velden correct in.", "error", false);
        }
        return false;
    }
    domMeldingRefs.form.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500'));

    if (type === 'verlof') {
        const startDate = new Date(domMeldingRefs.startDatumInput.value);
        const endDate = new Date(domMeldingRefs.eindDatumInput.value);
        if (endDate < startDate) {
            toonStatusBericht("Einddatum mag niet voor startdatum liggen.", "error", false);
            domMeldingRefs.eindDatumInput.classList.add('border-red-500');
            domMeldingRefs.eindDatumInput.focus();
            isValid = false;
        }
    } else if (type === 'compensatie') {
        const startDate = new Date(domMeldingRefs.compensatieStartDatumInput.value);
        const endDate = new Date(domMeldingRefs.compensatieEindDatumInput.value);
         if (endDate <= startDate) {
            toonStatusBericht("Eindtijd compensatie moet na starttijd liggen.", "error", false);
            domMeldingRefs.compensatieEindDatumInput.classList.add('border-red-500');
            domMeldingRefs.compensatieEindDatumInput.focus();
            isValid = false;
        }
    }
    
    if (isValid && domMeldingRefs.statusBericht.classList.contains('bg-red-600')) { // Gebruik de juiste error class van Tailwind
        domMeldingRefs.statusBericht.classList.add('hidden'); 
    }
    return isValid;
}

async function handleFormSubmit(event) {
    event.preventDefault();
    console.log("[MeldingMaken] Formulier submit poging...");
    domMeldingRefs.indienenButton.disabled = true;
    domMeldingRefs.indienenButton.textContent = "Bezig met indienen...";
    toonStatusBericht("Bezig met verwerken...", "info", false); 

    if (!valideerFormulier()) {
        domMeldingRefs.indienenButton.disabled = false;
        domMeldingRefs.indienenButton.textContent = "Indienen";
        return;
    }

    const formData = new FormData(domMeldingRefs.form);
    const data = Object.fromEntries(formData.entries());
    const type = data.meldingType;

    let lijstNaamSP; // Gebruik de key uit configLijst.js
    let itemData = {
        Title: `Melding: ${type} - ${huidigeGebruikerMelding.medewerkerData?.Naam || huidigeGebruikerMelding.Title}`,
        Medewerker: huidigeGebruikerMelding.medewerkerData?.Naam || huidigeGebruikerMelding.Title,
        MedewerkerID: huidigeGebruikerMelding.loginNaam, // Volledige claims ID hier opslaan
        AanvraagTijdstip: new Date().toISOString()
    };

    try {
        switch (type) {
            case 'verlof':
                lijstNaamSP = "Verlof";
                itemData.StartDatum = new Date(data.startDatum).toISOString();
                itemData.EindDatum = new Date(data.eindDatum).toISOString();
                itemData.Reden = domMeldingRefs.verlofRedenSelect.options[domMeldingRefs.verlofRedenSelect.selectedIndex].text;
                itemData.RedenId = data.verlofReden;
                itemData.Omschrijving = data.verlofOmschrijving;
                itemData.Status = "Aangevraagd"; 
                break;
            case 'compensatie':
                lijstNaamSP = "CompensatieUren";
                itemData.StartCompensatieUren = new Date(data.compensatieStartDatum).toISOString();
                itemData.EindeCompensatieUren = new Date(data.compensatieEindDatum).toISOString();
                itemData.UrenTotaal = domMeldingRefs.compensatieUrenTotaalInput.value;
                itemData.Omschrijving = data.compensatieOmschrijving;
                itemData.Status = "Ingediend"; 
                break;
            case 'ziek':
                lijstNaamSP = "Verlof"; // Ziekte wordt ook in Verlof lijst opgeslagen
                itemData.Reden = data.ziekStatus === 'ziek' ? "Ziekte" : "Beter gemeld"; 
                const ziekRedenConfig = alleVerlofredenen.find(vr => vr.Title === itemData.Reden || vr.Naam === itemData.Reden);
                itemData.RedenId = ziekRedenConfig ? ziekRedenConfig.ID.toString() : null;
                itemData.Omschrijving = `Status: ${data.ziekStatus}. ${data.ziekOpmerking || ''}`.trim();
                itemData.Status = data.ziekStatus === 'ziek' ? "Ziek" : "Goedgekeurd"; 
                if (data.ziekStatus === 'ziek' && data.ziekStartDatum) {
                    itemData.StartDatum = new Date(data.ziekStartDatum).toISOString();
                    let eindDatumZiek = new Date(data.ziekStartDatum);
                    eindDatumZiek.setHours(23,59,59,999); 
                    itemData.EindDatum = eindDatumZiek.toISOString();
                } else if (data.ziekStatus === 'beter') {
                    itemData.StartDatum = new Date().toISOString(); 
                    itemData.EindDatum = new Date().toISOString();
                }
                if (!itemData.RedenId) console.warn(`[MeldingMaken] Kon RedenId niet vinden voor '${itemData.Reden}'.`);
                break;
            case 'zittingvrij':
                lijstNaamSP = "IncidenteelZittingVrij";
                itemData.ZittingsVrijeDagTijd = new Date(data.zittingvrijStartDatum).toISOString(); 
                itemData.ZittingsVrijeDagTijdEind = new Date(data.zittingvrijEindDatum).toISOString();
                itemData.Opmerking = data.zittingvrijOpmerking;
                itemData.Gebruikersnaam = huidigeGebruikerMelding.loginNaam; // Volledige claims ID
                itemData.Title = `Zittingvrij ${huidigeGebruikerMelding.medewerkerData?.Naam || huidigeGebruikerMelding.Title} ${new Date(data.zittingvrijStartDatum).toLocaleDateString()}`;
                break;
            default:
                throw new Error("Onbekend meldingstype voor opslaan.");
        }

        if (typeof window.createSPListItem !== 'function') {
            throw new Error("Fout: Functie voor item creatie is niet beschikbaar.");
        }
        const responseData = await window.createSPListItem(lijstNaamSP, itemData);
        console.log("[MeldingMaken] Item succesvol opgeslagen:", responseData);
        toonStatusBericht("Melding succesvol ingediend!", "success", false); 
        domMeldingRefs.form.reset(); 
        updateFormulierVoorType(type); 

        setTimeout(() => {
            const terugLink = "../Verlofrooster.html"; 
            toonStatusBericht(`Melding succesvol. U kunt dit venster sluiten of <a href="${terugLink}" class="font-bold hover:underline">terugkeren naar het rooster</a>.`, "success", false);
            if (window.opener || (window.parent && window.parent !== window && window.self !== window.top)) {
                if(window.opener && typeof window.opener.laadInitiëleData === 'function') { // Check of de functie bestaat
                    window.opener.laadInitiëleData(false); // false om volledige herlaad te triggeren
                } else if (window.parent && typeof window.parent.laadInitiëleData === 'function') {
                     window.parent.laadInitiëleData(false);
                }
            }
        }, 1000); // Kortere timeout voor snellere feedback

    } catch (error) {
        console.error("[MeldingMaken] Fout tijdens submit:", error);
        toonStatusBericht(`Fout: ${error.message || "Kon melding niet indienen."}`, "error", false);
    } finally {
        domMeldingRefs.indienenButton.disabled = false;
        domMeldingRefs.indienenButton.textContent = "Indienen";
    }
}

// getRequestDigestGlobally wordt nu verwacht vanuit machtigingen.js (window.getRequestDigestGlobally)

function toonStatusBericht(bericht, type = 'info', autoHide = true) {
    if (domMeldingRefs.statusBericht) {
        domMeldingRefs.statusBericht.innerHTML = bericht;
        domMeldingRefs.statusBericht.className = 'mt-6 p-4 text-sm rounded-lg'; 
        switch (type) {
            case 'success': domMeldingRefs.statusBericht.classList.add('bg-green-100', 'border', 'border-green-400', 'text-green-700', 'dark:bg-green-700', 'dark:text-green-100', 'dark:border-green-600'); break;
            case 'error': domMeldingRefs.statusBericht.classList.add('bg-red-100', 'border', 'border-red-400', 'text-red-700', 'dark:bg-red-700', 'dark:text-red-100', 'dark:border-red-600'); break;
            case 'info': default: domMeldingRefs.statusBericht.classList.add('bg-blue-100', 'border', 'border-blue-400', 'text-blue-700', 'dark:bg-blue-700', 'dark:text-blue-100', 'dark:border-blue-600'); break;
        }
        domMeldingRefs.statusBericht.classList.remove('hidden');
        if (autoHide) {
            setTimeout(() => {
                domMeldingRefs.statusBericht.classList.add('hidden');
            }, 7000); 
        }
    }
}

async function initializeMeldingMakenPagina() {
    console.log("[MeldingMaken] Initialiseren pagina...");
    if(domMeldingRefs.currentYearSpan) {
        domMeldingRefs.currentYearSpan.textContent = new Date().getFullYear();
    }

    // Pas thema toe op basis van localStorage of default van hoofdpagina
    const opgeslagenThema = localStorage.getItem('verlofroosterThema') || 
                         (window.opener && window.opener.gebruikersInstellingen ? window.opener.gebruikersInstellingen.soortWeergave : 
                         (window.parent && window.parent !== window && window.parent.gebruikersInstellingen ? window.parent.gebruikersInstellingen.soortWeergave : 'light'));
    
    if (domMeldingRefs.appBody) {
        domMeldingRefs.appBody.classList.remove('light-theme', 'dark-theme');
        domMeldingRefs.appBody.classList.add(opgeslagenThema === 'dark' ? 'dark-theme' : 'light-theme');
        console.log("[MeldingMaken] Thema ingesteld op:", opgeslagenThema);
    }


    const contextOK = await initializeMeldingContext();
    if (!contextOK) {
        toonStatusBericht("Kan gebruikersinformatie niet laden. Probeer de pagina te vernieuwen.", "error", false);
        return;
    }

    vulMedewerkerInfoIn();

    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'verlof'; 
    updateFormulierVoorType(type);

    if (domMeldingRefs.form) {
        domMeldingRefs.form.addEventListener('submit', handleFormSubmit);
    }
    if (domMeldingRefs.annulerenButton) {
        domMeldingRefs.annulerenButton.addEventListener('click', () => {
            if (window.opener || (window.parent && window.parent !== window && window.self !== window.top)) {
                window.close(); // Probeer te sluiten als popup/iframe
            } else {
                window.location.href = "../Verlofrooster.html"; // Fallback
            }
        });
    }

    if (domMeldingRefs.compensatieStartDatumInput && domMeldingRefs.compensatieEindDatumInput) {
        domMeldingRefs.compensatieStartDatumInput.addEventListener('change', berekenCompensatieUren);
        domMeldingRefs.compensatieEindDatumInput.addEventListener('change', berekenCompensatieUren);
    }
    if (domMeldingRefs.ziekStatusSelect) {
        domMeldingRefs.ziekStatusSelect.addEventListener('change', toggleZiekStartDatum);
    }

    console.log("[MeldingMaken] Pagina initialisatie voltooid.");
}

// Start de initialisatie wanneer de DOM en configLijst.js geladen zijn.
if (typeof getLijstConfig === 'function' && typeof sharepointLijstConfiguraties !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeMeldingMakenPagina);
} else {
    const configIntervalMelding = setInterval(() => {
        if (typeof getLijstConfig === 'function' && typeof sharepointLijstConfiguraties !== 'undefined') {
            clearInterval(configIntervalMelding);
            document.addEventListener('DOMContentLoaded', initializeMeldingMakenPagina);
        }
    }, 100);
    setTimeout(() => {
        if (typeof getLijstConfig !== 'function') {
            clearInterval(configIntervalMelding);
            console.error("[MeldingMaken] configLijst.js niet geladen. Pagina kan niet correct initialiseren.");
            if(domMeldingRefs.statusBericht) toonStatusBericht("Kritische fout: Configuratie ontbreekt.", "error", false);
        }
    }, 5000);
}

console.log("Pages/JS/meldingMaken_logic.js geladen.");
