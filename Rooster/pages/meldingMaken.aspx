<!DOCTYPE html>
<html lang="nl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feedback Geven - Verlofrooster</title>
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

        /* Scrollbar stijlen worden nu volledig beheerd door meldFouten_styles.css voor thema-consistentie */

        /* Stijlen voor input velden in de modal (wordt ook in CSS-bestand gezet voor consistentie) */
        .modal-form-input {
            width: 100%;
            padding: 0.625rem;
            /* p-2.5 */
            border-radius: 0.375rem;
            /* rounded-md */
            border-width: 1px;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            /* shadow-sm */
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
    </style>
</head>

<body class="bg-gray-100 text-gray-800">
    <div id="app-container"
        class="flex flex-col min-h-screen items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">

        <div class="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8 relative">
            <button id="theme-toggle" type="button" title="Toggle theme"
                class="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 z-10">
                <svg id="theme-toggle-dark-icon" class="hidden w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z">
                    </path>
                </svg>
                <svg id="theme-toggle-light-icon" class="hidden w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 10.607a1 1 0 011.414-1.414l-.707-.707a1 1 0 01-1.414 1.414l.707.707zm12.728 0l.707-.707a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        fill-rule="evenodd" clip-rule="evenodd"></path>
                </svg>
            </button>
            <header class="mb-6 text-center">
                <h1 id="form-title"
                    class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Feedback Geven</h1>
                <p id="form-subtitle"
                    class="text-gray-600 dark:text-gray-400 mt-1">Laat ons weten wat er misgaat of beter kan.</p>
            </header>

            <form id="melding-form" class="space-y-6">

                <input type="hidden" id="melding-type" name="meldingType" value="Feedback">

                <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                    <legend class="text-sm font-semibold px-2 text-gray-700 dark:text-gray-300">Medewerker</legend>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="medewerker-naam"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Naam</label>
                            <input type="text" id="medewerker-naam" name="medewerkerNaam"
                                class="modal-form-input bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 cursor-not-allowed"
                                readonly>
                        </div>
                        <div>
                            <label for="medewerker-team"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team</label>
                            <input type="text" id="medewerker-team" name="medewerkerTeam"
                                class="modal-form-input bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 cursor-not-allowed"
                                readonly>
                        </div>
                    </div>
                </fieldset>

                <div id="feedback-velden" class="space-y-4 melding-specifiek">
                    <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                        <legend class="text-sm font-semibold px-2 text-gray-700 dark:text-gray-300">Feedback Details
                        </legend>

                        <input type="hidden" id="feedback-titel" name="feedbackTitel">

                        <div>
                            <label for="feedback-waarfout"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Waar ging het
                                mis (pagina/onderdeel)?</label>
                            <input type="text" id="feedback-waarfout" name="feedbackWaarFout"
                                class="modal-form-input input-active dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                list="fout-locaties" placeholder="Bijv. VerlofRooster pagina, Profielkaart">
                            <datalist id="fout-locaties">
                                <option value="VerlofRooster pagina"></option>
                                <option value="Profielkaart"></option>
                                <option value="Melding maken"></option>
                                <option value="Admin Centrum"></option>
                                <option value="Beheer Centrum"></option>
                                <option value="Algemeen"></option>
                            </datalist>
                        </div>
                        <div class="mt-4">
                            <label for="feedback-beschrijving"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Wat er mis
                                gaat/wat beter kan: *</label>
                            <textarea id="feedback-beschrijving" name="feedbackBeschrijving" rows="4"
                                class="modal-form-input input-active dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required></textarea>
                        </div>
                    </fieldset>
                </div>

                <div id="verlof-velden" class="hidden space-y-4 melding-specifiek">
                    <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                        <legend class="text-sm font-semibold px-2 text-gray-700 dark:text-gray-300">Verlof Details
                        </legend>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="start-datum"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startdatum
                                    *</label>
                                <input type="date" id="start-datum" name="startDatum" class="modal-form-input" required>
                            </div>
                            <div>
                                <label for="eind-datum"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Einddatum
                                    *</label>
                                <input type="date" id="eind-datum" name="eindDatum" class="modal-form-input" required>
                            </div>
                        </div>
                        <div class="mt-4">
                            <label for="verlof-reden"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reden *</label>
                            <select id="verlof-reden" name="verlofReden" class="modal-form-input" required>
                                <option value="">Selecteer een reden...</option>
                            </select>
                        </div>
                        <div class="mt-4">
                            <label for="verlof-omschrijving"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Omschrijving
                                (optioneel)</label>
                            <textarea id="verlof-omschrijving" name="verlofOmschrijving" rows="3"
                                class="modal-form-input"></textarea>
                        </div>
                    </fieldset>
                </div>

                <div id="compensatie-velden" class="hidden space-y-4 melding-specifiek">
                    <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                        <legend class="text-sm font-semibold px-2 text-gray-700 dark:text-gray-300">Compensatie Details
                        </legend>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="compensatie-start-datum"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startdatum &
                                    tijd *</label>
                                <input type="datetime-local" id="compensatie-start-datum" name="compensatieStartDatum"
                                    class="modal-form-input" required>
                            </div>
                            <div>
                                <label for="compensatie-eind-datum"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Einddatum &
                                    tijd *</label>
                                <input type="datetime-local" id="compensatie-eind-datum" name="compensatieEindDatum"
                                    class="modal-form-input" required>
                            </div>
                        </div>
                        <div class="mt-4">
                            <label for="compensatie-uren-totaal"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Totaal uren
                                (automatisch)</label>
                            <input type="text" id="compensatie-uren-totaal" name="compensatieUrenTotaal"
                                class="modal-form-input bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 cursor-not-allowed"
                                readonly>
                        </div>
                        <div class="mt-4">
                            <label for="compensatie-omschrijving"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Omschrijving
                                (bijv. project, reden) *</label>
                            <textarea id="compensatie-omschrijving" name="compensatieOmschrijving" rows="3"
                                class="modal-form-input" required></textarea>
                        </div>
                    </fieldset>
                </div>

                <div id="ziek-velden" class="hidden space-y-4 melding-specifiek">
                    <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                        <legend class="text-sm font-semibold px-2 text-gray-700 dark:text-gray-300">Ziek/Beter Melding
                        </legend>
                        <div>
                            <label for="ziek-status"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type melding
                                *</label>
                            <select id="ziek-status" name="ziekStatus" class="modal-form-input" required>
                                <option value="ziek">Ik meld me ziek</option>
                                <option value="beter">Ik meld me beter</option>
                            </select>
                        </div>
                        <div id="ziek-start-datum-container" class="mt-4"> <label for="ziek-start-datum"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startdatum
                                ziekte *</label>
                            <input type="date" id="ziek-start-datum" name="ziekStartDatum" class="modal-form-input">
                        </div>
                        <div class="mt-4">
                            <label for="ziek-opmerking"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opmerking
                                (optioneel)</label>
                            <textarea id="ziek-opmerking" name="ziekOpmerking" rows="3"
                                class="modal-form-input"></textarea>
                        </div>
                    </fieldset>
                </div>

                <div id="zittingvrij-velden" class="hidden space-y-4 melding-specifiek">
                    <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                        <legend class="text-sm font-semibold px-2 text-gray-700 dark:text-gray-300">Incidenteel
                            Zittingvrij</legend>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="zittingvrij-start-datum"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startdatum &
                                    tijd *</label>
                                <input type="datetime-local" id="zittingvrij-start-datum" name="zittingvrijStartDatum"
                                    class="modal-form-input" required>
                            </div>
                            <div>
                                <label for="zittingvrij-eind-datum"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Einddatum &
                                    tijd *</label>
                                <input type="datetime-local" id="zittingvrij-eind-datum" name="zittingvrijEindDatum"
                                    class="modal-form-input" required>
                            </div>
                        </div>
                        <div class="mt-4">
                            <label for="zittingvrij-opmerking"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opmerking
                                *</label>
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

            <!-- Sectie voor het tonen van bestaande feedback -->
            <section id="bestaande-feedback-sectie" class="mt-12 pt-8 border-t border-gray-300 dark:border-gray-600">
                <h2 class="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                    Ingediende Feedback
                </h2>
                <div id="feedback-loading-indicator" class="text-center py-4">
                    <p class="text-gray-600 dark:text-gray-400">Feedback items laden...</p>
                    <!-- Optional: Add a spinner SVG or animation here -->
                </div>
                <div id="feedback-items-container" class="space-y-4">
                    <!-- Feedback items will be dynamically inserted here -->
                </div>
                <div id="geen-feedback-bericht" class="hidden text-center py-4">
                    <p class="text-gray-600 dark:text-gray-400">Er zijn momenteel geen feedback items ingediend.</p>
                </div>
            </section>
            <!-- Einde sectie bestaande feedback -->

            <div id="status-bericht" class="hidden mt-6 p-4 text-sm rounded-lg"></div>

        </div>
        <footer class="text-center mt-8 text-xs text-gray-500 dark:text-gray-400">
            <p>&copy; <span id="current-year"></span> Verlofrooster Applicatie</p>
            <p><a href="../verlofRooster.aspx"
                    class="hover:underline text-blue-600 dark:text-blue-400">Terug naar het
                    rooster</a></p>
        </footer>
    </div>

    <script src="../js/configLijst.js"></script>
    <script src="../js/theme-toggle.js"></script>
    <script src="JS/meldingMaken_logic.js"></script>
</body>

</html>