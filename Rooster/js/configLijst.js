// js/configLijst.js

/**
 * Configuratiebestand voor SharePoint Lijstdefinities.
 * Dit object bevat de structuur en velden van de SharePoint-lijsten
 * die door de Verlofrooster applicatie worden gebruikt.
 * De interne namen ('interneNaam') zijn cruciaal voor REST API calls.
 */

// Globale variabelen
let spWebAbsoluteUrlBeheer = '';
let huidigeGebruikerBeheer = { loginNaam: null, Id: null, Title: null };


const sharepointLijstConfiguraties = {
  "CompensatieUren": {
    "lijstId": "91f54142-f439-4646-a9f8-ca4d96820e12",
    "lijstTitel": "CompensatieUren",
    "verborgen": false,
    "baseTemplate": 100,
    "velden": [
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" },
      { "titel": "Medewerker", "interneNaam": "Medewerker", "type": "Text" }, // Display Name of employee
      { "titel": "AanvraagTijdstip", "interneNaam": "AanvraagTijdstip", "type": "DateTime" },
      { "titel": "EindeCompensatieUren", "interneNaam": "EindeCompensatieUren", "type": "DateTime" },
      { "titel": "MedewerkerID", "interneNaam": "MedewerkerID", "type": "Text" }, // Username (login name) for linking
      { "titel": "Omschrijving", "interneNaam": "Omschrijving", "type": "Text" },
      { "titel": "StartCompensatieUren", "interneNaam": "StartCompensatieUren", "type": "DateTime" },
      { "titel": "Status", "interneNaam": "Status", "type": "Choice" },
      { "titel": "UrenTotaal", "interneNaam": "UrenTotaal", "type": "Text" }
    ]
  },
  "CompensatieUrenPerWeek": {
    "lijstId": "b05d42b9-91d4-4bc1-9782-e8ea9f630d01",
    "lijstTitel": "CompensatieUrenPerWeek", // Standaard werkrooster voor compensatie? Of afwijkend?
    "verborgen": false,
    "baseTemplate": 100,
    "velden": [
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" },
      { "titel": "MedewerkerID", "interneNaam": "MedewerkerID", "type": "Text" }, // Username
      { "titel": "Ingangsdatum", "interneNaam": "Ingangsdatum", "type": "DateTime" },
      { "titel": "VeranderingsDatum", "interneNaam": "VeranderingsDatum", "type": "DateTime" },
      { "titel": "MaandagStart", "interneNaam": "MaandagStart", "type": "Text" },
      { "titel": "MaandagEind", "interneNaam": "MaandagEind", "type": "Text" },
      { "titel": "MaandagSoort", "interneNaam": "MaandagSoort", "type": "Text" },
      { "titel": "MaandagTotaal", "interneNaam": "MaandagTotaal", "type": "Text" },
      { "titel": "DinsdagStart", "interneNaam": "DinsdagStart", "type": "Text" },
      { "titel": "DinsdagEind", "interneNaam": "DinsdagEind", "type": "Text" },
      { "titel": "DinsdagSoort", "interneNaam": "DinsdagSoort", "type": "Text" },
      { "titel": "DinsdagTotaal", "interneNaam": "DinsdagTotaal", "type": "Text" },
      { "titel": "WoensdagStart", "interneNaam": "WoensdagStart", "type": "Text" },
      { "titel": "WoensdagEind", "interneNaam": "WoensdagEind", "type": "Text" },
      { "titel": "WoensdagSoort", "interneNaam": "WoensdagSoort", "type": "Text" },
      { "titel": "WoensdagTotaal", "interneNaam": "WoensdagTotaal", "type": "Text" },
      { "titel": "DonderdagStart", "interneNaam": "DonderdagStart", "type": "Text" },
      { "titel": "DonderdagEind", "interneNaam": "DonderdagEind", "type": "Text" },
      { "titel": "DonderdagSoort", "interneNaam": "DonderdagSoort", "type": "Text" },
      { "titel": "DonderdagTotaal", "interneNaam": "DonderdagTotaal", "type": "Text" },
      { "titel": "VrijdagStart", "interneNaam": "VrijdagStart", "type": "Text" },
      { "titel": "VrijdagEind", "interneNaam": "VrijdagEind", "type": "Text" },
      { "titel": "VrijdagSoort", "interneNaam": "VrijdagSoort", "type": "Text" },
      { "titel": "VrijdagTotaal", "interneNaam": "VrijdagTotaal", "type": "Text" }
    ]
  },
  "DagenIndicators": {
    "lijstId": "45528ed2-cdff-4958-82e4-e3eb032fd0aa",
    "lijstTitel": "DagenIndicators",
    "verborgen": false,
    "baseTemplate": 100,
    "velden": [
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" }, // e.g., "VVD", "VVM", "VVO"
      { "titel": "Beschrijving", "interneNaam": "Beschrijving", "type": "Text" }, // e.g., "Vaste Vrije Dag"
      { "titel": "Kleur", "interneNaam": "Kleur", "type": "Text" }, // Hex code
      { "titel": "Patroon", "interneNaam": "Patroon", "type": "Choice" }, // Effen, Diagonaal, etc.
      { "titel": "Validatie", "interneNaam": "Validatie", "type": "Text" } // Rules for application
    ]
  },
  "gebruikersInstellingen": {
    "lijstId": "c83b6af8-fee3-4b3a-affd-b1ad6bddd513",
    "lijstTitel": "gebruikersInstellingen",
    "verborgen": false,
    "baseTemplate": 100,
    "velden": [
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" }, // Usually refers to MedewerkerID (Username)
      { "titel": "EigenTeamWeergeven", "interneNaam": "EigenTeamWeergeven", "type": "Boolean" },
      { "titel": "soortWeergave", "interneNaam": "soortWeergave", "type": "Text" }, // "dark", "light"
      { "titel": "WeekendenWeergeven", "interneNaam": "WeekendenWeergeven", "type": "Boolean" }
    ]
  },
  "keuzelijstFuncties": {
    "lijstId": "f33ffe6d-7237-4688-9ac9-8a72f402a92d",
    "lijstTitel": "keuzelijstFuncties",
    "verborgen": false,
    "baseTemplate": 100,
    "velden": [
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" } // Functienaam
    ]
  },
  "MeldFouten": { // Lijst voor het melden van fouten in de applicatie
    "lijstId": "548e618c-ded9-4eae-b6a2-bc38e87facda",
    "lijstTitel": "MeldFouten",
    "verborgen": false,
    "baseTemplate": 100,
    "velden": [
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" }, // Korte omschrijving/onderwerp fout
      { "titel": "Beschrijving fout", "interneNaam": "Beschrijving_x0020_fout", "type": "Note" }, // Uitgebreide beschrijving
      { "titel": "Status", "interneNaam": "Status", "type": "Choice" }, // Nieuw, In behandeling, Afgesloten
      { "titel": "WaarFout", "interneNaam": "WaarFout", "type": "Choice" }, // Waar in app? Registratie, Verlofaanvraag etc.
	  { "titel": "Reactie", "interneNaam": "Reactie", "type": "Note" } // Reactie op de feedback
    ]
  },
  "IncidenteelZittingVrij": {
    "lijstId": "be6841e2-f4c0-4485-93a6-14f2fb146742",
    "lijstTitel": "IncidenteelZittingVrij",
    "verborgen": false,
    "baseTemplate": 100,
    "velden": [
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" },
      { "titel": "Gebruikersnaam", "interneNaam": "Gebruikersnaam", "type": "Text" }, // Username (login name) e.g. i:0#.w|org\BusselW
      { "titel": "Opmerking", "interneNaam": "Opmerking", "type": "Note" },
      { "titel": "TerugkeerPatroon", "interneNaam": "TerugkeerPatroon", "type": "Choice" }, // Keuzes: Dagelijks, Wekelijks, Maandelijks
      { "titel": "Terugkerend", "interneNaam": "Terugkerend", "type": "Boolean" }, // Standaard: 0 (false)
      { "titel": "TerugkerendTot", "interneNaam": "TerugkerendTot", "type": "DateTime" },
      { "titel": "ZittingsVrijeDagTijdEind", "interneNaam": "ZittingsVrijeDagTijdEind", "type": "DateTime" },
      { "titel": "ZittingsVrijeDagTijdStart", "interneNaam": "ZittingsVrijeDagTijd", "type": "DateTime" } // Let op: interne naam 'ZittingsVrijeDagTijd' in document, titel is "ZittingsVrijeDagTijdStart"
    ]
  },
  "Medewerkers": {
    "lijstId": "835ae977-8cd1-4eb8-a787-23aa2d76228d",
    "lijstTitel": "Medewerkers",
    "verborgen": false,
    "baseTemplate": 100,
    "velden": [
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" }, // Vaak gebruikt voor een interne referentie of achternaam
      { "titel": "Geboortedatum", "interneNaam": "Geboortedatum", "type": "DateTime" },
      { "titel": "Actief", "interneNaam": "Actief", "type": "Boolean" },
      { "titel": "E-mail", "interneNaam": "E_x002d_mail", "type": "Text" },
      { "titel": "Functie", "interneNaam": "Functie", "type": "Text" }, // Gevuld vanuit keuzelijstFuncties
      { "titel": "HalveDagType", "interneNaam": "HalveDagType", "type": "Choice" }, // VVM, VVO
      { "titel": "HalveDagWeekdag", "interneNaam": "HalveDagWeekdag", "type": "Choice" }, // ma, di, wo, do, vr
      { "titel": "Horen", "interneNaam": "Horen", "type": "Boolean" },
      { "titel": "Naam", "interneNaam": "Naam", "type": "Text" }, // Volledige display naam
      { "titel": "Opmerking", "interneNaam": "Opmekring", "type": "Note" }, // Let op: 'Opmekring' in doc, waarschijnlijk 'Opmerking'
      { "titel": "OpmerkingGeldigTot", "interneNaam": "OpmerkingGeldigTot", "type": "DateTime" },
      { "titel": "Team", "interneNaam": "Team", "type": "Text" }, // Teamnaam, linkt naar Teams.Title
      { "titel": "UrenPerWeek", "interneNaam": "UrenPerWeek", "type": "Number" },
      { "titel": "Username", "interneNaam": "Username", "type": "Text" }, // Cruciaal: login naam (i:0#.w|domein\\user)
      { "titel": "Verbergen", "interneNaam": "Verbergen", "type": "Boolean" },
      { "titel": "Werkdagen", "interneNaam": "Werkdagen", "type": "Note" }, // Structuur? "MA,DI,WO,DO,VR" of JSON?
      { "titel": "Werkschema", "interneNaam": "Werkschema", "type": "Choice" } // fulltime, parttime-4 etc.
    ]
  },
  "gemachtigdenLijst": {
    "lijstId": "6bb90350-086d-41db-8123-26449e12743c",
    "lijstTitel": "gemachtigdenLijst",
    "verborgen": false,
    "baseTemplate": 100,
    "velden": [
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" }, // Beschrijvende naam van de machtigingsregel
      { "titel": "Gedeelte", "interneNaam": "Gedeelte", "type": "Text" }, // UI sectie (e.g., "BeheerHeader", "AdminInstellingen")
      { "titel": "Groepen", "interneNaam": "Groepen", "type": "MultiChoice" } // SharePoint groepsnamen
    ]
  },
  "Seniors": {
    "lijstId": "2e9b5974-7d69-4711-b9e6-f8db85f96f5f",
    "lijstTitel": "Seniors",
    "verborgen": false,
    "baseTemplate": 100,
    "velden": [
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" }, // Vaak Medewerker naam
      { "titel": "Medewerker", "interneNaam": "Medewerker", "type": "Text" }, // Display naam
      { "titel": "MedewerkerID", "interneNaam": "MedewerkerID", "type": "Text" }, // Username (login name)
      { "titel": "Team", "interneNaam": "Team", "type": "Text" }, // Teamnaam
      { "titel": "TeamID", "interneNaam": "TeamID", "type": "Text" } // ID of GUID van Team? Of teamnaam?
    ]
  },
  "statuslijstOpties": { // Opties voor Status velden in andere lijsten
    "lijstId": "8487d306-a05d-4eda-b5b7-86135066ab67",
    "lijstTitel": "statuslijstOpties",
    "verborgen": false,
    "baseTemplate": 100,
    "velden": [
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" } // e.g., "Nieuw", "Akkoord", "Afgewezen"
    ]
  },
  "Siteactiva": { // Site Assets / Siteactiva
    "lijstId": "a24258cc-f494-4c56-9b2f-689eadde27db", // Dit is een standaard Document Library GUID, kan varieren.
    "lijstTitel": "Siteactiva", // Of "Site Assets"
    "verborgen": false, // Kan verborgen zijn afhankelijk van site configuratie
    "baseTemplate": 101, // Document Library
    "velden": [
      // Standaard velden voor document bibliotheken
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Naam", "interneNaam": "FileLeafRef", "type": "File" }, // Bestandsnaam
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" } // Optionele titel
    ]
  },
  "Teams": {
    "lijstId": "dc2911c5-b0b7-4092-9c99-5fe957fdf6fc",
    "lijstTitel": "Teams",
    "verborgen": false,
    "baseTemplate": 100,
    "velden": [
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" },
      { "titel": "Naam", "interneNaam": "Naam", "type": "Text" },
      { "titel": "Actief", "interneNaam": "Actief", "type": "Boolean" },
      { "titel": "Kleur", "interneNaam": "Kleur", "type": "Text" }, // Hex kleurcode
      { "titel": "Teamleider", "interneNaam": "Teamleider", "type": "Text" }, // Display naam teamleider
      { "titel": "TeamleiderId", "interneNaam": "TeamleiderId", "type": "Text" } // Username teamleider
    ]
  },
  "UrenPerWeek": {
    "lijstId": "55bf75d8-d9e6-4614-8ac0-c3528bdb0ea8",
    "lijstTitel": "UrenPerWeek",
    "verborgen": false,
    "baseTemplate": 100,
    "velden": [
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" },
      { "titel": "MedewerkerID", "interneNaam": "MedewerkerID", "type": "Text" },
      { "titel": "Ingangsdatum", "interneNaam": "Ingangsdatum", "type": "DateTime" },
      { "titel": "VeranderingsDatum", "interneNaam": "VeranderingsDatum", "type": "DateTime" },
      { "titel": "MaandagStart", "interneNaam": "MaandagStart", "type": "Text" },
      { "titel": "MaandagEind", "interneNaam": "MaandagEind", "type": "Text" },
      { "titel": "MaandagSoort", "interneNaam": "MaandagSoort", "type": "Text" },
      { "titel": "MaandagTotaal", "interneNaam": "MaandagTotaal", "type": "Text" },
      { "titel": "DinsdagStart", "interneNaam": "DinsdagStart", "type": "Text" },
      { "titel": "DinsdagEind", "interneNaam": "DinsdagEind", "type": "Text" },
      { "titel": "DinsdagSoort", "interneNaam": "DinsdagSoort", "type": "Text" },
      { "titel": "DinsdagTotaal", "interneNaam": "DinsdagTotaal", "type": "Text" },
      { "titel": "WoensdagStart", "interneNaam": "WoensdagStart", "type": "Text" },
      { "titel": "WoensdagEind", "interneNaam": "WoensdagEind", "type": "Text" },
      { "titel": "WoensdagSoort", "interneNaam": "WoensdagSoort", "type": "Text" },
      { "titel": "WoensdagTotaal", "interneNaam": "WoensdagTotaal", "type": "Text" },
      { "titel": "DonderdagStart", "interneNaam": "DonderdagStart", "type": "Text" },
      { "titel": "DonderdagEind", "interneNaam": "DonderdagEind", "type": "Text" },
      { "titel": "DonderdagSoort", "interneNaam": "DonderdagSoort", "type": "Text" },
      { "titel": "DonderdagTotaal", "interneNaam": "DonderdagTotaal", "type": "Text" },
      { "titel": "VrijdagStart", "interneNaam": "VrijdagStart", "type": "Text" },
      { "titel": "VrijdagEind", "interneNaam": "VrijdagEind", "type": "Text" },
      { "titel": "VrijdagSoort", "interneNaam": "VrijdagSoort", "type": "Text" },
      { "titel": "VrijdagTotaal", "interneNaam": "VrijdagTotaal", "type": "Text" }
    ]
  },
  "Verlofredenen": {
    "lijstId": "6ca65cc0-ad60-49c9-9ee4-371249e55c7d",
    "lijstTitel": "Verlofredenen",
    "verborgen": false,
    "baseTemplate": 100,
    "velden": [
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" }, // e.g., "Vakantie", "Ziekte" (leidend voor dropdowns)
      { "titel": "Naam", "interneNaam": "Naam", "type": "Text" }, // Uitgebreidere naam, voor legenda
      { "titel": "Kleur", "interneNaam": "Kleur", "type": "Text" }, // Hex kleurcode
      { "titel": "VerlofDag", "interneNaam": "VerlofDag", "type": "Boolean" } // Telt dit als een dag die van saldo afgaat?
    ]
  },
  "Verlof": {
    "lijstId": "e12a068f-2821-4fe1-b898-e42e1418edf8",
    "lijstTitel": "Verlof",
    "verborgen": false,
    "baseTemplate": 100,
    "velden": [
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" }, // e.g., "Verlofaanvraag [Medewerker]"
      { "titel": "Medewerker", "interneNaam": "Medewerker", "type": "Text" }, // Display naam
      { "titel": "AanvraagTijdstip", "interneNaam": "AanvraagTijdstip", "type": "DateTime" },
      { "titel": "EindDatum", "interneNaam": "EindDatum", "type": "DateTime" },
      { "titel": "HerinneringDatum", "interneNaam": "HerinneringDatum", "type": "DateTime" },
      { "titel": "HerinneringStatus", "interneNaam": "HerinneringStatus", "type": "Choice" },
      { "titel": "MedewerkerID", "interneNaam": "MedewerkerID", "type": "Text" }, // Username (login name)
      { "titel": "Omschrijving", "interneNaam": "Omschrijving", "type": "Text" },
      { "titel": "OpmerkingBehandelaar", "interneNaam": "OpmerkingBehandelaar", "type": "Note" },
      { "titel": "Reden", "interneNaam": "Reden", "type": "Text" }, // Gekoppeld aan Verlofredenen.Title
      { "titel": "RedenId", "interneNaam": "RedenId", "type": "Text" }, // Gekoppeld aan Verlofredenen.ID (Lookup in SP)
      { "titel": "StartDatum", "interneNaam": "StartDatum", "type": "DateTime" },
      { "titel": "Status", "interneNaam": "Status", "type": "Text" } // Gekoppeld aan statuslijstOpties.Title
    ]
  },
  "FoutenLogboek": { // Zoals gespecificeerd in de "Rules.docx"
    "lijstId": "9f437af9-7063-4446-8f37-ea61ff74343f",
    "lijstTitel": "FoutenLogboek",
    "verborgen": false,
    "baseTemplate": 100,
    "velden": [
        { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
        { "titel": "Titel", "interneNaam": "Title", "type": "Text" },
        { "titel": "Behandelplan", "interneNaam": "Behandelplan", "type": "Text" },
        { "titel": "FoutBeschrijving", "interneNaam": "FoutBeschrijving", "type": "Text" },
        { "titel": "FoutCode", "interneNaam": "FoutCode", "type": "Text" }
    ]
  },
  "ZittingsVrijOpmaak": {
    "lijstId": "21c40ee8-7ee9-4b26-a300-9a47507561ff",
    "lijstTitel": "ZittingsVrijOpmaak",
    "verborgen": false,
    "baseTemplate": 100, // Standaard lijst type
    "velden": [
      { "titel": "Id", "interneNaam": "ID", "type": "Counter" },
      { "titel": "Titel", "interneNaam": "Title", "type": "Text" },
      { "titel": "Kleurcode", "interneNaam": "Kleurcode", "type": "Text" },
      { "titel": "SoortCategorie", "interneNaam": "SoortCategorie", "type": "Text" } // Field that categories this theme
    ]
  }
};

/**
 * Functie om een specifieke lijstconfiguratie op te halen.
 * @param {string} lijstNaam - De naam van de lijst zoals gedefinieerd in sharepointLijstConfiguraties.
 * @returns {object|null} De configuratie van de lijst of null als niet gevonden.
 */
function getLijstConfig(lijstNaam) {
  if (sharepointLijstConfiguraties[lijstNaam]) {
    return sharepointLijstConfiguraties[lijstNaam];
  } else {
    console.error(`[ConfigLijst] Lijst configuratie voor "${lijstNaam}" niet gevonden.`);
    return null;
  }
}

// Log dat het script geladen is.
console.log("js/configLijst.js geladen.");

// Voorbeeld van gebruik (kan in andere scripts):
// const medewerkersConfig = getLijstConfig("Medewerkers");
// if (medewerkersConfig) {
//   console.log("Medewerkers Lijst ID:", medewerkersConfig.lijstId);
// }
