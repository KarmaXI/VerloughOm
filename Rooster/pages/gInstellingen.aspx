<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gebruikersinstellingen - Verlofrooster</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/gInstellingen_styles.css">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f5f7fa;
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #a0aec0; }
        
        body.dark-theme ::-webkit-scrollbar-track { background: #2d3748; }
        body.dark-theme ::-webkit-scrollbar-thumb { background: #4a5568; }
        body.dark-theme ::-webkit-scrollbar-thumb:hover { background: #718096; }

        /* Improved tab styling */
        .tab-button {
            position: relative;
            transition: all 0.2s ease-in-out;
        }
        .tab-button::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 3px;
            background: #3b82f6;
            transition: all 0.2s ease-in-out;
            transform: translateX(-50%);
            border-radius: 3px 3px 0 0;
        }
        .tab-button.active::after {
            width: 80%;
        }
        .tab-button:hover::after {
            width: 40%;
        }
        .tab-button.active {
            font-weight: 600;
            color: #3b82f6;
        }
        
        .tab-content {
            display: none;
            animation: fadeIn 0.3s ease-out;
        }
        .tab-content.active {
            display: block;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .form-input, .form-select, .form-textarea {
            width: 100%;
            padding: 0.625rem 0.75rem;
            border-radius: 0.5rem;
            border-width: 1px;
            transition: all 0.2s ease;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .form-input:focus, .form-select:focus, .form-textarea:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
            outline: none;
        }
        
        /* Dark mode form styles */
        body.dark-theme .form-input, 
        body.dark-theme .form-select, 
        body.dark-theme .form-textarea {
            background-color: #2d3748;
            border-color: #4a5568;
            color: #e2e8f0;
        }
        
        body.dark-theme .form-input:focus, 
        body.dark-theme .form-select:focus, 
        body.dark-theme .form-textarea:focus {
            border-color: #4299e1;
            box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.3);
        }
        
        /* Custom switch styling */
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 42px;
            height: 24px;
        }
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #cbd5e0;
            transition: .3s;
            border-radius: 24px;
        }
        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .3s;
            border-radius: 50%;
        }
        input:checked + .toggle-slider {
            background-color: #3b82f6;
        }
        input:checked + .toggle-slider:before {
            transform: translateX(18px);
        }
        
        /* Profile picture styles */
        .profile-picture-container {
            width: 110px;
            height: 110px;
            border-radius: 50%;
            background-color: #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            margin-bottom: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 3px solid white;
            transition: all 0.3s ease;
        }
        
        .profile-picture-container:hover {
            box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
        }
        
        .profile-picture-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        body.dark-theme .profile-picture-container {
            background-color: #4b5563;
            border-color: #374151;
        }
        
        /* Status message styling */
        .status-message {
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
            animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Improved button styles */
        .btn {
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-weight: 500;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .btn:active {
            transform: translateY(0);
        }
        
        .btn-primary {
            background-color: #3b82f6;
            color: white;
        }
        
        .btn-primary:hover {
            background-color: #2563eb;
        }
        
        .btn-secondary {
            background-color: #9ca3af;
            color: white;
        }
        
        .btn-secondary:hover {
            background-color: #6b7280;
        }
        
        .btn-success {
            background-color: #10b981;
            color: white;
        }
        
        .btn-success:hover {
            background-color: #059669;
        }
        
        /* Work schedule table styling */
        .schedule-table {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
            border-radius: 0.5rem;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .schedule-table thead th {
            background-color: #f3f4f6;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .schedule-table tbody tr {
            transition: all 0.2s ease;
        }
        
        .schedule-table tbody tr:hover {
            background-color: rgba(59, 130, 246, 0.05);
        }
        
        .schedule-table tbody td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #e5e7eb;
        }
        
        body.dark-theme .schedule-table thead th {
            background-color: #374151;
            border-bottom-color: #4b5563;
            color: #e5e7eb;
        }
        
        body.dark-theme .schedule-table tbody tr:hover {
            background-color: rgba(59, 130, 246, 0.1);
        }
        
        body.dark-theme .schedule-table tbody td {
            border-bottom-color: #4b5563;
        }
        
        /* Card styling */
        .card {
            background-color: white;
            border-radius: 0.75rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            border: 1px solid #e5e7eb;
        }
        
        .card:hover {
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }
        
        body.dark-theme .card {
            background-color: #1f2937;
            border-color: #374151;
        }
    </style>
</head>
<body class="bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300"> 
    <div id="app-container" class="container mx-auto p-4 md:p-6 max-w-4xl">
        <header class="mb-8">
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Gebruikersinstellingen</h1>
                <a href="../Verlofrooster.aspx" class="btn btn-secondary text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Terug naar Verlofrooster
                </a>
            </div>
            <p class="text-gray-600 dark:text-gray-300">Beheer hier uw persoonlijke gegevens en rooster voorkeuren.</p>
        </header>

        <div class="mb-6 border-b dark:border-gray-700">
            <nav class="flex space-x-1 md:space-x-6" aria-label="Tabs">
                <button data-tab="persoonlijk" class="tab-button active py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Persoonlijke Gegevens & Werkdagen
                </button>
                <button data-tab="instellingen" class="tab-button py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    Rooster Instellingen
                </button>
            </nav>
        </div>

        <div>
            <div id="tab-content-persoonlijk" class="tab-content active">
                <h2 class="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Persoonlijke Gegevens
                </h2>
                <form id="persoonlijke-gegevens-form" class="space-y-6 p-6 rounded-lg shadow-md card">
                    <div class="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-6">
                        <div class="profile-picture-container mb-4 sm:mb-0">
                            <img id="pg-profile-pic" src="" alt="Profielfoto" class="transition-all duration-300">
                        </div>
                        <div class="flex-grow space-y-4 w-full">
                            <div>
                                <label for="pg-naam" class="block text-sm font-medium mb-1">Volledige Naam</label>
                                <input type="text" id="pg-naam" name="naam" class="form-input mt-1 bg-white dark:bg-gray-700">
                            </div>
                            <div>
                                <label for="pg-username" class="block text-sm font-medium mb-1">Gebruikersnaam (Login)</label>
                                <input type="text" id="pg-username" name="username" class="form-input mt-1 cursor-not-allowed opacity-75 bg-gray-100 dark:bg-gray-800" readonly>
                            </div>
                            <div>
                                <label for="pg-email" class="block text-sm font-medium mb-1">E-mailadres</label>
                                <input type="email" id="pg-email" name="email" class="form-input mt-1 cursor-not-allowed opacity-75 bg-gray-100 dark:bg-gray-800" readonly>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="pg-team" class="block text-sm font-medium mb-1">Team</label>
                                    <select id="pg-team" name="team" class="form-select mt-1 bg-white dark:bg-gray-700">
                                        <option value="">Laden...</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="pg-functie" class="block text-sm font-medium mb-1">Functie</label>
                                    <select id="pg-functie" name="functie" class="form-select mt-1 bg-white dark:bg-gray-700">
                                        <option value="">Laden...</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="pt-4 flex justify-end">
                        <button type="button" id="opslaan-persoonlijke-gegevens-knop" class="btn btn-success">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                            Persoonlijke Gegevens Opslaan
                        </button>
                    </div>
                    <div id="persoonlijke-gegevens-status-bericht" class="hidden status-message"></div>

                    <div class="pt-6 border-t dark:border-gray-700">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                Standaard Werkdagen en Tijden
                            </h3>
                            <button type="button" id="wijzig-werkrooster-knop" class="btn btn-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                Wijzig Werkrooster
                            </button>
                        </div>
                        <p class="text-sm mb-4 text-gray-600 dark:text-gray-400">Hieronder ziet u uw huidige standaard werkrooster. Klik op "Wijzig Werkrooster" om aanpassingen te maken.</p>

                        <!-- New table layout for viewing current schedule -->
                        <div id="werkdagen-display-container" class="rounded-lg overflow-x-auto bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                            <table class="schedule-table min-w-full">
                                <thead class="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" class="w-1/4">Dag</th>
                                        <th scope="col" class="w-1/2">Werktijden</th>
                                        <th scope="col" class="w-1/4">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 dark:divide-gray-700" id="werkdagen-tabel-body">
                                    <tr>
                                        <td colspan="3" class="py-4 text-center text-gray-500 dark:text-gray-400">Werkrooster informatie wordt geladen...</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p id="rooster-geldig-vanaf" class="text-xs p-3 text-gray-500 dark:text-gray-400 hidden italic"></p>
                        </div>

                        <div id="werkrooster-edit-form-container" class="hidden mt-6 space-y-6 p-6 rounded-lg shadow-md card">
                            <div>
                                <label for="werkrooster-ingangsdatum" class="block text-sm font-medium mb-1">Nieuwe Ingangsdatum Werkrooster <span class="text-red-500">*</span></label>
                                <input type="date" id="werkrooster-ingangsdatum" name="ingangsdatum" class="form-input bg-white dark:bg-gray-700">
                            </div>
                            
                            <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                <div class="werkrooster-edit-table-header grid grid-cols-4 gap-x-4 items-center p-3 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 font-medium text-sm">
                                    <div>Dag</div>
                                    <div>Starttijd</div>
                                    <div>Eindtijd</div>
                                    <div>Soort Dag</div>
                                </div>

                                <div id="werkrooster-input-rows" class="space-y-1 p-3 bg-white dark:bg-gray-800">
                                    <!-- Will be populated by JavaScript -->
                                </div>
                            </div>

                            <div class="flex justify-end space-x-3 mt-6">
                                <button type="button" id="annuleer-werkrooster-knop" class="btn btn-secondary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    Annuleren
                                </button>
                                <button type="button" id="opslaan-werkrooster-knop" class="btn btn-success">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                    Werkrooster Opslaan
                                </button>
                            </div>
                            <div id="werkrooster-status-bericht" class="hidden status-message"></div>
                        </div>
                    </div>
                </form>
            </div>

            <div id="tab-content-instellingen" class="tab-content">
                <h2 class="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    Rooster Weergave Instellingen
                </h2>
                <form id="rooster-instellingen-form" class="space-y-6 p-6 rounded-lg shadow-md card">
                    <div>
                        <label for="inst-thema" class="block text-sm font-medium mb-2">Thema Voorkeur</label>
                        <select id="inst-thema" name="soortWeergave" class="form-select bg-white dark:bg-gray-700">
                            <option value="dark">Donker Thema</option>
                            <option value="light">Licht Thema</option>
                        </select>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <label for="inst-eigen-team" class="text-sm">Standaard alleen eigen team tonen in rooster</label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="inst-eigen-team" name="eigenTeamWeergeven">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <label for="inst-weekenden" class="text-sm">Weekenden (zaterdag/zondag) weergeven in het rooster</label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="inst-weekenden" name="weekendenWeergeven">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="pt-4 border-t dark:border-gray-700">
                        <button type="submit" id="opslaan-instellingen-button" class="btn btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                            Instellingen Opslaan
                        </button>
                    </div>
                </form>
                <div id="instellingen-status-bericht" class="hidden status-message"></div>
            </div>
        </div>

        <footer class="text-center mt-12 py-4 border-t dark:border-gray-700">
            <a href="../Verlofrooster.aspx" class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Terug naar het Verlofrooster
            </a>
            <p class="text-xs text-gray-500 dark:text-gray-400">&copy; <span id="current-year"></span> Verlofrooster Applicatie</p>
        </footer>
    </div>

    <script src="../js/configLijst.js"></script>
    <script src="JS/gInstellingen_logic.js"></script>
</body>
</html>