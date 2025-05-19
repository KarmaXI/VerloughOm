<!DOCTYPE html>
<html lang="nl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verlofrooster</title>
    <link rel="icon" type="image/svg+xml" href="Icoon/favicon.svg">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/verlofrooster_styles.css">
    <link rel="stylesheet" href="css/profielKaart.css">
    <link rel="stylesheet" href="css/verlofRooster_tour.css">
    <link rel="stylesheet" href="css/enhanced_styles.css">
    <!-- <link rel="stylesheet" href="css/weekend_fixes.css"> MOVED TO verlofrooster_styles.css -->
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }

        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        #fab-menu {
            transition: opacity 0.2s ease-out, transform 0.2s ease-out;
        }

        .fab-menu-item {
            transition: background-color 0.15s ease-in-out;
        }

        #rooster-dropdown-menu {
            transition: opacity 0.2s ease-out, transform 0.2s ease-out;
        }

        .dag-header-vandaag {
            /* Styling in verlofrooster_styles.css */
        }

        .rooster-cel-vandaag::after {
            /* Styling in verlofrooster_styles.css */
        }

        #app-container {
            min-height: 100vh;
        }
    </style>
    <!-- Theme will be initialized from user settings (gebruikersInstellingen.soortWeergave) in js/theme-toggle.js -->
    <!-- Theme toggle button has been removed as themes are now controlled by user settings -->
</head>

<body class="light-theme transition-colors duration-300">
    <div id="app-container" class="flex flex-col h-screen">
        <header id="app-header" class="bg-white shadow-md p-3 md:p-4 space-y-3 print:hidden">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-3 md:space-x-4">
                    <h1 id="app-title" class="text-lg sm:text-xl font-bold text-gray-800">Teamverlofrooster</h1>
                    <a id="melding-button" href="pages/meldingMaken.aspx" title="Nieuwe melding maken (fout, suggestie)"
                        class="text-gray-600 hover:text-blue-600 hover:bg-gray-100 py-1.5 px-2 md:py-2 md:px-3 rounded-lg flex items-center space-x-1 transition-colors border border-gray-200 hover:border-blue-300 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span class="sm:inline ml-1">Melding</span>
                    </a>
                    <div id="notification-placeholder" class="text-xs sm:text-sm text-gray-500 italic"></div>
                </div>
                <div class="flex items-center space-x-2 md:space-x-3">
                    <div id="admin-buttons-header" class="flex space-x-1 md:space-x-2">
                        <a id="admin-instellingen-button" href="Pages/adminCentrum.aspx"
                            title="Administrator instellingen"
                            class="text-gray-600 hover:text-blue-600 hover:bg-gray-100 py-1.5 px-2 md:py-2 md:px-3 rounded-lg flex items-center space-x-1 transition-colors border border-gray-200 hover:border-blue-300 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                            <span class="sm:inline ml-1">Admin</span>
                        </a>
                        <a id="beheer-centrum-button" href="Pages/beheerCentrum.aspx" title="Beheer Centrum"
                            class="text-gray-600 hover:text-blue-600 hover:bg-gray-100 py-1.5 px-2 md:py-2 md:px-3 rounded-lg flex items-center space-x-1 transition-colors border border-gray-200 hover:border-blue-300 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path
                                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
                                </path>
                            </svg>
                            <span class="sm:inline ml-1">Beheer</span>
                        </a>
                    </div> <button id="help-button" title="Hulp & Interactieve Tour"
                        class="text-gray-600 hover:text-blue-600 hover:bg-gray-100 py-1.5 px-2 md:py-2 md:px-3 rounded-lg flex items-center space-x-1 transition-colors border border-gray-200 hover:border-blue-300 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <span class="hidden sm:inline ml-1">Help</span>
                    </button>
                    <div class="relative"> <button id="rooster-dropdown-button"
                            title="Gebruikersinstellingen en persoonlijke gegevens"
                            class="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1.5 px-2 md:py-2 md:px-3 rounded-lg flex items-center space-x-1 shadow hover:shadow-md transition-all border border-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="mr-1">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span id="gebruikersnaam-display" class="text-xs sm:text-sm">Gebruiker</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        <div id="rooster-dropdown-menu"
                            class="hidden absolute right-0 mt-2 w-64 bg-white rounded-md shadow-xl py-1 z-50 transform scale-95 opacity-0 border border-gray-200">
                            <a href="Pages/gInstellingen.aspx?tab=persoonlijk"
                                class="dropdown-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">Persoonlijke
                                gegevens & Werkdagen</a>
                            <a href="Pages/gInstellingen.aspx?tab=instellingen"
                                class="dropdown-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">Instellingen
                                Rooster</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                <div class="flex items-center space-x-1 md:space-x-2">
                    <button id="prev-month-button" title="Vorige periode"
                        class="nav-button p-2 rounded-md hover:bg-gray-200 text-gray-600 transition-colors border border-gray-200 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <span id="current-month-year"
                        class="text-md sm:text-lg font-semibold text-gray-800 w-32 text-center">Laden...</span>
                    <button id="next-month-button" title="Volgende periode"
                        class="nav-button p-2 rounded-md hover:bg-gray-200 text-gray-600 transition-colors border border-gray-200 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button> <button id="today-button" title="Ga naar vandaag"
                        class="nav-button-alt bg-gray-200 hover:bg-gray-300 text-gray-700 py-1.5 px-2 md:py-2 md:px-3 rounded-lg text-xs sm:text-sm shadow hover:shadow-md transition-all border border-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="mr-1 inline-block">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Vandaag
                    </button>
                    <div class="view-toggle-group bg-gray-200 rounded-lg p-0.5 flex shadow border border-gray-300">
                        <button id="week-view-button"
                            class="view-toggle-button py-1 px-2 md:py-1.5 md:px-3 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-gray-300 hover:text-gray-900 transition-all font-medium">Week</button>
                        <button id="month-view-button"
                            class="view-toggle-button py-1 px-2 md:py-1.5 md:px-3 rounded-md text-xs sm:text-sm text-white bg-blue-500 transition-all font-medium">Maand</button>
                    </div>
                </div>
                <div class="flex items-center space-x-1 md:space-x-2 w-full sm:w-auto">
                    <select id="team-filter-select" title="Filter op team"
                        class="filter-input bg-white border border-gray-300 text-gray-800 text-xs sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 shadow w-full sm:w-auto max-w-[150px] sm:max-w-xs">
                        <option selected value="all">Alle teams</option>
                    </select>
                    <div class="relative w-full sm:w-auto">
                        <input type="search" id="rooster-search-input" placeholder="Zoek medewerker..."
                            class="filter-input bg-white border border-gray-300 text-gray-800 text-xs sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 pl-8 shadow w-full sm:w-48 md:w-64">
                        <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="text-gray-400">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <main id="app-main" class="flex-grow p-3 md:p-4 overflow-auto">
            <section id="legenda-section"
                class="bg-white p-2 md:p-3 rounded-lg mb-3 md:mb-4 shadow print:hidden border border-gray-200">
                <div id="legenda-items-container"
                    class="flex flex-wrap items-center gap-x-3 gap-y-1 md:gap-x-4 md:gap-y-2">
                    <h3 id="legenda-title" class="text-sm sm:text-md font-semibold text-gray-800 mr-2">Legenda:</h3>
                    <span class="flex items-center text-xs sm:text-sm"><span
                            class="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-sm mr-1"></span>Voorbeeld
                        Vakantie</span>
                </div>
            </section>

            <div id="registratie-melding"
                class="hidden bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 md:p-4 mb-3 md:mb-4 rounded-md shadow"
                role="alert">
                <div class="flex">
                    <div class="py-1"><svg class="fill-current h-6 w-6 text-yellow-600 mr-4"
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path
                                d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z" />
                        </svg></div>
                    <div>
                        <p class="font-bold">Registratie Vereist</p>
                        <p id="registratie-melding-tekst" class="text-sm">Uw gebruikersnaam is niet herkend in de
                            medewerkerslijst. Registreer alstublieft om toegang te krijgen.</p>
                        <button id="start-registratie-button"
                            class="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm shadow hover:shadow-md transition-all">Start
                            Registratie</button>
                    </div>
                </div>
            </div>

            <section id="rooster-grid-container"
                class="bg-gray-200 p-px rounded-lg shadow-xl overflow-x-auto border border-gray-300">
                <div id="rooster-grid-header"
                    class="grid grid-cols-[200px_repeat(31,minmax(40px,1fr))] gap-px bg-gray-300 sticky top-0 z-20 rounded-t-md">
                    <div
                        class="rooster-header-medewerker sticky left-0 bg-gray-100 p-2 font-semibold z-30 rounded-tl-md flex items-center text-gray-700">
                        <span>Medewerker</span>
                        <button id="sort-medewerker-button" title="Sorteer medewerkers"
                            class="ml-auto p-1 hover:bg-gray-300 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path d="M3 4h13M3 8h9M3 12h9M3 16h5M21 12l-4 4-4-4M17 4v16" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div id="rooster-data-rows" class="divide-y divide-gray-300">
                </div>
                <div class="rooster-bottom-line bg-gray-300 p-px rounded-b-md h-1"></div>
            </section>
            <p id="footer-text" class="mt-4 text-xs text-gray-500 text-center print:hidden">Gegevens worden geladen
                vanuit SharePoint. Wijzigingen kunnen even duren om zichtbaar te worden.</p>
        </main>

        <div class="fixed bottom-4 right-4 md:bottom-6 md:right-6 print:hidden z-40">
            <div id="fab-menu"
                class="absolute bottom-16 right-0 mb-2 w-60 bg-white rounded-lg shadow-xl py-2 transform scale-95 opacity-0 pointer-events-none border border-gray-200">
                <a href="javascript:void(0)" id="fab-verlof-aanvragen"
                    class="fab-menu-item block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Verlof
                    aanvragen</a>
                <a href="javascript:void(0)" id="fab-compensatie-doorgeven"
                    class="fab-menu-item block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Compensatieuren
                    doorgeven</a>
                <a href="Pages/meldingMaken.aspx?type=ziek" id="fab-ziek-melden"
                    class="fab-menu-item restricted-fab-item block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Ziek/Beter
                    melden</a>
                <button type="button" id="fab-zittingvrij-modal-trigger"
                    class="fab-menu-item restricted-fab-item block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Zittingvrij
                    (incidenteel)</button>
            </div>
            <button id="fab-add-button" title="Nieuwe melding toevoegen"
                class="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all">
                <svg id="fab-icon-plus" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <svg id="fab-icon-close" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="hidden">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <div id="modal-placeholder"
            class="hidden fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 print:hidden">
            <div class="modal-dialog w-full max-w-md mx-auto">
                <div
                    class="modal-card bg-white p-5 md:p-6 rounded-lg shadow-xl w-full transform transition-all scale-95 opacity-0 border border-gray-200">
                    <div class="flex justify-between items-center mb-4">
                        <h3 id="modal-title" class="text-lg font-semibold text-gray-800">Modal Titel</h3>
                        <button id="modal-close-button-x"
                            class="modal-close-x-button text-gray-500 hover:text-gray-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div id="modal-step-navigation-container" class="hidden mb-4">
                    </div>
                    <div id="modal-content" class="text-sm text-gray-700">
                    </div>
                    <div id="modal-actions" class="mt-6 flex justify-end space-x-3">
                        <button id="modal-close-button"
                            class="modal-button-secondary bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm shadow hover:shadow-md transition-all">Sluiten</button>
                        <button id="modal-action-button"
                            class="modal-button-primary bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm shadow hover:shadow-md transition-all">Actie</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="profile-card-container" class="profile-card hidden"></div>
    </div>
</body>

</div>
<script src="js/ui_utilities.js"></script>
<script src="js/configLijst.js"></script>
<script src="js/machtigingen.js"></script>
<script src="js/profielKaarten.js"></script>
<script src="js/verlofroosterModal_logic.js"></script>
<script src="js/verlofrooster_logic.js"></script>
<script src="js/theme-toggle.js"></script>

<script src="js/verlofRooster_tour.js"></script>
</body>

</html>