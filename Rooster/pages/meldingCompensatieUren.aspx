<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compensatie-uren Indienen</title>
    <link rel="stylesheet" href="../css/verlofrooster_styles.css">
    <link rel="stylesheet" href="../css/profielKaart.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        /* Basis stijlen, geïnspireerd door TailwindCSS utility classes */
        body {
            font-family: 'Roboto', 'Inter', sans-serif; /* Roboto toegevoegd als primair lettertype */
            margin: 0;
            padding: 0;
            background-color: #f9fafb; /* gray-50 */
            color: #1f2937; /* gray-800 */
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }
        .app-header {
            background-color: #ffffff; /* white */
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); /* shadow-md */
            padding: 1rem; /* p-4 */
            margin-bottom: 1.5rem; /* mb-6 */
        }
        .app-header h1 {
            font-size: 1.25rem; /* text-xl */
            font-weight: bold;
            color: #1f2937; /* gray-800 */
        }
        .form-container {
            display: flex;
            justify-content: center;
            align-items: flex-start; 
            flex-grow: 1;
            padding: 1rem; /* p-4 */
            width: 100%;
        }
        .compensatie-form { /* Aangepaste class naam */
            background: #ffffff; /* white */
            border-radius: 0.5rem; /* rounded-lg */
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-lg */
            width: 100%;
            max-width: 600px; /* max-w-2xl */
            padding: 1.5rem; /* p-6 */
            border: 1px solid #e5e7eb; /* border border-gray-200 */
        }
        .form-header {
            margin-bottom: 1.5rem; /* mb-6 */
            padding-bottom: 1rem; /* pb-4 */
            border-bottom: 1px solid #e5e7eb; /* border-b border-gray-200 */
        }
        .form-title {
            font-size: 1.25rem; /* text-xl */
            font-weight: 600; /* font-semibold */
            color: #111827; /* gray-900 */
            margin: 0;
        }
        .back-link {
            color: #3b82f6; /* text-blue-500 */
            text-decoration: none;
            font-size: 0.875rem; /* text-sm */
            display: inline-block;
            margin-top: 0.25rem; /* mt-1 */
        }
        .back-link:hover {
            text-decoration: underline;
            color: #2563eb; /* text-blue-600 */
        }
        .form-group {
            margin-bottom: 1rem; /* mb-4 */
        }
        .form-row {
            display: grid;
            grid-template-columns: repeat(1, minmax(0, 1fr)); /* default to 1 column */
            gap: 1rem; /* gap-4 */
        }
        @media (min-width: 640px) { /* sm breakpoint */
            .form-row {
                grid-template-columns: repeat(2, minmax(0, 1fr)); /* 2 columns on sm and up */
            }
        }
        .form-label {
            display: block;
            font-size: 0.875rem; /* text-sm */
            font-weight: 500; /* font-medium */
            margin-bottom: 0.25rem; /* mb-1 */
            color: #374151; /* text-gray-700 */
        }
        .required:after {
            content: " *";
            color: #ef4444; /* text-red-500 */
        }
        .form-input, .form-select, .form-textarea {
            width: 100%;
            padding: 0.5rem 0.75rem; /* py-2 px-3 */
            border: 1px solid #d1d5db; /* border-gray-300 */
            border-radius: 0.375rem; /* rounded-md */
            font-size: 0.875rem; /* text-sm */
            box-sizing: border-box;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
            font-family: inherit; /* Zorgt ervoor dat formulierelementen het body lettertype overnemen */
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
            outline: none;
            border-color: #3b82f6; /* focus:border-blue-500 */
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); /* focus:ring focus:ring-blue-200 focus:ring-opacity-50 */
        }
        .form-input[readonly] {
            background-color: #f3f4f6; /* bg-gray-100 */
            color: #6b7280; /* text-gray-500 */
            cursor: not-allowed;
        }
        .form-textarea {
            resize: vertical;
            min-height: 100px;
        }
        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem; /* gap-2 */
            margin-top: 1.5rem; /* mt-6 */
            padding-top: 1.5rem; /* pt-6 */
            border-top: 1px solid #e5e7eb; /* border-t border-gray-200 */
        }
        .btn {
            padding: 0.5rem 1rem; /* py-2 px-4 */
            border-radius: 0.375rem; /* rounded-md */
            font-size: 0.875rem; /* text-sm */
            font-weight: 500; /* font-medium */
            cursor: pointer;
            border: none;
            transition: background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
            font-family: inherit; /* Knoppen ook het body lettertype */
        }
        .btn:hover {
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); /* shadow-md */
        }
        .btn-primary {
            background-color: #3b82f6; /* bg-blue-500 */
            color: white;
        }
        .btn-primary:hover {
            background-color: #2563eb; /* hover:bg-blue-600 */
        }
        .btn-primary:disabled {
            background-color: #93c5fd; /* bg-blue-300 */
            cursor: not-allowed;
        }
        .btn-secondary {
            background-color: #e5e7eb; /* bg-gray-200 */
            color: #4b5563; /* text-gray-600 */
            border: 1px solid #d1d5db; /* border border-gray-300 */
        }
        .btn-secondary:hover {
            background-color: #d1d5db; /* hover:bg-gray-300 */
        }

        /* Dark mode styles */
        body.dark-mode {
            background-color: #111827; /* dark:bg-gray-900 */
            color: #f3f4f6; /* dark:text-gray-100 */
        }
        body.dark-mode .app-header {
            background-color: #1f2937; /* dark:bg-gray-800 */
            box-shadow: 0 1px 3px 0 rgba(0,0,0,0.3), 0 1px 2px 0 rgba(0,0,0,0.2);
        }
        body.dark-mode .app-header h1 {
             color: #f3f4f6; /* dark:text-gray-100 */
        }
        body.dark-mode .compensatie-form { /* Aangepaste class naam */
            background-color: #1f2937; /* dark:bg-gray-800 */
            border-color: #374151; /* dark:border-gray-700 */
        }
        body.dark-mode .form-header {
            border-bottom-color: #374151; /* dark:border-gray-700 */
        }
        body.dark-mode .form-title {
            color: #f9fafb; /* dark:text-gray-50 */
        }
        body.dark-mode .back-link {
            color: #60a5fa; /* dark:text-blue-400 */
        }
        body.dark-mode .back-link:hover {
            color: #3b82f6; /* dark:text-blue-500 */
        }
        body.dark-mode .form-label {
            color: #d1d5db; /* dark:text-gray-300 */
        }
        body.dark-mode .form-input,
        body.dark-mode .form-select,
        body.dark-mode .form-textarea {
            background-color: #374151; /* dark:bg-gray-700 */
            border-color: #4b5563; /* dark:border-gray-600 */
            color: #f3f4f6; /* dark:text-gray-100 */
        }
        body.dark-mode .form-input::placeholder,
        body.dark-mode .form-textarea::placeholder {
            color: #6b7280; /* dark:text-gray-500 */
        }
        body.dark-mode .form-input:focus,
        body.dark-mode .form-select:focus,
        body.dark-mode .form-textarea:focus {
            border-color: #60a5fa; /* dark:focus:border-blue-400 */
            box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3); /* dark:focus:ring-blue-400 dark:focus:ring-opacity-30 */
        }
        body.dark-mode .form-input[readonly] {
            background-color: #4b5563; /* dark:bg-gray-600 */
            color: #9ca3af; /* dark:text-gray-400 */
        }
        body.dark-mode .form-actions {
            border-top-color: #374151; /* dark:border-gray-700 */
        }
        body.dark-mode .btn-primary {
            background-color: #3b82f6; /* dark:bg-blue-500 */
        }
        body.dark-mode .btn-primary:hover {
            background-color: #2563eb; /* dark:hover:bg-blue-600 */
        }
        body.dark-mode .btn-primary:disabled {
            background-color: #1e40af; /* dark:bg-blue-800 */
        }
        body.dark-mode .btn-secondary {
            background-color: #374151; /* dark:bg-gray-700 */
            color: #d1d5db; /* dark:text-gray-300 */
            border-color: #4b5563; /* dark:border-gray-600 */
        }
        body.dark-mode .btn-secondary:hover {
            background-color: #4b5563; /* dark:hover:bg-gray-600 */
        }

        /* Notification Area */
        .notification-area {
            padding: 0.75rem 1rem; /* py-3 px-4 */
            margin-bottom: 1rem; /* mb-4 */
            border-radius: 0.375rem; /* rounded-md */
            font-size: 0.875rem; /* text-sm */
            border-width: 1px;
            border-style: solid;
        }
        .notification-success {
            background-color: #d1fae5; /* bg-green-100 */
            border-color: #6ee7b7; /* border-green-300 */
            color: #065f46; /* text-green-800 */
        }
        body.dark-mode .notification-success {
            background-color: #052e16; /* dark:bg-green-900 */
            border-color: #10b981; /* dark:border-green-500 */
            color: #a7f3d0; /* dark:text-green-200 */
        }
        .notification-error {
            background-color: #fee2e2; /* bg-red-100 */
            border-color: #fca5a5; /* border-red-300 */
            color: #991b1b; /* text-red-800 */
        }
        body.dark-mode .notification-error {
            background-color: #450a0a; /* dark:bg-red-900 */
            border-color: #ef4444; /* dark:border-red-500 */
            color: #fecaca; /* dark:text-red-200 */
        }
        .notification-info {
            background-color: #e0f2fe; /* bg-sky-100 */
            border-color: #7dd3fc; /* border-sky-300 */
            color: #075985; /* text-sky-800 */
        }
        body.dark-mode .notification-info {
            background-color: #0c4a6e; /* dark:bg-sky-900 */
            border-color: #38bdf8; /* dark:border-sky-500 */
            color: #bae6fd; /* dark:text-sky-200 */
        }
        .hidden {
            display: none !important;
        }
    </style>
</head>
<body>
    <header class="app-header">
        <h1>Verlofrooster</h1>
    </header>

    <div class="form-container">
        <form id="compensatie-form" class="compensatie-form">
            <input type="hidden" id="Title" name="Title">
            <input type="hidden" id="MedewerkerID" name="MedewerkerID">
            <input type="hidden" id="AanvraagTijdstip" name="AanvraagTijdstip">
            <input type="hidden" id="Status" name="Status" value="Ingediend">
            <input type="hidden" id="StartCompensatieUrenISO" name="StartCompensatieUrenISO">
            <input type="hidden" id="EindeCompensatieUrenISO" name="EindeCompensatieUrenISO">


            <div class="form-header">
                <h2 class="form-title">Compensatie-uren Indienen</h2>
                <a href="../verlofRooster.aspx" class="back-link" title="Terug naar het volledige verlofrooster">← Terug naar rooster</a>
            </div>

            <div id="notification-area" class="notification-area hidden" role="alert">
                </div>

            <div class="form-group">
                <label for="MedewerkerDisplay" class="form-label">Medewerker</label>
                <input type="text" id="MedewerkerDisplay" name="MedewerkerDisplay" class="form-input" readonly title="Uw naam zoals bekend in het systeem.">
            </div>

            <fieldset class="form-group border border-gray-300 dark:border-gray-600 p-4 rounded-md">
                <legend class="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Start Compensatie</legend>
                <div class="form-row mt-2">
                    <div class="form-group">
                        <label for="StartCompensatieDatum" class="form-label required">Startdatum</label>
                        <input type="date" id="StartCompensatieDatum" name="StartCompensatieDatum" class="form-input" required title="Selecteer de startdatum van de compensatie.">
                    </div>
                    <div class="form-group">
                        <label for="StartCompensatieTijd" class="form-label required">Starttijd</label>
                        <input type="time" id="StartCompensatieTijd" name="StartCompensatieTijd" class="form-input" value="09:00" required title="Selecteer de starttijd van de compensatie.">
                    </div>
                </div>
            </fieldset>

            <fieldset class="form-group border border-gray-300 dark:border-gray-600 p-4 rounded-md">
                <legend class="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Einde Compensatie</legend>
                <div class="form-row mt-2">
                    <div class="form-group">
                        <label for="EindeCompensatieDatum" class="form-label required">Einddatum</label>
                        <input type="date" id="EindeCompensatieDatum" name="EindeCompensatieDatum" class="form-input" required title="Selecteer de einddatum van de compensatie.">
                    </div>
                    <div class="form-group">
                        <label for="EindeCompensatieTijd" class="form-label required">Eindtijd</label>
                        <input type="time" id="EindeCompensatieTijd" name="EindeCompensatieTijd" class="form-input" value="17:00" required title="Selecteer de eindtijd van de compensatie.">
                    </div>
                </div>
            </fieldset>
            
            <div class="form-group">
                <label for="UrenTotaal" class="form-label">Totaal Uren</label>
                <input type="text" id="UrenTotaal" name="UrenTotaal" class="form-input" readonly title="Wordt automatisch berekend.">
            </div>

            <div class="form-group">
                <label for="Omschrijving" class="form-label required">Omschrijving</label>
                <textarea id="Omschrijving" name="Omschrijving" class="form-textarea" required placeholder="Geef een duidelijke omschrijving (bijv. project, reden van overwerk)." title="Geef een duidelijke omschrijving voor deze compensatie-uren."></textarea>
            </div>

            <div class="form-actions">
                <a href="../verlofRooster.aspx" class="btn btn-secondary">Annuleren</a>
                <button type="submit" id="submit-button" class="btn btn-primary">Dien Compensatie In</button>
            </div>
        </form>
    </div>

    <script src="../js/configLijst.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Globale variabelen voor deze pagina
            const spWebAbsoluteUrl = "https://som.org.om.local/sites/MulderT/CustomPW/Verlof";

            let currentUserLoginName = "";
            let currentUserDisplayName = "";
            let currentUserNormalizedLoginName = "";

            // DOM Elementen
            const form = document.getElementById('compensatie-form');
            const notificationArea = document.getElementById('notification-area');
            const submitButton = document.getElementById('submit-button');

            const medewerkerDisplayInput = document.getElementById('MedewerkerDisplay');
            const medewerkerIdInput = document.getElementById('MedewerkerID');
            const titleInput = document.getElementById('Title');
            const aanvraagTijdstipInput = document.getElementById('AanvraagTijdstip');

            const startCompensatieDatumInput = document.getElementById('StartCompensatieDatum');
            const startCompensatieTijdInput = document.getElementById('StartCompensatieTijd');
            const eindeCompensatieDatumInput = document.getElementById('EindeCompensatieDatum');
            const eindeCompensatieTijdInput = document.getElementById('EindeCompensatieTijd');
            
            const startCompensatieUrenISOInput = document.getElementById('StartCompensatieUrenISO'); // Verborgen
            const eindeCompensatieUrenISOInput = document.getElementById('EindeCompensatieUrenISO'); // Verborgen

            const urenTotaalInput = document.getElementById('UrenTotaal');
            const omschrijvingTextarea = document.getElementById('Omschrijving');
            const statusInput = document.getElementById('Status');

            /**
             * Utility functie om SharePoint claims prefix van loginnaam te verwijderen.
             */
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

            /**
             * Haalt een X-RequestDigest op.
             */
            async function getRequestDigest() {
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
             * Toont een notificatie bericht.
             */
            function toonNotificatie(bericht, type = 'info', autoHideDelay = 7000) {
                console.log(`[Notificatie] Type: ${type}, Bericht: ${bericht}`);
                notificationArea.textContent = bericht;
                notificationArea.className = 'notification-area'; // Reset classes
                notificationArea.classList.add(`notification-${type}`);
                notificationArea.classList.remove('hidden');

                if (notificationArea.timeoutId) clearTimeout(notificationArea.timeoutId);
                if (autoHideDelay !== false) {
                    notificationArea.timeoutId = setTimeout(() => {
                        notificationArea.classList.add('hidden');
                    }, autoHideDelay);
                }
            }

            /**
             * Initialiseert gebruikersinformatie en thema.
             */
            async function initializeGebruikersInfoEnThema() {
                console.log("Start initialisatie gebruikersinfo en thema voor compensatieformulier.");
                console.log("Gebruikte SharePoint Web Absolute URL:", spWebAbsoluteUrl);

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
                    console.log(`Huidige gebruiker: ${currentUserDisplayName} (Genormaliseerd: ${currentUserNormalizedLoginName})`);

                    medewerkerDisplayInput.value = currentUserDisplayName;
                    medewerkerIdInput.value = currentUserNormalizedLoginName;

                    const today = new Date();
                    const dateStr = today.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    titleInput.value = `Compensatie ${currentUserDisplayName} - ${dateStr}`;
                    aanvraagTijdstipInput.value = today.toISOString();

                    // Pas thema toe
                    const instellingenCfg = getLijstConfig('gebruikersInstellingen');
                    if (instellingenCfg && instellingenCfg.lijstId) {
                        const themeApiUrl = `${spWebAbsoluteUrl}/_api/web/lists(guid'${instellingenCfg.lijstId}')/items?$filter=Title eq '${encodeURIComponent(currentUserNormalizedLoginName)}'&$select=soortWeergave`;
                        const themeResponse = await fetch(themeApiUrl, { headers: { 'Accept': 'application/json;odata=verbose' } });
                        if (themeResponse.ok) {
                            const themeData = await themeResponse.json();
                            if (themeData.d.results.length > 0 && themeData.d.results[0].soortWeergave === 'dark') {
                                document.body.classList.add('dark-mode');
                            } else {
                                document.body.classList.remove('dark-mode');
                            }
                        } else { document.body.classList.remove('dark-mode'); }
                    } else { document.body.classList.remove('dark-mode'); }
                } catch (error) {
                    console.error('Fout bij ophalen gebruikersdata of thema:', error);
                    toonNotificatie('Kon gebruikersinformatie of thema niet laden.', 'error');
                    medewerkerDisplayInput.value = 'Gebruiker (fout)';
                    document.body.classList.remove('dark-mode');
                }
            }
            
            /**
             * Berekent het totaal aantal uren tussen start- en eindtijd.
             */
            function berekenUrenTotaal() {
                const startDatumValue = startCompensatieDatumInput.value;
                const startTijdValue = startCompensatieTijdInput.value;
                const eindDatumValue = eindeCompensatieDatumInput.value;
                const eindTijdValue = eindeCompensatieTijdInput.value;

                if (startDatumValue && startTijdValue && eindDatumValue && eindTijdValue) {
                    const startDatumTijd = new Date(`${startDatumValue}T${startTijdValue}`);
                    const eindDatumTijd = new Date(`${eindDatumValue}T${eindTijdValue}`);

                    if (!isNaN(startDatumTijd.getTime()) && !isNaN(eindDatumTijd.getTime()) && eindDatumTijd > startDatumTijd) {
                        const verschilInMs = eindDatumTijd - startDatumTijd;
                        const verschilInUren = verschilInMs / (1000 * 60 * 60);
                        urenTotaalInput.value = verschilInUren.toFixed(2) + " uur";
                    } else {
                        urenTotaalInput.value = "Ongeldige periode";
                    }
                } else {
                    urenTotaalInput.value = "";
                }
            }

            /**
             * Valideert het formulier.
             */
            function valideerFormulier() {
                if (!startCompensatieDatumInput.value || !startCompensatieTijdInput.value || 
                    !eindeCompensatieDatumInput.value || !eindeCompensatieTijdInput.value || 
                    !omschrijvingTextarea.value) {
                    toonNotificatie('Vul alle verplichte velden (*) in.', 'error');
                    return false;
                }
                const startDatumTijd = new Date(`${startCompensatieDatumInput.value}T${startCompensatieTijdInput.value}`);
                const eindDatumTijd = new Date(`${eindeCompensatieDatumInput.value}T${eindeCompensatieTijdInput.value}`);

                if (isNaN(startDatumTijd.getTime()) || isNaN(eindDatumTijd.getTime())) {
                    toonNotificatie('Ongeldige datum of tijd ingevoerd.', 'error');
                    return false;
                }
                if (eindDatumTijd <= startDatumTijd) {
                    toonNotificatie('De einddatum en -tijd moeten na de startdatum en -tijd liggen.', 'error');
                    return false;
                }
                return true;
            }

            /**
             * Verwerkt het verzenden van het formulier.
             */
            async function handleFormulierVerzenden(e) {
                e.preventDefault();
                console.log("Compensatie formulierverwerking gestart...");
                submitButton.disabled = true;
                submitButton.textContent = 'Bezig met indienen...';
                toonNotificatie('Bezig met indienen van uw compensatie...', 'info', false);

                if (!valideerFormulier()) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Dien Compensatie In';
                    return;
                }
                
                // Update aanvraagtijdstip en titel
                aanvraagTijdstipInput.value = new Date().toISOString();
                const startDatumVoorTitel = new Date(`${startCompensatieDatumInput.value}T${startCompensatieTijdInput.value}`);
                const dateStr = startDatumVoorTitel.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
                titleInput.value = `Compensatie ${currentUserDisplayName} - ${dateStr}`;

                // Combineer datum en tijd naar ISO strings voor SharePoint
                const startDateTimeISO = new Date(`${startCompensatieDatumInput.value}T${startCompensatieTijdInput.value}`).toISOString();
                const eindeDateTimeISO = new Date(`${eindeCompensatieDatumInput.value}T${eindeCompensatieTijdInput.value}`).toISOString();
                startCompensatieUrenISOInput.value = startDateTimeISO;
                eindeCompensatieUrenISOInput.value = eindeDateTimeISO;


                const compensatieLijstConfig = getLijstConfig('CompensatieUren');
                if (!compensatieLijstConfig || !compensatieLijstConfig.lijstId || !compensatieLijstConfig.lijstTitel) {
                    toonNotificatie('Fout: Compensatie kan niet worden verwerkt (configuratie ontbreekt).', 'error', false);
                    submitButton.disabled = false;
                    submitButton.textContent = 'Dien Compensatie In';
                    console.error("Configuratie voor 'CompensatieUren' lijst niet gevonden of incompleet.");
                    return;
                }
                const listNameForMetadata = compensatieLijstConfig.lijstTitel.replace(/\s+/g, '_');

                const formDataPayload = {
                    __metadata: { type: `SP.Data.${listNameForMetadata}ListItem` },
                    Title: titleInput.value,
                    Medewerker: medewerkerDisplayInput.value,
                    MedewerkerID: medewerkerIdInput.value,
                    AanvraagTijdstip: aanvraagTijdstipInput.value,
                    StartCompensatieUren: startCompensatieUrenISOInput.value, // Gebruik de ISO string
                    EindeCompensatieUren: eindeCompensatieUrenISOInput.value, // Gebruik de ISO string
                    UrenTotaal: urenTotaalInput.value,
                    Omschrijving: omschrijvingTextarea.value,
                    Status: statusInput.value // "Ingediend"
                };

                console.log('Voor te bereiden payload voor SharePoint (CompensatieUren):', JSON.stringify(formDataPayload, null, 2));

                try {
                    const requestDigest = await getRequestDigest();
                    const createItemUrl = `${spWebAbsoluteUrl}/_api/web/lists(guid'${compensatieLijstConfig.lijstId}')/items`;
                    console.log("Versturen van data naar:", createItemUrl);

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
                        console.error("Fout bij opslaan compensatie in SharePoint:", response.status, spErrorMessage, errorData);
                        throw new Error(`Kon compensatie niet opslaan. ${spErrorMessage}`);
                    }

                    console.log("Compensatie succesvol opgeslagen in SharePoint.");
                    toonNotificatie('Compensatie-uren succesvol ingediend!', 'success');
                    form.reset();
                    // Herstel standaardwaarden na reset
                    medewerkerDisplayInput.value = currentUserDisplayName;
                    medewerkerIdInput.value = currentUserNormalizedLoginName;
                    const todayForTitle = new Date();
                    const dateStrForTitle = todayForTitle.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    titleInput.value = `Compensatie ${currentUserDisplayName} - ${dateStrForTitle}`;
                    aanvraagTijdstipInput.value = todayForTitle.toISOString();
                    statusInput.value = "Ingediend";
                    urenTotaalInput.value = "";
                    // Reset date/time pickers
                    setDefaultDateTimes();


                } catch (error) {
                    console.error('Fout bij indienen compensatie:', error);
                    toonNotificatie(`Fout bij indienen: ${error.message}. Probeer het opnieuw.`, 'error', false);
                } finally {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Dien Compensatie In';
                }
            }
            
            /**
             * Stelt de standaard datum en tijd in voor de pickers.
             */
            function setDefaultDateTimes() {
                const nu = new Date();
                const vandaagISO = nu.toISOString().split('T')[0];
                const nuTijd = nu.toTimeString().slice(0,5); // HH:mm

                startCompensatieDatumInput.value = vandaagISO;
                startCompensatieTijdInput.value = nuTijd;

                // Standaard eindtijd 1 uur later
                const eindTijdStandaard = new Date(nu.getTime() + (60 * 60 * 1000));
                eindeCompensatieDatumInput.value = eindTijdStandaard.toISOString().split('T')[0];
                eindeCompensatieTijdInput.value = eindTijdStandaard.toTimeString().slice(0,5);
                
                berekenUrenTotaal(); // Herbereken uren
            }


            // Event listeners
            if (form) {
                form.addEventListener('submit', handleFormulierVerzenden);
            }
            // Koppel berekenUrenTotaal aan alle vier de datum/tijd inputs
            [startCompensatieDatumInput, startCompensatieTijdInput, eindeCompensatieDatumInput, eindeCompensatieTijdInput].forEach(input => {
                if (input) { // Check of element bestaat
                    input.addEventListener('change', berekenUrenTotaal);
                }
            });


            // Start de initialisatie
            async function initPagina() {
                toonNotificatie('Pagina initialiseren...', 'info', 2000);
                try {
                    await initializeGebruikersInfoEnThema();
                    setDefaultDateTimes(); // Standaard datums en tijden instellen
                    console.log("Compensatie pagina initialisatie voltooid.");
                } catch (initError) {
                    console.error("Kritieke fout tijdens compensatie pagina initialisatie:", initError);
                    toonNotificatie("Kon de pagina niet correct initialiseren. Probeer het later opnieuw.", "error", false);
                }
            }
            
            if (typeof getLijstConfig === 'function' && typeof sharepointLijstConfiguraties !== 'undefined') {
                initPagina();
            } else {
                console.error("configLijst.js of getLijstConfig is niet beschikbaar. Pagina kan niet initialiseren.");
                toonNotificatie("Kritieke fout: Applicatieconfiguratie kon niet geladen worden.", "error", false);
            }
        });
    </script>
</body>
</html>
