<!DOCTYPE html>
<html lang="nl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Melding Maken - Verlofrooster</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/meldingMaken_styles.css">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        /* Custom scrollbar for webkit browsers (consistent with main page) */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        /* Scrollbar stijlen worden nu volledig beheerd door meldingMaken_styles.css voor thema-consistentie */

        /* Stijlen voor input velden in de modal (wordt ook in CSS-bestand gezet voor consistentie) */
        .modal-form-input {
            width: 100%;
            padding: 0.625rem; /* p-2.5 */
            border-radius: 0.375rem; /* rounded-md */
            border-width: 1px;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
    </style>
</head>

<body class="bg-gray-100 text-gray-800"> <div id="app-container" class="flex flex-col min-h-screen items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">

        <div class="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
            <header class="mb-6 text-center">
                <h1 id="form-title" class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Nieuwe Melding</h1>
                <p id="form-subtitle" class="text-gray-600 dark:text-gray-400 mt-1">Vul de onderstaande gegevens in.</p>
            </header>

            <form id="melding-form" class="space-y-6">

                <input type="hidden" id="melding-type" name="meldingType" value="">

                <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                    <legend class="text-sm font-semibold px-2 text-gray-700 dark:text-gray-300">Medewerker</legend>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="medewerker-naam" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Naam</label>
                            <input type="text" id="medewerker-naam" name="medewerkerNaam"
                                class="modal-form-input bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 cursor-not-allowed"
                                readonly>
                        </div>
                        <div>
                            <label for="medewerker-team" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team</label>
                            <input type="text" id="medewerker-team" name="medewerkerTeam"
                                class="modal-form-input bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 cursor-not-allowed"
                                readonly>
                        </div>
                    </div>
                </fieldset>

                <div id="verlof-velden" class="hidden space-y-4 melding-specifiek">
                    <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                        <legend class="text-sm font-semibold px-2 text-gray-700 dark:text-gray-300">Verlof Details</legend>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="start-datum" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startdatum *</label>
                                <input type="date" id="start-datum" name="startDatum"
                                    class="modal-form-input" required>
                            </div>
                            <div>
                                <label for="eind-datum" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Einddatum *</label>
                                <input type="date" id="eind-datum" name="eindDatum"
                                    class="modal-form-input" required>
                            </div>
                        </div>
                        <div class="mt-4">
                            <label for="verlof-reden" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reden *</label>
                            <select id="verlof-reden" name="verlofReden"
                                class="modal-form-input" required>
                                <option value="">Selecteer een reden...</option>
                            </select>
                        </div>
                        <div class="mt-4">
                            <label for="verlof-omschrijving" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Omschrijving (optioneel)</label>
                            <textarea id="verlof-omschrijving" name="verlofOmschrijving" rows="3"
                                class="modal-form-input"></textarea>
                        </div>
                    </fieldset>
                </div>

                <div id="compensatie-velden" class="hidden space-y-4 melding-specifiek">
                    <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                        <legend class="text-sm font-semibold px-2 text-gray-700 dark:text-gray-300">Compensatie Details</legend>
                         <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="compensatie-start-datum" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startdatum & tijd *</label>
                                <input type="datetime-local" id="compensatie-start-datum" name="compensatieStartDatum"
                                    class="modal-form-input" required>
                            </div>
                            <div>
                                <label for="compensatie-eind-datum" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Einddatum & tijd *</label>
                                <input type="datetime-local" id="compensatie-eind-datum" name="compensatieEindDatum"
                                    class="modal-form-input" required>
                            </div>
                        </div>
                        <div class="mt-4">
                            <label for="compensatie-uren-totaal" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Totaal uren (automatisch)</label>
                            <input type="text" id="compensatie-uren-totaal" name="compensatieUrenTotaal"
                                class="modal-form-input bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 cursor-not-allowed" readonly>
                        </div>
                        <div class="mt-4">
                            <label for="compensatie-omschrijving" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Omschrijving (bijv. project, reden) *</label>
                            <textarea id="compensatie-omschrijving" name="compensatieOmschrijving" rows="3"
                                class="modal-form-input" required></textarea>
                        </div>
                    </fieldset>
                </div>
                
                <div id="ziek-velden" class="hidden space-y-4 melding-specifiek">
                     <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                        <legend class="text-sm font-semibold px-2 text-gray-700 dark:text-gray-300">Ziek/Beter Melding</legend>
                        <div>
                            <label for="ziek-status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type melding *</label>
                            <select id="ziek-status" name="ziekStatus" class="modal-form-input" required>
                                <option value="ziek">Ik meld me ziek</option>
                                <option value="beter">Ik meld me beter</option>
                            </select>
                        </div>
                        <div id="ziek-start-datum-container" class="mt-4"> <label for="ziek-start-datum" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startdatum ziekte *</label>
                            <input type="date" id="ziek-start-datum" name="ziekStartDatum"
                                class="modal-form-input">
                        </div>
                         <div class="mt-4">
                            <label for="ziek-opmerking" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opmerking (optioneel)</label>
                            <textarea id="ziek-opmerking" name="ziekOpmerking" rows="3"
                                class="modal-form-input"></textarea>
                        </div>
                    </fieldset>
                </div>

                <div id="zittingvrij-velden" class="hidden space-y-4 melding-specifiek">
                     <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                        <legend class="text-sm font-semibold px-2 text-gray-700 dark:text-gray-300">Incidenteel Zittingvrij</legend>
                         <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="zittingvrij-start-datum" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startdatum & tijd *</label>
                                <input type="datetime-local" id="zittingvrij-start-datum" name="zittingvrijStartDatum"
                                    class="modal-form-input" required>
                            </div>
                            <div>
                                <label for="zittingvrij-eind-datum" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Einddatum & tijd *</label>
                                <input type="datetime-local" id="zittingvrij-eind-datum" name="zittingvrijEindDatum"
                                    class="modal-form-input" required>
                            </div>
                        </div>
                        <div class="mt-4">
                            <label for="zittingvrij-opmerking" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opmerking *</label>
                            <textarea id="zittingvrij-opmerking" name="zittingvrijOpmerking" rows="3"
                                class="modal-form-input" required></textarea>
                        </div>
                    </fieldset>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-gray-300 dark:border-gray-600">
                    <button type="button" id="annuleren-button"
                        class="text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                        Annuleren
                    </button>
                    <button type="submit" id="indienen-button"
                        class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                        Indienen
                    </button>
                </div>
            </form>
            
            <div id="status-bericht" class="hidden mt-6 p-4 text-sm rounded-lg">
                </div>

        </div>
         <footer class="text-center mt-8 text-xs text-gray-500 dark:text-gray-400">
            <p>&copy; <span id="current-year"></span> Verlofrooster Applicatie</p>
            <p><a href="../Verlofrooster.html" class="hover:underline text-blue-600 dark:text-blue-400">Terug naar het rooster</a></p>
        </footer>
    </div>

    <script src="../js/configLijst.js"></script> 
    <script src="JS/meldingMaken_logic.js"></script>
</body>
</html>
