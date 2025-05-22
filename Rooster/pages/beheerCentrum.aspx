<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Beheercentrum (Standalone) - Verlofrooster</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/beheerCentrum_styles.css">
    <style>
        /* Basisstijlen en overrides voor standalone pagina */
        body {
            font-family: 'Inter', sans-serif;
            /* Standaard donker thema, kan door beheerCentrum_styles.css of JS (localStorage) worden aangepast */
            /* De body class wordt nu dynamisch gezet door JS, dus de default hier is minder kritisch */
        }
        /* Custom scrollbar (consistent met hoofdpagina) */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #2d3748; border-radius: 4px; } /* gray-700 */
        ::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 4px; } /* gray-600 */
        ::-webkit-scrollbar-thumb:hover { background: #718096; } /* gray-500 */

        /* Stijlen voor actieve tab (wordt ook door beheerCentrum_styles.css beïnvloed) */
        .tab-button.active {
            border-color: #3b82f6; /* blue-500 */
            color: #3b82f6;
            /* background-color wordt door thema CSS afgehandeld */
        }

        .tab-content { display: none; }
        .tab-content.active { display: block; }

        .editable-table th, .editable-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom-width: 1px;
        }
        .editable-table input[type="text"],
        .editable-table input[type="color"],
        .editable-table input[type="date"],
        .editable-table input[type="email"], /* Toegevoegd voor consistentie */
        .editable-table input[type="tel"],    /* Toegevoegd voor consistentie */
        .editable-table select,
        .editable-table textarea {
            width: 100%;
            padding: 0.5rem;
            border-radius: 0.375rem;
            /* Basis border, thema specifiek in CSS file */
            border: 1px solid #6b7280; /* Default dark theme border */
        }
        /* Input styling wordt nu primair door beheerCentrum_styles.css afgehandeld */

        /* Switch styling (herhaald voor standalone zekerheid) */
        .switch { position: relative; display: inline-block; width: 40px; height: 20px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #6b7280; transition: .4s; border-radius: 20px; }
        .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #2563eb; }
        body.light-theme input:checked + .slider { background-color: #2563eb; }
        body.light-theme .slider { background-color: #d1d5db; }
        input:focus + .slider { box-shadow: 0 0 1px #2563eb; }
        input:checked + .slider:before { transform: translateX(20px); }

        /* Styling voor de app container */
        #app-container {
            width: 99%; /* Max-width is nu effectief 99% van de viewport */
            margin-left: auto;
            margin-right: auto;
        }
    </style>
</head>
<body class="dark-theme"> <div id="app-container" class="p-4 md:p-8"> <header class="mb-6 md:mb-8">
            <h1 class="text-2xl md:text-3xl font-bold">Beheercentrum (Standalone)</h1> <p class="mt-1">Beheer hier de kernlijsten en instellingen van het Verlofrooster.</p> <div id="beheer-status-bericht-algemeen" class="hidden mt-4 p-3 text-sm rounded-lg"></div>
        </header>

        <div class="mb-6 border-b"> <nav class="flex flex-wrap -mb-px space-x-1 md:space-x-2" aria-label="Tabs">
                <button data-tab="medewerkers" class="tab-button active py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center rounded-t-lg hover:text-blue-500 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap">
                    Medewerkers
                </button>
                <button data-tab="dagen-indicators" class="tab-button py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center rounded-t-lg hover:text-blue-500 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap">
                    Dagen Indicatoren
                </button>
                <button data-tab="keuzelijst-functies" class="tab-button py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center rounded-t-lg hover:text-blue-500 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap">
                    Functies
                </button>
                <button data-tab="verlofredenen" class="tab-button py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center rounded-t-lg hover:text-blue-500 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap">
                    Verlofredenen
                </button>
                <button data-tab="seniors" class="tab-button py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center rounded-t-lg hover:text-blue-500 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap">
                    Seniors
                </button>
                <button data-tab="teams" class="tab-button py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center rounded-t-lg hover:text-blue-500 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap">
                    Teams
                </button>
            </nav>
        </div>

        <main id="tab-content-container">
            <div id="tab-content-medewerkers" class="tab-content active space-y-6">
                <h2 class="text-xl font-semibold">Beheer Medewerkers</h2> <div class="p-4 md:p-6 rounded-lg shadow-md"> <div class="flex justify-end mb-4">
                        <button id="nieuw-medewerker-button" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow text-sm">Nieuwe Medewerker Toevoegen</button>
                    </div>
                    <div class="overflow-x-auto"> <table class="min-w-full editable-table"> <thead class="bg-gray-600"> <tr>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Naam</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Username</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">E-mail</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Telefoonnummer</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Geboortedatum</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Functie</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Team</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Opmerking</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Opmerking Geldig Tot</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Horen</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Actief</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Verbergen</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider w-32">Acties</th>
                                </tr>
                            </thead>
                            <tbody id="medewerkers-tabel-body" class="divide-y"> </tbody>
                        </table>
                    </div>
                    <div id="medewerkers-status" class="mt-3 text-sm"></div>
                </div>
            </div>

            <div id="tab-content-dagen-indicators" class="tab-content space-y-6">
                <h2 class="text-xl font-semibold">Beheer Dagen Indicatoren</h2>
                <div class="p-4 md:p-6 rounded-lg shadow-md">
                    <div class="flex justify-end mb-4">
                        <button id="nieuw-dagenindicator-button" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow text-sm">Nieuwe Indicator</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full editable-table">
                            <thead class="bg-gray-600">
                                <tr>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Titel (Afkorting)</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Beschrijving</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Kleur</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Patroon</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider w-32">Acties</th>
                                </tr>
                            </thead>
                            <tbody id="dagen-indicators-tabel-body" class="divide-y"></tbody>
                        </table>
                    </div>
                    <div id="dagen-indicators-status" class="mt-3 text-sm"></div>
                </div>
            </div>

            <div id="tab-content-keuzelijst-functies" class="tab-content space-y-6">
                <h2 class="text-xl font-semibold">Beheer Functies (Keuzelijst)</h2>
                <div class="p-4 md:p-6 rounded-lg shadow-md">
                    <div class="flex justify-end mb-4">
                         <button id="nieuw-functie-button" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow text-sm">Nieuwe Functie</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full editable-table">
                            <thead class="bg-gray-600">
                                <tr>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Functienaam (Titel)</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider w-32">Acties</th>
                                </tr>
                            </thead>
                            <tbody id="keuzelijst-functies-tabel-body" class="divide-y"></tbody>
                        </table>
                    </div>
                     <div id="keuzelijst-functies-status" class="mt-3 text-sm"></div>
                </div>
            </div>

            <div id="tab-content-verlofredenen" class="tab-content space-y-6">
                <h2 class="text-xl font-semibold">Beheer Verlofredenen</h2>
                 <div class="p-4 md:p-6 rounded-lg shadow-md">
                    <div class="flex justify-end mb-4">
                         <button id="nieuw-verlofreden-button" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow text-sm">Nieuwe Verlofreden</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full editable-table">
                            <thead class="bg-gray-600">
                                <tr>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Titel (voor dropdowns)</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Naam (voor legenda)</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Kleur</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Telt als Verlofdag?</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider w-32">Acties</th>
                                </tr>
                            </thead>
                            <tbody id="verlofredenen-tabel-body" class="divide-y"></tbody>
                        </table>
                    </div>
                    <div id="verlofredenen-status" class="mt-3 text-sm"></div>
                </div>
            </div>

            <div id="tab-content-seniors" class="tab-content space-y-6">
                <h2 class="text-xl font-semibold">Beheer Seniors per Team</h2>
                 <div class="p-4 md:p-6 rounded-lg shadow-md">
                    <div class="flex justify-end mb-4">
                         <button id="nieuw-senior-button" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow text-sm">Nieuwe Senior Toewijzen</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full editable-table">
                            <thead class="bg-gray-600">
                                <tr>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Medewerker (Senior)</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Team</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">MedewerkerID (Username)</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider w-32">Acties</th>
                                </tr>
                            </thead>
                            <tbody id="seniors-tabel-body" class="divide-y"></tbody>
                        </table>
                    </div>
                    <div id="seniors-status" class="mt-3 text-sm"></div>
                </div>
            </div>

            <div id="tab-content-teams" class="tab-content space-y-6">
                <h2 class="text-xl font-semibold">Beheer Teams</h2>
                 <div class="p-4 md:p-6 rounded-lg shadow-md">
                    <div class="flex justify-end mb-4">
                         <button id="nieuw-team-button" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow text-sm">Nieuw Team</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full editable-table">
                            <thead class="bg-gray-600">
                                <tr>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Teamnaam (Titel)</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Teamleider</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Kleur</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider">Actief?</th>
                                    <th class="text-left text-xs font-medium uppercase tracking-wider w-32">Acties</th>
                                </tr>
                            </thead>
                            <tbody id="teams-tabel-body" class="divide-y"></tbody>
                        </table>
                    </div>
                    <div id="teams-status" class="mt-3 text-sm"></div>
                </div>
            </div>
        </main>

        <footer class="text-center mt-8 md:mt-12 py-4 border-t"> <a href="https://som.org.om.local/sites/MulderT/CustomPW/Verlof/CPW/Rooster/verlofrooster.aspx" class="text-sm hover:underline"> &larr; Terug naar het Verlofrooster
            </a>
            <p class="text-xs mt-2">&copy; <span id="current-year"></span> Verlofrooster Applicatie (Standalone Beheer)</p> </footer>
    </div>

    <div id="beheer-modal" class="hidden fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div class="p-5 md:p-6 rounded-lg shadow-xl w-full max-w-xl transform transition-all scale-95 opacity-0"> <div class="flex justify-between items-center mb-4">
                <h3 id="beheer-modal-title" class="text-lg font-semibold">Item Bewerken/Toevoegen</h3> <button id="beheer-modal-close-x" class="hover:text-white transition-colors"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <form id="beheer-modal-form" class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div id="beheer-modal-fields-container" class="space-y-3">
                </div>
                <div id="beheer-modal-status" class="mt-3 text-sm"></div>
            </form>
            <div class="mt-6 flex justify-end space-x-3">
                <button id="beheer-modal-cancel-button" class="py-2 px-4 rounded-lg text-sm shadow hover:shadow-md transition-all">Annuleren</button> <button id="beheer-modal-save-button" class="text-white py-2 px-4 rounded-lg text-sm shadow hover:shadow-md transition-all">Opslaan</button> </div>
        </div>
    </div>

    <script src="../js/configLijst.js"></script>
    <script src="JS/beheerCentrum_logic.js"></script>

</body>
</html>
