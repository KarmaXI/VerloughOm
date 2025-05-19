// /workspaces/VerloughOm/Rooster/pages/js/meldingMaken_logic.js
// Logic for the feedback submission page (meldingMaken.aspx)

// Ensure this script is loaded after configLijst.js and theme-toggle.js

document.addEventListener('DOMContentLoaded', function () {
    // Initialize theme toggle functionality from theme-toggle.js
    if (typeof window.initializeThemeToggle === 'function') {
        window.initializeThemeToggle();
    } else {
        console.warn('initializeThemeToggle function not found. Theme toggle might not work.');
    }

    const meldingForm = document.getElementById('melding-form');
    const medewerkerNaamInput = document.getElementById('medewerker-naam');
    const medewerkerTeamInput = document.getElementById('medewerker-team');
    const feedbackTitelInput = document.getElementById('feedback-titel'); // Hidden field for SP List Title
    const feedbackWaarFoutInput = document.getElementById('feedback-waarfout');
    const feedbackBeschrijvingInput = document.getElementById('feedback-beschrijving');
    const statusBerichtDiv = document.getElementById('status-bericht');
    const annulerenButton = document.getElementById('annuleren-button');
    const currentYearSpan = document.getElementById('current-year');
    const meldingTypeInput = document.getElementById('melding-type'); // To confirm it's 'Feedback'

    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Function to display status messages
    function showStatusMessage(message, type = 'success') {
        if (!statusBerichtDiv) return;
        statusBerichtDiv.innerHTML = message; // Use innerHTML to allow links if needed
        statusBerichtDiv.className = 'mt-6 p-4 text-sm rounded-lg'; // Reset classes
        if (type === 'success') {
            statusBerichtDiv.classList.add('status-success'); // Classes from meldFouten_styles.css
        } else if (type === 'error') {
            statusBerichtDiv.classList.add('status-error');
        } else if (type === 'info') {
            statusBerichtDiv.classList.add('status-info');
        }
        statusBerichtDiv.classList.remove('hidden');
        // Auto-hide after a delay, unless it's an error that needs attention
        if (type !== 'error') {
            setTimeout(() => {
                statusBerichtDiv.classList.add('hidden');
            }, 7000);
        }
    }

    let currentUser = null;

    async function initializePageData() {
        // Attempt to get current user details
        // This might come from a global object set by a master page, or an API call
        // For this project, it seems `machtigingen.js` might provide `getCurrentUser()`
        if (typeof window.getCurrentUser === 'function') {
            currentUser = await window.getCurrentUser(); // Assuming getCurrentUser might be async
        } else if (window.Machtigingen && typeof window.Machtigingen.getCurrentUser === 'function') {
            currentUser = await window.Machtigingen.getCurrentUser();
        } else {
            console.warn('getCurrentUser function not found. Attempting fallback or direct SP call.');
            // Fallback: try to get from _spPageContextInfo or a direct API call if necessary
            // This part would need to be robust and align with how user context is typically fetched in this ASPX environment
            // For now, we'll simulate a user if no method is found, for development
            // currentUser = { NormalizedUsername: "test.gebruiker", Team: "Test Team", Id: 1 };
            // showStatusMessage('Kon gebruikersinformatie niet automatisch laden. Probeer de pagina te vernieuwen.', 'error');
        }
        
        // If still no current user, try to fetch via initializeMeldingContext or similar from existing logic
        if (!currentUser && typeof initializeMeldingContext === 'function') {
            const contextOK = await initializeMeldingContext(); // from existing meldingMaken_logic.js
            if (contextOK && typeof huidigeGebruikerMelding !== 'undefined') {
                currentUser = {
                    NormalizedUsername: huidigeGebruikerMelding.normalizedUsername,
                    Team: huidigeGebruikerMelding.medewerkerData ? huidigeGebruikerMelding.medewerkerData.Team : 'Onbekend',
                    Id: huidigeGebruikerMelding.Id,
                    Title: huidigeGebruikerMelding.Title
                };
            }
        }

        if (currentUser && currentUser.NormalizedUsername) {
            if (medewerkerNaamInput) medewerkerNaamInput.value = currentUser.Title || currentUser.NormalizedUsername;
            if (feedbackTitelInput) feedbackTitelInput.value = currentUser.NormalizedUsername; // Autofill hidden Titel field for SP List
            if (medewerkerTeamInput && currentUser.Team) medewerkerTeamInput.value = currentUser.Team;
        } else {
            if (medewerkerNaamInput) medewerkerNaamInput.value = 'Onbekend';
            if (medewerkerTeamInput) medewerkerTeamInput.value = 'Onbekend';
            showStatusMessage('Fout: Kon gebruikersinformatie niet laden. Feedback kan mogelijk niet correct worden toegewezen.', 'error');
        }

        // Ensure the correct form section is visible (Feedback)
        // Hide all sections first, then show the feedback one.
        document.querySelectorAll('.melding-specifiek').forEach(el => el.classList.add('hidden'));
        const feedbackVeldenDiv = document.getElementById('feedback-velden');
        if (feedbackVeldenDiv) {
            feedbackVeldenDiv.classList.remove('hidden');
        } else {
            console.error('Element met ID "feedback-velden" niet gevonden.');
            showStatusMessage('Fout: Feedback formulier sectie niet gevonden.', 'error');
        }
        if (meldingTypeInput) {
            meldingTypeInput.value = 'Feedback'; // Set the hidden type field
        }
    }

    initializePageData();
    loadAndDisplayFeedbackItems(); // Call the new function to load feedback

    // --- Form Submission ---
    if (meldingForm) {
        meldingForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            
            if (!feedbackBeschrijvingInput.value.trim()) {
                showStatusMessage('Vul a.u.b. een beschrijving in voor uw feedback.', 'error');
                feedbackBeschrijvingInput.focus();
                return;
            }

            showStatusMessage('Feedback verzenden...', 'info');
            const submitButton = document.getElementById('indienen-button');
            if(submitButton) submitButton.disabled = true;

            if (!currentUser || !currentUser.NormalizedUsername) {
                showStatusMessage('Fout: Gebruikersinformatie niet beschikbaar. Kan feedback niet verzenden.', 'error');
                if(submitButton) submitButton.disabled = false;
                return;
            }

            const feedbackData = {
                // Id is auto-generated by SharePoint
                Titel: feedbackTitelInput.value || currentUser.NormalizedUsername, // Autofilled with NormalizedUsername
                Beschrijving: feedbackBeschrijvingInput.value,
                WaarFout: feedbackWaarFoutInput.value || 'Niet gespecificeerd',
                // MedewerkerId: currentUser.Id, // If you have a Person field for the user
                // Status: 'Nieuw' // Default status, can be set by SharePoint default value too
            };

            try {
                const listName = "MeldFouten"; // As defined in configLijst.js for feedback
                let itemAdded = false;

                // Check for global SharePoint utility functions (e.g., from machtigingen.js or a shared SP script)
                if (typeof window.createSPListItem === 'function') {
                    await window.createSPListItem(listName, feedbackData);
                    itemAdded = true;
                } else if (typeof window.addItemToSPList === 'function') { // Alternative common name
                     await window.addItemToSPList(listName, feedbackData);
                     itemAdded = true;
                } else {
                    // Fallback: Basic REST API call if no utility function is found
                    // This requires spWebAbsoluteUrlMelding to be set (e.g., by initializeMeldingContext)
                    if (!window.spWebAbsoluteUrlMelding && typeof initializeMeldingContext === 'function') {
                        await initializeMeldingContext(); // Ensure context is loaded
                    }
                    if (!window.spWebAbsoluteUrlMelding) {
                         throw new Error('SharePoint site URL is niet beschikbaar.');
                    }
                    
                    const listConfig = getLijstConfig(listName); // Get GUID if available
                    const targetListUrl = `${window.spWebAbsoluteUrlMelding.replace(/\/$/, "")}/_api/web/lists${listConfig && listConfig.lijstId ? `(guid'${listConfig.lijstId}')` : `/getByTitle('${listName}')`}/items`;
                    
                    let requestDigest = null;
                    if(typeof window.getRequestDigestGlobally === 'function'){
                        requestDigest = await window.getRequestDigestGlobally();
                    } else {
                        // Minimal request digest fetch
                        const digestResponse = await fetch(`${window.spWebAbsoluteUrlMelding.replace(/\/$/, "")}/_api/contextinfo`, {
                            method: 'POST',
                            headers: { 'Accept': 'application/json;odata=verbose' }
                        });
                        if (!digestResponse.ok) throw new Error('Kon request digest niet ophalen.');
                        const digestData = await digestResponse.json();
                        requestDigest = digestData.d.GetContextWebInformation.FormDigestValue;
                    }

                    if (!requestDigest) throw new Error('Request digest is ongeldig.');

                    const response = await fetch(targetListUrl, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json;odata=verbose',
                            'Content-Type': 'application/json;odata=verbose',
                            'X-RequestDigest': requestDigest
                        },
                        body: JSON.stringify({ '__metadata': { 'type': `SP.Data.${listName.charAt(0).toUpperCase() + listName.slice(1)}ListItem` }, ...feedbackData })
                        // Note: The exact 'type' string (e.g., 'SP.Data.MeldFoutenListItem') might need adjustment based on your list internal name.
                        // If 'MeldFouten' is the display name and internal is different, this needs care.
                        // Often, SharePoint is flexible, but for robustness, get the ListItemEntityTypeFullName from list properties if issues arise.
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => null);
                        throw new Error(`SharePoint API fout: ${response.statusText} - ${errorData ? JSON.stringify(errorData) : 'Onbekende serverfout'}`);
                    }
                    itemAdded = true;
                }

                if (itemAdded) {
                    showStatusMessage('Feedback succesvol verzonden! Bedankt.<br>U kunt dit venster sluiten of <a href="../verlofRooster.aspx" class="font-bold hover:underline">terugkeren naar het rooster</a>.', 'success');
                    meldingForm.reset();
                    // Re-populate read-only/hidden fields after reset
                    if (currentUser && currentUser.NormalizedUsername) {
                        if (medewerkerNaamInput) medewerkerNaamInput.value = currentUser.Title || currentUser.NormalizedUsername;
                        if (feedbackTitelInput) feedbackTitelInput.value = currentUser.NormalizedUsername;
                        if (medewerkerTeamInput && currentUser.Team) medewerkerTeamInput.value = currentUser.Team;
                    }
                } else {
                     throw new Error('Item toevoegen mislukt, geen methode uitgevoerd.');
                }

            } catch (error) {
                console.error('Error submitting feedback:', error);
                showStatusMessage(`Fout bij het verzenden van feedback: ${error.message || error}`, 'error');
            } finally {
                if(submitButton) submitButton.disabled = false;
            }
        });
    }

    // --- Annuleren Button ---
    if (annulerenButton) {
        annulerenButton.addEventListener('click', function () {
            // Redirect to the main rooster page
            window.location.href = '../verlofRooster.aspx';
        });
    }

    // --- Load and Display Existing Feedback Items ---
    async function loadAndDisplayFeedbackItems() {
        const container = document.getElementById('feedback-items-container');
        const loadingIndicator = document.getElementById('feedback-loading-indicator');
        const geenFeedbackBericht = document.getElementById('geen-feedback-bericht');

        if (!container || !loadingIndicator || !geenFeedbackBericht) {
            console.error('DOM elementen voor feedback weergave niet gevonden.');
            showStatusMessage('Fout: Kan feedback items niet weergeven op de pagina.', 'error');
            return;
        }

        loadingIndicator.classList.remove('hidden');
        container.innerHTML = ''; // Clear previous items
        geenFeedbackBericht.classList.add('hidden');

        try {
            const listName = "MeldFouten";
            let feedbackItems = [];

            // Ensure SharePoint context is available (especially spWebAbsoluteUrlMelding)
            if (!window.spWebAbsoluteUrlMelding && typeof initializeMeldingContext === 'function') {
                await initializeMeldingContext();
            }
            if (!window.spWebAbsoluteUrlMelding && typeof initializeSharePointContextViaAPI === 'function' && !window.spWebAbsoluteUrl) {
                // If machtigingen.js's context is primary and not yet run
                await initializeSharePointContextViaAPI();
                window.spWebAbsoluteUrlMelding = window.spWebAbsoluteUrl; // Align URLs
            }
             if (!window.spWebAbsoluteUrlMelding && window.spWebAbsoluteUrl) { // If machtigingen.js already ran
                window.spWebAbsoluteUrlMelding = window.spWebAbsoluteUrl;
            }


            if (!window.spWebAbsoluteUrlMelding) {
                throw new Error('SharePoint site URL is niet beschikbaar voor het ophalen van feedback.');
            }

            // Check for global SharePoint utility functions
            if (typeof window.getLijstItemsAlgemeen === 'function') {
                // Assuming getLijstItemsAlgemeen can take list name and optional queries
                // We need to ensure 'MeldFouten' is a valid key for getLijstConfig within getLijstItemsAlgemeen
                // Or adapt to use list title directly if getLijstItemsAlgemeen supports it.
                // For now, let's assume 'MeldFouten' is a key in sharepointLijstConfiguraties
                 // Fields to retrieve: Titel (User), Beschrijving, WaarFout, Status, Created, Author/Title (for user who created)
                // ModifiedById, Modified, Editor/Title (for user who last modified), Antwoord
                // Ensure your SharePoint list 'MeldFouten' has these fields.
                const selectFields = "$select=Id,Titel,Beschrijving,WaarFout,Status,Antwoord,Created,Modified,Author/Title,Editor/Title";
                const expandFields = "$expand=Author,Editor"; // Expand to get user names
                const orderBy = "$orderby=Created desc"; // Show newest first
                feedbackItems = await window.getLijstItemsAlgemeen("MeldFouten", selectFields, "", expandFields, orderBy);

            } else {
                // Fallback: Basic REST API call
                const listConfig = getLijstConfig(listName);
                const targetListUrl = `${window.spWebAbsoluteUrlMelding.replace(/\/$/, "")}/_api/web/lists${listConfig && listConfig.lijstId ? `(guid\'${listConfig.lijstId}\')` : `/getByTitle(\'${listName}\')`}/items?$select=Id,Titel,Beschrijving,WaarFout,Status,Antwoord,Created,Modified,Author/Title,Editor/Title&$expand=Author,Editor&$orderby=Created desc`;

                const response = await fetch(targetListUrl, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json;odata=verbose' }
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(`SharePoint API fout bij ophalen feedback: ${response.statusText} - ${errorData ? JSON.stringify(errorData) : 'Onbekende serverfout'}`);
                }
                const data = await response.json();
                feedbackItems = data.d.results;
            }

            loadingIndicator.classList.add('hidden');

            if (feedbackItems && feedbackItems.length > 0) {
                // Check user permissions for editing/replying
                let canUserManageFeedback = false;
                if (window.huidigeGebruiker && window.huidigeGebruiker.sharePointGroepen) {
                    // Assuming UI_SECTION_PERMISSIONS is available globally from machtigingen.js
                    // And "MeldFoutenBeheer" is a defined section key for managing feedback
                    if (typeof window.heeftGebruikerMachtiging === 'function') {
                         // Define a permission section for feedback management if it doesn't exist
                         if (!window.UI_SECTION_PERMISSIONS) window.UI_SECTION_PERMISSIONS = {};
                         if (!window.UI_SECTION_PERMISSIONS.MeldFoutenBeheer) {
                             window.UI_SECTION_PERMISSIONS.MeldFoutenBeheer = ["1. Sharepoint beheer"];
                         }
                        canUserManageFeedback = window.heeftGebruikerMachtiging("MeldFoutenBeheer", window.huidigeGebruiker.sharePointGroepen);
                    } else {
                        // Fallback if heeftGebruikerMachtiging is not available: check group directly
                        canUserManageFeedback = window.huidigeGebruiker.sharePointGroepen.includes("1. Sharepoint beheer");
                    }
                } else if (currentUser && currentUser.isSiteAdmin) { // Fallback for site admins if group check fails
                    canUserManageFeedback = true;
                }


                feedbackItems.forEach(item => {
                    const itemDiv = createFeedbackItemElement(item, canUserManageFeedback);
                    container.appendChild(itemDiv);
                });
            } else {
                geenFeedbackBericht.classList.remove('hidden');
            }

        } catch (error) {
            console.error('Error loading feedback items:', error);
            loadingIndicator.classList.add('hidden');
            showStatusMessage(`Fout bij het laden van feedback items: ${error.message}`, 'error');
            geenFeedbackBericht.classList.remove('hidden'); // Show "no items" as a fallback message
            geenFeedbackBericht.textContent = 'Kon feedback items niet laden. Probeer het later opnieuw.';
        }
    }

    function createFeedbackItemElement(item, canManage) {
        const div = document.createElement('div');
        div.className = 'feedback-item bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-all duration-300 ease-in-out hover:shadow-md';
        // Use item.Id for a unique ID if needed, e.g., div.id = `feedback-${item.Id}`;

        const createdDate = item.Created ? new Date(item.Created).toLocaleString('nl-NL') : 'Onbekend';
        const modifiedDate = item.Modified ? new Date(item.Modified).toLocaleString('nl-NL') : createdDate;
        const authorName = item.Author ? item.Author.Title : (item.Titel || 'Anoniem'); // Titel field was used for username
        const editorName = item.Editor ? item.Editor.Title : authorName;

        let statusClass = '';
        let statusText = item.Status || 'Nieuw';
        switch (statusText.toLowerCase()) {
            case 'nieuw': statusClass = 'status-nieuw'; break;
            case 'in behandeling': statusClass = 'status-in-behandeling'; break;
            case 'opgelost': statusClass = 'status-opgelost'; break;
            case 'afgewezen': statusClass = 'status-afgewezen'; break;
            default: statusClass = 'status-onbekend';
        }

        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="text-lg font-semibold text-primary-600 dark:text-primary-400">${item.WaarFout || 'Algemene Feedback'}</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        Ingediend door: ${authorName} op ${createdDate}
                        ${ item.Modified && new Date(item.Modified).getTime() !== new Date(item.Created).getTime() ? 
                            ` (Bewerkt door: ${editorName} op ${modifiedDate})` : '' }
                    </p>
                </div>
                <span class="status-indicator ${statusClass} text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>
            </div>
            <p class="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">${item.Beschrijving || 'Geen beschrijving.'}</p>
            ${item.Antwoord ? `
                <div class="antwoord-sectie mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h4 class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Antwoord:</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">${item.Antwoord}</p>
                </div>
            ` : ''}
            ${canManage ? `
                <div class="feedback-acties mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-right space-x-2">
                    <button data-id="${item.Id}" class="btn-feedback-edit text-sm py-1 px-3 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors">Bewerken</button>
                    <button data-id="${item.Id}" class="btn-feedback-reply text-sm py-1 px-3 rounded bg-green-500 hover:bg-green-600 text-white transition-colors">Beantwoorden</button>
                    <select data-id="${item.Id}" class="select-feedback-status text-sm py-1 px-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500">
                        <option value="Nieuw" ${statusText === 'Nieuw' ? 'selected' : ''}>Nieuw</option>
                        <option value="In behandeling" ${statusText === 'In behandeling' ? 'selected' : ''}>In behandeling</option>
                        <option value="Opgelost" ${statusText === 'Opgelost' ? 'selected' : ''}>Opgelost</option>
                        <option value="Afgehandeld" ${statusText === 'Afgehandeld' ? 'selected' : ''}>Afgehandeld</option>
                        <option value="Afgezien" ${statusText === 'Afgezien' ? 'selected' : ''}>Afgezien</option>
                    </select>
                </div>
            ` : ''}
        `;

        // Add event listeners for action buttons if they exist
        if (canManage) {
            const editButton = div.querySelector('.btn-feedback-edit');
            const replyButton = div.querySelector('.btn-feedback-reply');
            const statusSelect = div.querySelector('.select-feedback-status');

            if (editButton) {
                editButton.addEventListener('click', () => handleEditFeedback(item.Id, item.Beschrijving, item.WaarFout));
            }
            if (replyButton) {
                replyButton.addEventListener('click', () => handleReplyFeedback(item.Id, item.Antwoord));
            }
            if (statusSelect) {
                statusSelect.addEventListener('change', (e) => handleChangeFeedbackStatus(item.Id, e.target.value));
            }
        }
        return div;
    }

    // Placeholder functions for managing feedback - these would need full implementation
    // (e.g., opening a modal, calling SharePoint update functions)
    async function handleEditFeedback(itemId, currentBeschrijving, currentWaarFout) {
        // For simplicity, using prompt. In a real app, use a modal.
        const newWaarFout = prompt("Bewerk 'Waar ging het mis':", currentWaarFout);
        const newBeschrijving = prompt("Bewerk de beschrijving:", currentBeschrijving);

        if (newWaarFout !== null || newBeschrijving !== null) {
            const updateData = {};
            if (newWaarFout !== null && newWaarFout !== currentWaarFout) updateData.WaarFout = newWaarFout;
            if (newBeschrijving !== null && newBeschrijving !== currentBeschrijving) updateData.Beschrijving = newBeschrijving;
            
            if (Object.keys(updateData).length > 0) {
                await updateFeedbackItem(itemId, updateData, "Feedback item bijgewerkt.");
            }
        }
    }

    async function handleReplyFeedback(itemId, currentAntwoord) {
        const antwoord = prompt("Geef een antwoord op de feedback:", currentAntwoord || "");
        if (antwoord !== null) { // User didn't cancel prompt
            await updateFeedbackItem(itemId, { Antwoord: antwoord }, "Feedback beantwoord.");
        }
    }

    async function handleChangeFeedbackStatus(itemId, newStatus) {
        await updateFeedbackItem(itemId, { Status: newStatus }, `Status bijgewerkt naar: ${newStatus}.`);
    }

    async function updateFeedbackItem(itemId, dataToUpdate, successMessage) {
        showStatusMessage('Bezig met bijwerken...', 'info');
        try {
            const listName = "MeldFouten";
            // Ensure SharePoint context is available
            if (!window.spWebAbsoluteUrlMelding && typeof initializeMeldingContext === 'function') {
                await initializeMeldingContext();
            }
             if (!window.spWebAbsoluteUrlMelding && window.spWebAbsoluteUrl) {
                window.spWebAbsoluteUrlMelding = window.spWebAbsoluteUrl;
            }

            if (!window.spWebAbsoluteUrlMelding) {
                throw new Error('SharePoint site URL is niet beschikbaar voor update.');
            }

            let itemUpdated = false;
            if (typeof window.updateSPListItem === 'function') { // Ideal: a global update function
                await window.updateSPListItem(listName, itemId, dataToUpdate);
                itemUpdated = true;
            } else {
                // Fallback: Basic REST API call for UPDATE (MERGE)
                const listConfig = getLijstConfig(listName);
                const targetItemUrl = `${window.spWebAbsoluteUrlMelding.replace(/\/$/, "")}/_api/web/lists${listConfig && listConfig.lijstId ? `(guid\'${listConfig.lijstId}\')` : `/getByTitle(\'${listName}\')`}/items(${itemId})`;
                
                let requestDigest = null;
                if(typeof window.getRequestDigestGlobally === 'function'){
                    requestDigest = await window.getRequestDigestGlobally();
                } else {
                    const digestResponse = await fetch(`${window.spWebAbsoluteUrlMelding.replace(/\/$/, "")}/_api/contextinfo`, {
                        method: 'POST', headers: { 'Accept': 'application/json;odata=verbose' }
                    });
                    if (!digestResponse.ok) throw new Error('Kon request digest niet ophalen voor update.');
                    const digestData = await digestResponse.json();
                    requestDigest = digestData.d.GetContextWebInformation.FormDigestValue;
                }
                if (!requestDigest) throw new Error('Request digest is ongeldig voor update.');

                const response = await fetch(targetItemUrl, {
                    method: 'POST', // MERGE for partial update
                    headers: {
                        'Accept': 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose',
                        'X-RequestDigest': requestDigest,
                        'IF-MATCH': '*', // Overwrite item unconditionally
                        'X-HTTP-Method': 'MERGE'
                    },
                    body: JSON.stringify({ '__metadata': { 'type': `SP.Data.${listName.charAt(0).toUpperCase() + listName.slice(1)}ListItem` }, ...dataToUpdate })
                });

                if (!response.ok && response.status !== 204) { // 204 No Content is success for MERGE
                    const errorData = await response.json().catch(() => null);
                    throw new Error(`SharePoint API fout bij bijwerken: ${response.statusText} - ${errorData ? JSON.stringify(errorData) : 'Onbekende serverfout'}`);
                }
                itemUpdated = true;
            }

            if(itemUpdated){
                showStatusMessage(successMessage, 'success');
                loadAndDisplayFeedbackItems(); // Refresh the list
            } else {
                throw new Error('Item bijwerken mislukt, geen methode uitgevoerd.');
            }

        } catch (error) {
            console.error('Error updating feedback item:', error);
            showStatusMessage(`Fout bij bijwerken: ${error.message}`, 'error');
        }
    }


});

// Minimal polyfill for String.prototype.replaceAll if not available (older browsers)
if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function(str, newStr){
        // If a regex pattern
        if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
            return this.replace(str, newStr);
        }
        // If a string
        return this.replace(new RegExp(str, 'g'), newStr);
    };
}

// Helper function to get list configuration (assuming it's defined in configLijst.js)
// This is a simplified version. The actual getLijstConfig might be more complex.
function getLijstConfig(lijstKey) {
    if (typeof sharepointLijstConfiguraties !== 'undefined' && sharepointLijstConfiguraties[lijstKey]) {
        return sharepointLijstConfiguraties[lijstKey];
    }
    console.warn(`[meldingMaken_logic] Kon lijstconfiguratie niet vinden voor: ${lijstKey}`);
    return null; // Return null or a default config if appropriate
}

// Placeholder for initializeMeldingContext if it's not defined elsewhere but needed by initializePageData
// This would typically be part of the broader application's context management.
// If the original meldingMaken_logic.js (for other melding types) is not loaded, this might be needed.
if (typeof initializeMeldingContext === 'undefined') {
    async function initializeMeldingContext() {
        console.log("[Feedback Logic] initializeMeldingContext placeholder called.");
        // This function would be responsible for setting up spWebAbsoluteUrlMelding and huidigeGebruikerMelding
        // if they are not available from a parent/opener window or a global scope.
        // For feedback, we primarily need the current user's NormalizedUsername.
        // A more robust implementation would check window.opener, window.parent, then try _spPageContextInfo, then API.
        if (typeof _spPageContextInfo !== 'undefined') {
            window.spWebAbsoluteUrlMelding = _spPageContextInfo.webAbsoluteUrl;
            window.huidigeGebruikerMelding = {
                loginNaam: _spPageContextInfo.userLoginName,
                Id: _spPageContextInfo.userId,
                Title: _spPageContextInfo.userDisplayName,
                Email: _spPageContextInfo.userEmail,
                normalizedUsername: (_spPageContextInfo.userLoginName || '').substring((_spPageContextInfo.userLoginName || '').lastIndexOf('|') + 1),
                medewerkerData: { Team: 'Nog op te halen' } // Team might need separate fetch
            };
            console.log("[Feedback Logic] Context initialized from _spPageContextInfo.");
            return true;
        }
        // Add more sophisticated context fetching here if _spPageContextInfo is not available.
        console.warn("[Feedback Logic] _spPageContextInfo not available, user context might be incomplete.");
        return false;
    }
}
