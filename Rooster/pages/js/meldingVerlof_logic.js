// Bestand: pages/js/meldingVerlof_logic.js
// Dit bestand bevat de logica voor het aanmaken en beheren van meldingen met betrekking tot verlof en ziekte.

// Globale variabelen voor de modal en formulier elementen
let huidigeMeldingType = null; // 'verlofAanvraag', 'ziekMelding', 'beterMelding'
let huidigeGebruikerContext = null; // Wordt ingesteld door de modal opener
let lijstVerlofItems = []; // Cache voor verlof items van de gebruiker
let lijstZiekteItems = []; // Cache voor ziekte items van de gebruiker

// Configuratie voor de verschillende meldingstypes
const meldingConfig = {
    verlofAanvraag: {
        titel: "Verlof Aanvragen",
        submitKnopTekst: "Verlof Aanvragen",
        formulierVelden: [
            // CORRECTIE: 'naam' moet overeenkomen met de ID's in meldingVerlof.aspx
            { naam: "StartDatePicker", label: "Startdatum Verlof:", type: "date", vereist: true },
            { naam: "EndDatePicker", label: "Einddatum Verlof:", type: "date", vereist: true },
            // { naam: "Reden", label: "Soort Verlof:", type: "select", optiesRef: "Verlofredenen", vereist: true }, // VERWIJDERD
            { naam: "Omschrijving", label: "Opmerking (optioneel):", type: "textarea" }
            // TimePickers worden apart opgehaald in handleVerlofModalFormSubmit
        ],
        lijstNaam: "Verlof", // Key voor getLijstConfig
        dataMapping: (data, gebruiker) => {
            const functieNaam = "dataMappingVerlofAanvraag";
            console.log(`[${functieNaam}] Ontvangen data voor mapping:`, JSON.parse(JSON.stringify(data)));
            console.log(`[${functieNaam}] Ontvangen gebruiker voor mapping:`, JSON.parse(JSON.stringify(gebruiker)));

            const normalizedUsernameForTitle = gebruiker.gebruikersnaam || "OnbekendeGebruiker";
            const startDateObject = data.StartDatePickerISO ? new Date(data.StartDatePickerISO) : null;
            const startDateForTitle = startDateObject ? startDateObject.toLocaleDateString('nl-NL', { timeZone: 'UTC' }) : "DatumOnbekend";
            
            const medewerkerIDString = gebruiker.gebruikersnaam ? String(gebruiker.gebruikersnaam) : "";
            
            // Reden en RedenId worden nu standaard ingesteld
            const standaardRedenTekst = "Verlof/vakantie";
            const standaardRedenId = "2"; // Aanname gebaseerd op eerdere info

            const displayNameVoorTitel = gebruiker.displayName || normalizedUsernameForTitle;

            const payload = {
                Title: `Verlofaanvraag ${displayNameVoorTitel} - ${startDateForTitle}`,
                Medewerker: String(gebruiker.displayName || ""),
                StartDatum: data.StartDatePickerISO,
                EindDatum: data.EndDatePickerISO,
                Reden: standaardRedenTekst, // Standaard waarde
                Status: "Aangevraagd",
                Omschrijving: String(data.Omschrijving || ""),
                MedewerkerID: medewerkerIDString,
                RedenId: standaardRedenId, // Standaard waarde
                AanvraagTijdstip: new Date().toISOString()
            };
            console.log(`[${functieNaam}] Te verzenden payload naar SharePoint:`, JSON.parse(JSON.stringify(payload)));
            return payload;
        }
    },
    ziekMelding: {
        titel: "Ziek Melden",
        submitKnopTekst: "Ziek Melden",
        formulierVelden: [
            { naam: "startDatumZiek", label: "Startdatum Ziekte:", type: "date", vereist: true, standaardVandaag: true },
            { naam: "verwachteEindDatum", label: "Verwachte Einddatum (optioneel):", type: "date" },
            { naam: "opmerkingZiek", label: "Opmerking (optioneel):", type: "textarea" }
        ],
        lijstNaam: "Ziek-Beter",
        dataMapping: (data, gebruiker) => {
            const userPrincipalNameForSP = gebruiker.loginNaam || gebruiker.gebruikersnaam || "Onbekend";
            const medewerkerIdentifier = gebruiker.gebruikersnaam ? String(gebruiker.gebruikersnaam) : (gebruiker.id ? String(gebruiker.id) : "");

            const startDateZiekObject = data.startDatumZiekISO ? new Date(data.startDatumZiekISO) : null;
            const startDateZiekForTitle = startDateZiekObject ? startDateZiekObject.toLocaleDateString('nl-NL', { timeZone: 'UTC' }) : "DatumOnbekend";

            // Voor ziekte, RedenId is "1"
            const ziekteRedenId = "1";

            return {
                Title: `${gebruiker.displayName || 'Onbekend'} - Ziek - ${startDateZiekForTitle}`,
                MedewerkerID: medewerkerIdentifier, 
                Startdatum_x0020_ziekte: data.startDatumZiekISO,
                Verwachte_x0020_einddatum: data.verwachteEindDatumISO || null,
                Opmerking: String(data.opmerkingZiek || ""),
                Status: "Ziek",
                Soort_x0020_melding: "Ziek",
                Username: userPrincipalNameForSP,
                Reden: "Ziekte", // Vaste reden voor ziekmelding
                RedenId: ziekteRedenId // Vaste RedenId voor ziekmelding
            };
        }
    },
    beterMelding: {
        titel: "Beter Melden",
        submitKnopTekst: "Beter Melden",
        formulierVelden: [
            { naam: "eindDatumZiek", label: "Datum Beter Gemeld:", type: "date", vereist: true, standaardVandaag: true },
            { naam: "opmerkingBeter", label: "Opmerking (optioneel):", type: "textarea" }
        ],
        lijstNaam: "Ziek-Beter",
    },
};

async function initializeVerlofZiekMeldingModal(type, gebruiker) {
    const functieNaam = "initializeVerlofZiekMeldingModal";
    console.log(`[${functieNaam}] Initialiseren van modal voor type: ${type}, Gebruiker:`, gebruiker);
    huidigeMeldingType = type;
    huidigeGebruikerContext = gebruiker;

    if (!huidigeGebruikerContext || typeof huidigeGebruikerContext.id === 'undefined') {
        console.error(`[${functieNaam}] Gebruikerscontext (vooral ID) is niet (volledig) beschikbaar. Kan modal niet correct initialiseren. Context:`, huidigeGebruikerContext);
        const modalNotificationArea = document.getElementById('modal-notification-area');
        if (modalNotificationArea) {
            modalNotificationArea.textContent = "Fout: Gebruikersinformatie kon niet worden geladen (ontbrekend ID).";
            modalNotificationArea.className = "mb-4 p-3 rounded-md text-sm bg-red-100 border border-red-300 text-red-700 dark:bg-red-800 dark:text-red-200 dark:border-red-600";
            modalNotificationArea.classList.remove('hidden');
        }
        return;
    }
    const config = meldingConfig[type];
    if (!config) {
        console.error(`[${functieNaam}] Geen configuratie gevonden voor meldingstype: ${type}`);
        return;
    }

    if (type === 'beterMelding') {
        console.log(`[${functieNaam}] Beter melden modal wordt geconfigureerd.`);
    }
    console.log(`[${functieNaam}] Modal context succesvol ingesteld voor type: ${type}`);
}

async function laadSelectOpties(lijstNaamDeReferentie) {
    // Deze functie is nu alleen relevant als andere modals het nog gebruiken.
    // Voor verlofAanvraag is het niet meer nodig.
    const functieNaam = "laadSelectOpties";
    console.log(`[${functieNaam}] Laden van select opties voor lijst key: ${lijstNaamDeReferentie}`);

    if (huidigeMeldingType === 'verlofAanvraag' && lijstNaamDeReferentie === 'Verlofredenen') {
        console.log(`[${functieNaam}] Verlofredenen dropdown niet meer nodig voor verlofAanvraag. Overslaan.`);
        return []; // Return lege array om verdere verwerking te stoppen
    }

    if (typeof window.getLijstItemsAlgemeen !== 'function') {
        console.error(`[${functieNaam}] Functie getLijstItemsAlgemeen niet gevonden. Kan select opties niet laden.`);
        return [];
    }

    try {
        const selectQuery = "$select=ID,Title,Naam";
        const items = await window.getLijstItemsAlgemeen(lijstNaamDeReferentie, selectQuery);

        console.log(`[${functieNaam}] Opties geladen voor ${lijstNaamDeReferentie}:`, items);
        if (!items || items.length === 0) {
            console.warn(`[${functieNaam}] Geen items gevonden voor ${lijstNaamDeReferentie}.`);
        }
        return items.map(item => ({ Id: item.ID, Title: item.Title || item.Naam, Naam: item.Naam || item.Title }));
    } catch (error) {
        console.error(`[${functieNaam}] Fout bij het ophalen van lijst items voor ${lijstNaamDeReferentie}:`, error);
        throw error;
    }
}

function valideerFormulier() {
    const functieNaam = "valideerFormulier";
    const formulier = document.getElementById('verlof-form');
    const config = meldingConfig[huidigeMeldingType];
    let isGeldig = true;
    const data = {};

    const algemeenFoutVeld = document.getElementById('modal-notification-area');
    if (algemeenFoutVeld) {
        algemeenFoutVeld.textContent = '';
        algemeenFoutVeld.className = 'mb-4 p-3 rounded-md text-sm hidden';
    }

    if (!formulier || !config) {
        console.error(`[${functieNaam}] Formulier of configuratie niet gevonden voor validatie.`);
        // ... (error handling)
        return null;
    }

    config.formulierVelden.forEach(veld => {
        const foutElement = formulier.querySelector(`#${veld.naam}-fout`);
        if (foutElement) foutElement.classList.add('hidden');
    });

    if (huidigeMeldingType === 'beterMelding') {
        // ... (beterMelding validatie)
    }

    for (const veld of config.formulierVelden) {
        const inputElement = formulier.querySelector(`#${veld.naam}`);
        const foutElement = formulier.querySelector(`#${veld.naam}-fout`);

        if (!inputElement) {
            console.warn(`[${functieNaam}] Input element met ID '${veld.naam}' niet gevonden.`);
            if(veld.vereist) isGeldig = false;
            continue;
        }

        const waarde = inputElement.value;
        data[veld.naam] = waarde;
        
        // De 'Reden' dropdown is verwijderd, dus geen 'RedenTekst' meer nodig hier.
        // dataMapping zorgt voor de standaard "Verlof/vakantie".

        if (veld.vereist && !waarde) {
            isGeldig = false;
            if (foutElement) {
                foutElement.textContent = `${veld.label.replace(':', '')} is een verplicht veld.`;
                foutElement.classList.remove('hidden');
            }
        } else if (veld.type === "date" && waarde) {
            if (isNaN(new Date(waarde).getTime())) {
                isGeldig = false;
                if (foutElement) {
                    foutElement.textContent = `Ongeldige datum voor ${veld.label.replace(':', '')}.`;
                    foutElement.classList.remove('hidden');
                }
            }
        }
    }

    if (huidigeMeldingType === 'verlofAanvraag') {
        const startDatumValue = data.StartDatePicker;
        const eindDatumValue = data.EndDatePicker;
        const startTimeInput = formulier.querySelector('#StartTimePicker');
        const endTimeInput = formulier.querySelector('#EndTimePicker');
        
        const startTijd = startTimeInput ? startTimeInput.value : "00:00";
        const eindTijd = endTimeInput ? endTimeInput.value : "00:00";

        if (!startTimeInput) console.warn(`[${functieNaam}] StartTimePicker element niet gevonden.`);
        if (!endTimeInput) console.warn(`[${functieNaam}] EndTimePicker element niet gevonden.`);

        if (startDatumValue && eindDatumValue && startTijd && eindTijd) {
            const start = new Date(`${startDatumValue}T${startTijd}`);
            const eind = new Date(`${eindDatumValue}T${eindTijd}`);

            if (start > eind) {
                isGeldig = false;
                const foutElementStart = formulier.querySelector('#StartDatePicker-fout');
                const bericht = "Startdatum/-tijd kan niet na einddatum/-tijd liggen.";
                if (foutElementStart) {
                    foutElementStart.textContent = bericht;
                    foutElementStart.classList.remove('hidden');
                } else if (algemeenFoutVeld) {
                    // ... (algemeen foutveld handling)
                }
            }
        }
    }

    if (!isGeldig) {
        console.warn(`[${functieNaam}] Formulier validatie mislukt.`);
        // ... (algemeen foutveld handling)
        return null;
    }
    // Nu bevat 'data' alleen StartDatePicker, EndDatePicker, Omschrijving
    console.log(`[${functieNaam}] Formulier succesvol gevalideerd. Data:`, JSON.parse(JSON.stringify(data)));
    return data;
}

async function handleVerlofModalFormSubmit() {
    const functieNaam = "handleVerlofModalFormSubmit";
    const formulier = document.getElementById('verlof-form');
    console.log(`[${functieNaam}] Formulier submit actie gestart voor type: ${huidigeMeldingType}`);
    const gevalideerdeData = valideerFormulier(); // Bevat nu keys zoals StartDatePicker, EndDatePicker, Omschrijving

    if (!gevalideerdeData) {
        console.warn(`[${functieNaam}] Submit gestopt wegens validatiefouten.`);
        return false; 
    }
    // gevalideerdeData bevat nu { StartDatePicker: "YYYY-MM-DD", EndDatePicker: "YYYY-MM-DD", Omschrijving: "..." }
    // De Reden (verlofSoort) en RedenTekst worden niet meer uit het formulier gehaald.
    console.log(`[${functieNaam}] Gevalideerde data voor verdere verwerking:`, JSON.parse(JSON.stringify(gevalideerdeData)));

    const config = meldingConfig[huidigeMeldingType];
    const actieKnop = document.getElementById('modal-action-button');
    // ... (rest van de submit knop logica)

    try {
        if (!huidigeGebruikerContext || !huidigeGebruikerContext.id) {
            throw new Error("Gebruikersinformatie is niet correct geladen voor het opslaan van de melding.");
        }

        // Maak een kopie om de ISO datums toe te voegen voor dataMapping
        const dataVoorMapping = { ...gevalideerdeData }; 

        // --- StartDatum Processing ---
        let finalStartDatumISO = null;
        const rawStartDateString = dataVoorMapping.StartDatePicker; 
        const startTimeInput = formulier.querySelector('#StartTimePicker');
        const rawStartTimeString = startTimeInput && startTimeInput.value ? startTimeInput.value : '00:00';

        if (rawStartDateString && rawStartDateString.trim() !== "" && rawStartTimeString && rawStartTimeString.trim() !== "") {
            const combinedStartString = `${rawStartDateString}T${rawStartTimeString}:00`;
            const startDateObj = new Date(combinedStartString);
            if (!isNaN(startDateObj.getTime())) {
                finalStartDatumISO = startDateObj.toISOString();
            } else {
                console.warn(`[${functieNaam}] Ongeldige datum/tijd combinatie voor start: ${combinedStartString}`);
            }
        } else {
            console.warn(`[${functieNaam}] StartDatePicker ('${rawStartDateString}') of StartTijd ('${rawStartTimeString}') input/value ontbreekt/is ongeldig.`);
        }
        dataVoorMapping.StartDatePickerISO = finalStartDatumISO; // Gebruik deze voor dataMapping

        // --- EindDatum Processing ---
        let finalEindDatumISO = null;
        const rawEindDatumString = dataVoorMapping.EndDatePicker; 
        const endTimeInput = formulier.querySelector('#EndTimePicker');
        const rawEindTimeString = endTimeInput && endTimeInput.value ? endTimeInput.value : '23:59';

        if (rawEindDatumString && rawEindDatumString.trim() !== "" && rawEindTimeString && rawEindTimeString.trim() !== "") {
            const combinedEindString = `${rawEindDatumString}T${rawEindTimeString}:59`;
            const eindDateObj = new Date(combinedEindString);
            if (!isNaN(eindDateObj.getTime())) {
                finalEindDatumISO = eindDateObj.toISOString();
            } else {
                console.warn(`[${functieNaam}] Ongeldige datum/tijd combinatie voor eind: ${combinedEindString}`);
            }
        } else {
            console.warn(`[${functieNaam}] EndDatePicker ('${rawEindDatumString}') of EindTijd ('${rawEindTimeString}') input/value ontbreekt/is ongeldig.`);
        }
        dataVoorMapping.EndDatePickerISO = finalEindDatumISO; // Gebruik deze voor dataMapping
        
        // Voor ziekMelding en beterMelding, de datum conversie logica blijft vergelijkbaar.
        if (dataVoorMapping.startDatumZiek) {
             dataVoorMapping.startDatumZiekISO = dataVoorMapping.startDatumZiek ? new Date(dataVoorMapping.startDatumZiek).toISOString() : null;
        }
        if (dataVoorMapping.verwachteEindDatum) {
             dataVoorMapping.verwachteEindDatumISO = dataVoorMapping.verwachteEindDatum ? new Date(dataVoorMapping.verwachteEindDatum).toISOString() : null;
        }
        if (dataVoorMapping.eindDatumZiek && huidigeMeldingType === 'beterMelding') {
            dataVoorMapping.eindDatumZiekISO = dataVoorMapping.eindDatumZiek ? new Date(dataVoorMapping.eindDatumZiek).toISOString() : null;
        }


        if (huidigeMeldingType === 'verlofAanvraag' && (!dataVoorMapping.StartDatePickerISO || !dataVoorMapping.EndDatePickerISO)) {
            throw new Error("Start- en/of einddatum is ongeldig of niet ingevuld. Controleer de datum- en tijdvelden.");
        }
        
        // De 'Reden' en 'RedenId' worden nu direct in dataMapping.verlofAanvraag gezet.
        // 'dataVoorMapping' hoeft geen 'Reden' of 'RedenTekst' meer te bevatten voor de 'verlofAanvraag' case.
        // De 'dataMapping' functie zal de standaardwaarden gebruiken.

        if (huidigeMeldingType === 'beterMelding') {
            // ... (beterMelding logica)
        } else {
            const teVerzendenData = config.dataMapping(dataVoorMapping, huidigeGebruikerContext);
            console.log(`[${functieNaam}] Poging tot aanmaken nieuw item in lijst ${config.lijstNaam}. Data na mapping:`, JSON.parse(JSON.stringify(teVerzendenData)));

            if (typeof window.createSPListItem === 'function') {
                await window.createSPListItem(config.lijstNaam, teVerzendenData);
                console.log(`[${functieNaam}] Nieuw item succesvol aangemaakt in lijst ${config.lijstNaam}.`);
            } else {
                throw new Error("Functie createSPListItem niet gevonden.");
            }
        }
        // ... (succes en error handling)
        return true;

    } catch (error) {
        // ... (error handling)
        return false;
    } finally {
        // ... (finally block)
    }
}

window.initializeVerlofZiekMeldingModal = initializeVerlofZiekMeldingModal;
window.handleVerlofModalFormSubmit = handleVerlofModalFormSubmit;
window.laadSelectOpties = laadSelectOpties;

document.addEventListener('DOMContentLoaded', () => {
    console.log("[meldingVerlof_logic] DOM volledig geladen. MeldingVerlof_logic.js is klaar.");
});
