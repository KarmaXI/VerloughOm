<!DOCTYPE html>
<html lang="nl" xmlns:mso="urn:schemas-microsoft-com:office:office" xmlns:msdt="uuid:C2F41010-65B3-11d1-A29F-00AA00C14882">
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verlof Aanvragen</title>
    <link rel="stylesheet" href="../css/verlofrooster_styles.css">
    <link rel="stylesheet" href="../css/profielKaart.css">
    <style>
        /* Basis stijlen, geïnspireerd door TailwindCSS utility classes */
        body {
            font-family: 'Inter', sans-serif;
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
            align-items: flex-start; /* Align to top to see header better */
            flex-grow: 1;
            padding: 1rem; /* p-4 */
            width: 100%;
        }
        .verlof-form {
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
        body.dark-mode .verlof-form {
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
        /* Stijl voor de link in de notificatie */
        .notification-area a {
            font-weight: 600; /* font-semibold */
            text-decoration: underline;
        }
        .notification-success a { color: #047857; /* text-green-700 */ }
        body.dark-mode .notification-success a { color: #34d399; /* dark:text-green-400 */ }
        .notification-info a { color: #0369a1; /* text-sky-700 */ }
        body.dark-mode .notification-info a { color: #7dd3fc; /* dark:text-sky-300 */ }

    </style>

<!--[if gte mso 9]><SharePoint:CTFieldRefs runat=server Prefix="mso:" FieldList="FileLeafRef,TaxCatchAllLabel,Opmerrking_x0020_over_x0020_bestand"><xml>
<mso:CustomDocumentProperties>
<mso:Opmerrking_x0020_over_x0020_bestand msdt:dt="string">&lt;div class=&quot;ExternalClass19E5212B556543039BD6A339B8210E11&quot;&gt;&lt;p&gt;De bestanden met prefix ''melding'' worden niet daadwerkelijk ingeladen als component in het verlofrooster zelf. Deze bestanden bestaan omdat het makkelijker is om een stand-alone pagina te maken en daar een samengevatte modal van te maken voor oinze modals (pop-up formulieren)&#8203;&lt;br&gt;&lt;/p&gt;&lt;/div&gt;</mso:Opmerrking_x0020_over_x0020_bestand>
</mso:CustomDocumentProperties>
</xml></SharePoint:CTFieldRefs><![endif]-->
</head>
<body>
    <header class="app-header">
        <h1>Verlofrooster</h1>
    </header>

    <div class="form-container">
        <form id="verlof-form" class="verlof-form">
            <input type="hidden" id="Title" name="Title">
            <input type="hidden" id="MedewerkerID" name="MedewerkerID"> <input type="hidden" id="StartDatum" name="StartDatum"> <input type="hidden" id="EindDatum" name="EindDatum">   <input type="hidden" id="Status" name="Status" value="Nieuw">

            <div class="form-header">
                <h2 class="form-title">Verlof Aanvragen</h2>
                <a href="../verlofRooster.aspx" class="back-link" title="Terug naar het volledige verlofrooster">← Terug naar rooster</a>
            </div>

            <div id="notification-area" class="notification-area hidden" role="alert">
                </div>

            <div class="form-group">
                <label for="MedewerkerDisplay" class="form-label">Medewerker</label>
                <input type="text" id="MedewerkerDisplay" name="MedewerkerDisplay" class="form-input" readonly title="Uw naam zoals bekend in het systeem.">
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="StartDatePicker" class="form-label required">Startdatum</label>
                    <input type="date" id="StartDatePicker" name="StartDatePicker" class="form-input" required title="Selecteer de startdatum van uw verlof.">
                </div>
                <div class="form-group">
                    <label for="StartTimePicker" class="form-label required">Starttijd</label>
                    <input type="time" id="StartTimePicker" name="StartTimePicker" class="form-input" value="09:00" required title="Selecteer de starttijd van uw verlof.">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="EndDatePicker" class="form-label required">Einddatum</label>
                    <input type="date" id="EndDatePicker" name="EndDatePicker" class="form-input" required title="Selecteer de einddatum van uw verlof.">
                </div>
                <div class="form-group">
                    <label for="EndTimePicker" class="form-label required">Eindtijd</label>
                    <input type="time" id="EndTimePicker" name="EndTimePicker" class="form-input" value="17:00" required title="Selecteer de eindtijd van uw verlof.">
                </div>
            </div>

            <div class="form-group">
                <label for="Reden" class="form-label required">Verlofreden</label>
                <select id="Reden" name="Reden" class="form-select" required title="Kies de reden voor uw verlofaanvraag.">
                    <option value="">-- Kies een reden --</option>
                    </select>
            </div>

            <div class="form-group">
                <label for="Omschrijving" class="form-label">Omschrijving (optioneel)</label>
                <textarea id="Omschrijving" name="Omschrijving" class="form-textarea" placeholder="Eventuele toelichting, bijv. specifieke details over gedeeltelijke dag." title="Geef hier eventueel een extra toelichting op uw verlofaanvraag."></textarea>
            </div>

            <div class="form-actions">
                <a href="../verlofRooster.aspx" class="btn btn-secondary">Annuleren</a>
                <button type="submit" id="submit-button" class="btn btn-primary">Verstuur Aanvraag</button>
            </div>
        </form>
    </div>

    <script src="../js/configLijst.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Globale variabelen voor deze pagina
            // BELANGRIJK: Pas deze URL aan naar de SharePoint site waar uw lijsten zich bevinden!
            const spWebAbsoluteUrl = "https://som.org.om.local/sites/MulderT/CustomPW/Verlof";

            let currentUserLoginName = "";
            let currentUserDisplayName = "";
            let currentUserNormalizedLoginName = ""; // Voor MedewerkerID

            // DOM Elementen
            const form = document.getElementById('verlof-form');
            const notificationArea = document.getElementById('notification-area');
            const submitButton = document.getElementById('submit-button');

            const medewerkerDisplayInput = document.getElementById('MedewerkerDisplay');
            const medewerkerIdInput = document.getElementById('MedewerkerID'); // Verborgen veld
            const titleInput = document.getElementById('Title'); // Verborgen veld

            const startDatePicker = document.getElementById('StartDatePicker');
            const startTimePicker = document.getElementById('StartTimePicker');
            const endDatePicker = document.getElementById('EndDatePicker');
            const endTimePicker = document.getElementById('EndTimePicker');
            const startDatumInput = document.getElementById('StartDatum'); // Verborgen veld
            const eindDatumInput = document.getElementById('EindDatum');   // Verborgen veld
            const redenSelect = document.getElementById('Reden');
            const omschrijvingTextarea = document.getElementById('Omschrijving');
            const statusInput = document.getElementById('Status'); // Verborgen veld


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
             * Toont een notificatie bericht aan de gebruiker.
             * @param {string} berichtHTML - Het te tonen bericht (kan HTML bevatten).
             * @param {'success'|'error'|'info'} type - Het type notificatie.
             * @param {number|false} [autoHideDelay=5000] - Delay in ms voor auto-hide, of false om niet te auto-hiden.
             */
            function toonNotificatie(berichtHTML, type = 'info', autoHideDelay = 5000) {
                // Functie om notificaties te tonen
                console.log(`[Notificatie] Type: ${type}, Bericht: ${berichtHTML}`);
                notificationArea.innerHTML = berichtHTML; // Gebruik innerHTML om de link te renderen
                notificationArea.className = 'notification-area'; // Reset classes
                notificationArea.classList.add(`notification-${type}`);
                notificationArea.classList.remove('hidden');

                // Clear previous timeout if any
                if (notificationArea.timeoutId) {
                    clearTimeout(notificationArea.timeoutId);
                }

                if (autoHideDelay !== false && autoHideDelay > 0) {
                    notificationArea.timeoutId = setTimeout(() => {
                        notificationArea.classList.add('hidden');
                    }, autoHideDelay);
                }
            }

            /**
             * Initialiseert gebruikersinformatie en thema.
             */
            async function initializeGebruikersInfoEnThema() {
                // Functie om gebruikersinfo en thema te initialiseren
                console.log("Start initialisatie gebruikersinfo en thema.");
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
                                document.body.classList.add('dark-mode');
                                console.log("Dark mode toegepast.");
                            } else {
                                document.body.classList.remove('dark-mode');
                                console.log("Light mode toegepast (of geen specifieke instelling gevonden).");
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
                    console.error('Fout bij ophalen gebruikersdata of thema:', error);
                    toonNotificatie('Kon gebruikersinformatie of thema niet laden. Standaardwaarden worden gebruikt.', 'error');
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
            async function laadVerlofredenen() {
                // Functie om verlofredenen te laden
                console.log("Laden van verlofredenen...");
                const redenCfg = getLijstConfig('Verlofredenen');
                if (!redenCfg || !redenCfg.lijstId) {
                    console.error("Configuratie voor 'Verlofredenen' lijst niet gevonden of lijstId ontbreekt.");
                    toonNotificatie("Kon verlofredenen niet laden: configuratie ontbreekt.", "error");
                    populateFallbackReasons();
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
                    console.error('Fout bij ophalen verlofredenen:', error);
                    toonNotificatie('Kon verlofredenen niet laden. Standaardopties worden getoond.', 'error');
                    populateFallbackReasons();
                }
            }

            /**
             * Vult de dropdown met fallback redenen als API faalt.
             */
            function populateFallbackReasons() {
                // Functie om fallback redenen te populeren
                console.warn("Populeren van fallback verlofredenen.");
                const fallbackReasons = [
                    { id: 'vakantie', text: 'Vakantie', titleVal: 'Vakantie' },
                    { id: 'ziekte', text: 'Ziekte', titleVal: 'Ziekte' },
                    { id: 'persoonlijk', text: 'Persoonlijke omstandigheden', titleVal: 'Persoonlijk' },
                    { id: 'studie', text: 'Studie', titleVal: 'Studie' }
                ];
                redenSelect.innerHTML = '<option value="">-- Kies een reden --</option>';
                fallbackReasons.forEach(reason => {
                    const opt = document.createElement('option');
                    opt.value = reason.id; // Gebruik een generieke ID voor fallback
                    opt.textContent = reason.text;
                    opt.dataset.reasonTitle = reason.titleVal; // Zorg dat dit overeenkomt met wat SharePoint verwacht
                    redenSelect.appendChild(opt);
                });
            }

            /**
             * Valideert het formulier.
             * @returns {boolean} True als valide, anders false.
             */
            function valideerFormulier() {
                // Functie om het formulier te valideren
                if (!startDatePicker.value || !startTimePicker.value || !endDatePicker.value || !endTimePicker.value || !redenSelect.value) {
                    toonNotificatie('Vul alle verplichte velden (*) in.', 'error');
                    return false;
                }

                const startDateTime = new Date(`${startDatePicker.value}T${startTimePicker.value}`);
                const endDateTime = new Date(`${endDatePicker.value}T${endTimePicker.value}`);

                if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                    toonNotificatie('Ongeldige datum of tijd ingevoerd.', 'error');
                    return false;
                }

                if (endDateTime <= startDateTime) {
                    toonNotificatie('De einddatum en -tijd moeten na de startdatum en -tijd liggen.', 'error');
                    return false;
                }
                return true;
            }

            /**
             * Verwerkt het verzenden van het formulier.
             * @param {Event} e - Het submit event.
             */
            async function handleFormulierVerzenden(e) {
                // Functie om het formulier te verzenden
                e.preventDefault();
                console.log("Formulierverwerking gestart...");
                submitButton.disabled = true;
                submitButton.textContent = 'Bezig met verzenden...';
                toonNotificatie('Bezig met verzenden van uw aanvraag...', 'info', false);

                if (!valideerFormulier()) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Verstuur Aanvraag';
                    return;
                }

                // Combineer datum en tijd en zet naar ISO string voor verborgen velden
                const startDateTime = new Date(`${startDatePicker.value}T${startTimePicker.value}`);
                startDatumInput.value = startDateTime.toISOString();

                const endDateTime = new Date(`${endDatePicker.value}T${endTimePicker.value}`);
                eindDatumInput.value = endDateTime.toISOString();

                const geselecteerdeRedenOptie = redenSelect.options[redenSelect.selectedIndex];
                const redenIdValue = geselecteerdeRedenOptie.value; // ID van de reden (of fallback 'id')
                const redenTextValue = geselecteerdeRedenOptie.dataset.reasonTitle || geselecteerdeRedenOptie.textContent;

                const verlofLijstConfig = getLijstConfig('Verlof');
                if (!verlofLijstConfig || !verlofLijstConfig.lijstId || !verlofLijstConfig.lijstTitel) {
                    toonNotificatie('Fout: Verlofaanvraag kan niet worden verwerkt (configuratie ontbreekt).', 'error', false);
                    submitButton.disabled = false;
                    submitButton.textContent = 'Verstuur Aanvraag';
                    console.error("Configuratie voor 'Verlof' lijst niet gevonden of incompleet.");
                    return;
                }
                
                // Zorg ervoor dat lijstTitel correct is voor __metadata.type
                const listNameForMetadata = verlofLijstConfig.lijstTitel.replace(/\s+/g, '_');


                const formDataPayload = {
                    __metadata: { type: `SP.Data.${listNameForMetadata}ListItem` },
                    Title: titleInput.value,
                    Medewerker: medewerkerDisplayInput.value,       // Gebruikersnaam (display)
                    MedewerkerID: medewerkerIdInput.value,       // Genormaliseerde loginnaam
                    StartDatum: startDatumInput.value,           // ISO string
                    EindDatum: eindDatumInput.value,             // ISO string
                    Omschrijving: omschrijvingTextarea.value,
                    Reden: redenTextValue,                       // Tekst van de reden (bv. Verlofredenen.Title)
                    RedenId: redenIdValue,                       // ID van de reden (Verlofredenen.ID)
                    Status: statusInput.value                    // "Nieuw"
                };

                console.log('Voor te bereiden payload voor SharePoint:', JSON.stringify(formDataPayload, null, 2));

                try {
                    const requestDigest = await getRequestDigest();
                    const createItemUrl = `${spWebAbsoluteUrl}/_api/web/lists(guid'${verlofLijstConfig.lijstId}')/items`;
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

                    if (!response.ok && response.status !== 201) { // 201 Created
                        const errorData = await response.json().catch(() => null);
                        const spErrorMessage = errorData?.error?.message?.value || `Serverfout: ${response.status}`;
                        console.error("Fout bij opslaan in SharePoint:", response.status, spErrorMessage, errorData);
                        throw new Error(`Kon verlofaanvraag niet opslaan. ${spErrorMessage}`);
                    }

                    console.log("Verlofaanvraag succesvol opgeslagen in SharePoint.");
                    // Eerste notificatie: succes van opslaan
                    toonNotificatie('Verlofaanvraag succesvol verzonden!', 'success', 5000); // Kortere duur voor deze

                    // Reset het formulier
                    form.reset(); 
                    medewerkerDisplayInput.value = currentUserDisplayName;
                    medewerkerIdInput.value = currentUserNormalizedLoginName;
                    const today = new Date();
                    const dateStr = today.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    titleInput.value = `Verlofaanvraag ${currentUserDisplayName} - ${dateStr}`;
                    statusInput.value = "Nieuw";
                    startTimePicker.value = "09:00";
                    endTimePicker.value = "17:00";
                    const vandaagISO = today.toISOString().split('T')[0];
                    startDatePicker.value = vandaagISO;
                    endDatePicker.value = vandaagISO;

                    // Tweede notificatie: P-Direkt herinnering (langer zichtbaar)
                    // Wacht even zodat de eerste notificatie gezien kan worden, of toon direct na.
                    setTimeout(() => {
                        const pDirektLink = "https://sap-portal.p-direkt.rijksweb.nl/irj/portal/medewerker/verlofwerktijd/verlofregistreren";
                        const berichtHTML = `Vergeet niet om je verlofaanvraag ook in <a href="${pDirektLink}" target="_blank" title="Open P-Direkt in een nieuw tabblad">P-direkt</a> te registreren!`;
                        toonNotificatie(berichtHTML, 'info', 15000); // 15 seconden
                    }, 500); // Toon na 0.5 seconde, of pas aan naar wens


                } catch (error) {
                    console.error('Fout bij verzenden verlofaanvraag:', error);
                    toonNotificatie(`Fout bij verzenden: ${error.message}. Probeer het opnieuw.`, 'error', false);
                } finally {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Verstuur Aanvraag';
                }
            }

            // Event listener voor het formulier
            if (form) {
                form.addEventListener('submit', handleFormulierVerzenden);
            }

            // Start de initialisatie
            async function initPagina() {
                toonNotificatie('Pagina initialiseren...', 'info', 2000);
                try {
                    await initializeGebruikersInfoEnThema();
                    await laadVerlofredenen();
                    // Zet standaard datums na laden gebruikersinfo
                    const vandaag = new Date();
                    const vandaagISO = vandaag.toISOString().split('T')[0];
                    startDatePicker.value = vandaagISO;
                    endDatePicker.value = vandaagISO;
                    console.log("Pagina initialisatie voltooid.");
                } catch (initError) {
                    console.error("Kritieke fout tijdens pagina initialisatie:", initError);
                    toonNotificatie("Kon de pagina niet correct initialiseren. Probeer het later opnieuw.", "error", false);
                }
            }

            // Controleer of configLijst.js en getLijstConfig correct geladen zijn
            if (typeof getLijstConfig === 'function' && typeof sharepointLijstConfiguraties !== 'undefined') {
                initPagina();
            } else {
                console.error("configLijst.js of getLijstConfig is niet beschikbaar. Pagina kan niet initialiseren.");
                toonNotificatie("Kritieke fout: Applicatieconfiguratie kon niet geladen worden. Neem contact op met de beheerder.", "error", false);
            }
        });
    </script>
</body>
</html>