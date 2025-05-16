<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gebruikersinstellingen - Verlofrooster</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/gInstellingen_styles.css">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        /* Custom scrollbar (consistent met hoofdpagina) */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #2d3748; border-radius: 4px; } /* gray-700 */
        ::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 4px; } /* gray-600 */
        ::-webkit-scrollbar-thumb:hover { background: #718096; } /* gray-500 */

        /* Stijlen voor actieve tab */
        .tab-button.active {
            border-color: #3b82f6; /* blue-500 */
            color: #3b82f6; /* blue-500 */
        }
        /* Light theme overrides worden door gInstellingen_styles.css afgehandeld */

        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }

        .form-input, .form-select, .form-textarea {
            width: 100%;
            padding: 0.5rem 0.75rem; /* p-2 px-3 */
            border-radius: 0.375rem; /* rounded-md */
            border-width: 1px;
        }
        .werkrooster-edit-table .dag-label {
            font-weight: 500;
        }
        /* Profile picture placeholder */
        .profile-picture-container {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background-color: #4b5563; /* gray-600 for dark theme */
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            margin-bottom: 1rem;
        }
        body.light-theme .profile-picture-container {
            background-color: #e5e7eb; /* gray-200 for light theme */
        }
        .profile-picture-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    </style>
</head>
<body class="bg-gray-800 text-gray-100"> 
    <div id="app-container" class="container mx-auto p-4 md:p-8 max-w-4xl">
        <header class="mb-6 md:mb-8">
            <h1 class="text-2xl md:text-3xl font-bold">Gebruikersinstellingen</h1>
            <p class="mt-1">Beheer hier uw persoonlijke gegevens en rooster voorkeuren.</p>
        </header>

        <div class="mb-6 border-b">
            <nav class="flex space-x-1 md:space-x-2" aria-label="Tabs">
                <button data-tab="persoonlijk" class="tab-button active py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center rounded-lg hover:text-blue-500">
                    Persoonlijke Gegevens & Werkdagen
                </button>
                <button data-tab="instellingen" class="tab-button py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center rounded-lg hover:text-blue-500">
                    Rooster Instellingen
                </button>
            </nav>
        </div>

        <div>
            <div id="tab-content-persoonlijk" class="tab-content active">
                <h2 class="text-xl font-semibold mb-4">Persoonlijke Gegevens</h2>
                <form id="persoonlijke-gegevens-form" class="space-y-6 p-6 rounded-lg shadow-md">
                    <div class="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-6">
                        <div class="profile-picture-container mb-4 sm:mb-0">
                            <img id="pg-profile-pic" src="" alt="Profielfoto">
                        </div>
                        <div class="flex-grow space-y-4 w-full">
                            <div>
                                <label for="pg-naam" class="block text-sm font-medium">Volledige Naam</label>
                                <input type="text" id="pg-naam" name="naam" class="form-input mt-1">
                            </div>
                            <div>
                                <label for="pg-username" class="block text-sm font-medium">Gebruikersnaam (Login)</label>
                                <input type="text" id="pg-username" name="username" class="form-input mt-1 cursor-not-allowed opacity-75" readonly>
                            </div>
                            <div>
                                <label for="pg-email" class="block text-sm font-medium">E-mailadres</label>
                                <input type="email" id="pg-email" name="email" class="form-input mt-1 cursor-not-allowed opacity-75" readonly>
                            </div>
                            <div>
                                <label for="pg-team" class="block text-sm font-medium">Team</label>
                                <select id="pg-team" name="team" class="form-select mt-1">
                                    <option value="">Laden...</option>
                                </select>
                            </div>
                            <div>
                                <label for="pg-functie" class="block text-sm font-medium">Functie</label>
                                <select id="pg-functie" name="functie" class="form-select mt-1">
                                    <option value="">Laden...</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="pt-4 flex justify-end">
                        <button type="button" id="opslaan-persoonlijke-gegevens-knop" class="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg text-sm shadow-md hover:shadow-lg transition-all">
                            Persoonlijke Gegevens Opslaan
                        </button>
                    </div>
                    <div id="persoonlijke-gegevens-status-bericht" class="hidden mt-4 p-3 text-sm rounded-lg"></div>

                    <div class="pt-6 border-t">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">Standaard Werkdagen en Tijden</h3>
                            <button type="button" id="wijzig-werkrooster-knop" class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg text-sm shadow-md hover:shadow-lg transition-all">
                                Wijzig Werkrooster
                            </button>
                        </div>
                        <p class="text-sm mb-4">Hieronder ziet u uw huidige standaard werkrooster. Klik op "Wijzig Werkrooster" om aanpassingen te maken.</p>

                        <!-- New table layout for viewing current schedule -->
                        <div id="werkdagen-display-container" class="space-y-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead class="bg-gray-100 dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" class="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dag</th>
                                        <th scope="col" class="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Werktijden</th>
                                        <th scope="col" class="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-700" id="werkdagen-tabel-body">
                                    <tr>
                                        <td colspan="3" class="py-2 px-3 text-sm text-gray-500 dark:text-gray-400">Werkrooster informatie wordt geladen...</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p id="rooster-geldig-vanaf" class="text-xs mt-2 text-gray-500 dark:text-gray-400 hidden"></p>
                        </div>

                        <div id="werkrooster-edit-form-container" class="hidden mt-6 space-y-6">
                            <div>
                                <label for="werkrooster-ingangsdatum" class="block text-sm font-medium mb-1">Nieuwe Ingangsdatum Werkrooster <span class="text-red-500">*</span></label>
                                <input type="date" id="werkrooster-ingangsdatum" name="ingangsdatum" class="form-input">
                            </div>
                            
                            <div class="werkrooster-edit-table-header grid grid-cols-4 gap-x-4 items-center mb-2 px-2 py-2 border-b">
                                <div class="text-sm font-semibold">Dag</div>
                                <div class="text-sm font-semibold">Starttijd</div>
                                <div class="text-sm font-semibold">Eindtijd</div>
                                <div class="text-sm font-semibold">Soort Dag</div>
                            </div>

                            <div id="werkrooster-input-rows" class="space-y-1">
                                <!-- Will be populated by JavaScript -->
                            </div>

                            <div class="flex justify-end space-x-3 mt-6">
                                <button type="button" id="annuleer-werkrooster-knop" class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg text-sm">Annuleren</button>
                                <button type="button" id="opslaan-werkrooster-knop" class="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg text-sm">Werkrooster Opslaan</button>
                            </div>
                            <div id="werkrooster-status-bericht" class="hidden mt-4 p-3 text-sm rounded-lg"></div>
                        </div>
                    </div>
                </form>
            </div>

            <div id="tab-content-instellingen" class="tab-content">
                <h2 class="text-xl font-semibold mb-4">Rooster Weergave Instellingen</h2>
                <form id="rooster-instellingen-form" class="space-y-6 p-6 rounded-lg shadow-md">
                    <div>
                        <label for="inst-thema" class="block text-sm font-medium mb-1">Thema Voorkeur</label>
                        <select id="inst-thema" name="soortWeergave" class="form-select">
                            <option value="dark">Donker Thema</option>
                            <option value="light">Licht Thema</option>
                        </select>
                    </div>
                    <div class="flex items-center">
                        <input id="inst-eigen-team" name="eigenTeamWeergeven" type="checkbox" class="h-4 w-4 text-blue-600 rounded focus:ring-blue-500">
                        <label for="inst-eigen-team" class="ml-2 block text-sm">Standaard alleen eigen team tonen in rooster</label>
                    </div>
                    <div class="flex items-center">
                        <input id="inst-weekenden" name="weekendenWeergeven" type="checkbox" class="h-4 w-4 text-blue-600 rounded focus:ring-blue-500">
                        <label for="inst-weekenden" class="ml-2 block text-sm">Weekenden (zaterdag/zondag) weergeven in het rooster</label>
                    </div>
                    <div class="pt-4 border-t">
                        <button type="submit" id="opslaan-instellingen-button" class="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            Instellingen Opslaan
                        </button>
                    </div>
                </form>
                <div id="instellingen-status-bericht" class="hidden mt-4 p-3 text-sm rounded-lg"></div>
            </div>
        </div>

        <footer class="text-center mt-8 md:mt-12 py-4 border-t">
            <a href="../Verlofrooster.aspx" class="text-sm hover:underline">
                &larr; Terug naar het Verlofrooster
            </a>
            <p class="text-xs mt-2">&copy; <span id="current-year"></span> Verlofrooster Applicatie</p>
        </footer>
    </div>

    <script src="../js/configLijst.js"></script>
    <script src="JS/gInstellingen_logic.js"></script>
</body>
</html>