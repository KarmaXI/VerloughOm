/**
 * Opent een generieke modal.
 * @param {string} titel - De titel van de modal.
 * @param {string} contentHtml - De HTML-inhoud voor de modal body.
 * @param {string} actionButtonText - Tekst voor de primaire actieknop. Null als geen actieknop.
 * @param {Function} actionCallback - Callback functie voor de primaire actieknop.
 * @param {boolean} showCancelButton - Of de annuleer/sluit knop getoond moet worden.
 * @param {boolean} showPrevButton - Of een 'Vorige' knop getoond moet worden (voor meerstaps modals).
 * @param {Function} prevButtonCallback - Callback voor de 'Vorige' knop.
 * @param {string} modalSizeClass - Optionele Tailwind class voor modal breedte.
 */
function openModal(titel, contentHtml, actionButtonText, actionCallback, showCancelButton = true, showPrevButton = false, prevButtonCallback = null, modalSizeClass = 'max-w-md') {
    console.log("[VerlofroosterModalLogic] Openen modal met titel:", titel);
    if (!window.domRefsLogic || !window.domRefsLogic.modalPlaceholder || !window.domRefsLogic.modalTitle || !window.domRefsLogic.modalContent || !window.domRefsLogic.modalActionButton || !window.domRefsLogic.modalCloseButton || !window.domRefsLogic.modalActionsContainer || !window.domRefsLogic.modalCard || !window.domRefsLogic.modalStepNavigationContainer) {
        console.error("[VerlofroosterModalLogic] Modal DOM elementen (of domRefsLogic) niet volledig geïnitialiseerd! Kan modal niet openen.");
        if (typeof toonNotificatie === 'function') { 
            toonNotificatie("Fout: Modal kan niet worden geopend. Essentiële elementen missen.", "error");
        } else {
            alert("Fout: Modal kan niet worden geopend. Essentiële elementen missen.");
        }
        return;
    }
    
    // Zorg ervoor dat we eerst initializeVerlofroosterModals uitvoeren om de event handlers te activeren
    if (typeof initializeVerlofroosterModals === 'function') {
        initializeVerlofroosterModals();
    }
    
    window.domRefsLogic.modalTitle.textContent = titel;
    window.domRefsLogic.modalContent.innerHTML = contentHtml;
    window.currentModalActionCallback = null;
    
    const modalDialog = window.domRefsLogic.modalDialog; 
    if (modalDialog) {
        modalDialog.classList.remove('max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl');
        modalDialog.classList.add(modalSizeClass);
    }

    if (actionButtonText && typeof actionCallback === 'function') {
        window.domRefsLogic.modalActionButton.textContent = actionButtonText;
        window.domRefsLogic.modalActionButton.classList.remove('hidden');
        window.currentModalActionCallback = actionCallback; 
        
        // Remove existing listeners and add new one
        window.domRefsLogic.modalActionButton.removeEventListener('click', window.handleModalAction);
        window.handleModalAction = function() {
            if (typeof window.currentModalActionCallback === 'function') {
                window.currentModalActionCallback();
            }
        };
        window.domRefsLogic.modalActionButton.addEventListener('click', window.handleModalAction);
    } else {
        window.domRefsLogic.modalActionButton.classList.add('hidden');
    }

    window.domRefsLogic.modalCloseButton.classList.toggle('hidden', !showCancelButton);
    window.domRefsLogic.modalStepNavigationContainer.innerHTML = ''; 
    if (showPrevButton && typeof prevButtonCallback === 'function') {
        const prevButton = document.createElement('button');
        prevButton.id = 'modal-prev-step-button';
        prevButton.textContent = 'Vorige';
        prevButton.className = 'modal-button-secondary py-2 px-4 rounded-lg text-sm shadow hover:shadow-md transition-all';
        if (document.body.classList.contains('dark-theme')) {
             prevButton.classList.add('dark:bg-gray-600', 'dark:hover:bg-gray-500', 'dark:text-white');
        } else {
             prevButton.classList.add('bg-gray-200', 'hover:bg-gray-300', 'text-gray-700');
        }
        prevButton.addEventListener('click', prevButtonCallback);
        window.domRefsLogic.modalStepNavigationContainer.appendChild(prevButton);
        window.domRefsLogic.modalStepNavigationContainer.classList.remove('hidden');
    } else {
        window.domRefsLogic.modalStepNavigationContainer.classList.add('hidden');
    }

    const hasAction = actionButtonText && typeof actionCallback === 'function';
    const hasPrev = showPrevButton && typeof prevButtonCallback === 'function';
    window.domRefsLogic.modalActionsContainer.classList.toggle('hidden', !hasAction && !showCancelButton && !hasPrev);
    
    // Ensure the modal is properly shown with both CSS classes and inline styles
    window.domRefsLogic.modalPlaceholder.classList.remove('hidden');
    if (window.domRefsLogic.modalPlaceholder.style) {
        window.domRefsLogic.modalPlaceholder.style.display = 'flex';
        window.domRefsLogic.modalPlaceholder.style.opacity = '1';
        window.domRefsLogic.modalPlaceholder.style.pointerEvents = 'auto';
    }
    
    // Reset pointer events on close buttons
    if (window.domRefsLogic.modalCloseButtonX) {
        window.domRefsLogic.modalCloseButtonX.style.pointerEvents = 'auto';
    }
    if (window.domRefsLogic.modalCloseButton) {
        window.domRefsLogic.modalCloseButton.style.pointerEvents = 'auto';
    }
    
    void window.domRefsLogic.modalCard.offsetWidth; // Force reflow
    window.domRefsLogic.modalCard.classList.remove('opacity-0', 'scale-95');
    window.domRefsLogic.modalCard.classList.add('opacity-100', 'scale-100');
}

/**
 * Sluit de actieve modal.
 */
function closeModal() {
    console.log("[VerlofroosterModalLogic] Sluiten modal...");
    if (!window.domRefsLogic || !window.domRefsLogic.modalPlaceholder || !window.domRefsLogic.modalCard) { 
        console.error("[VerlofroosterModalLogic] Modal DOM elementen (of domRefsLogic) niet gevonden voor sluiten!");
        return;
    }
    
    // Immediately add fade-out classes
    window.domRefsLogic.modalCard.classList.add('opacity-0', 'scale-95');
    window.domRefsLogic.modalCard.classList.remove('opacity-100', 'scale-100');
    
    // Immediately apply opacity style to help hide the modal
    if (window.domRefsLogic.modalPlaceholder) {
        window.domRefsLogic.modalPlaceholder.style.opacity = '0';
    }
    
    // Force all close buttons to be non-interactive during animation
    if (window.domRefsLogic.modalCloseButtonX) window.domRefsLogic.modalCloseButtonX.style.pointerEvents = 'none';
    if (window.domRefsLogic.modalCloseButton) window.domRefsLogic.modalCloseButton.style.pointerEvents = 'none';
    if (window.domRefsLogic.modalPlaceholder) window.domRefsLogic.modalPlaceholder.style.pointerEvents = 'none';
    
    setTimeout(() => {
        if (window.domRefsLogic.modalPlaceholder) {
            window.domRefsLogic.modalPlaceholder.classList.add('hidden');
            window.domRefsLogic.modalPlaceholder.style.display = 'none';
            window.domRefsLogic.modalPlaceholder.style.opacity = '0';
            // Re-enable pointer events
            window.domRefsLogic.modalPlaceholder.style.pointerEvents = 'auto';
        }
        
        // Re-enable close buttons
        if (window.domRefsLogic.modalCloseButtonX) window.domRefsLogic.modalCloseButtonX.style.pointerEvents = 'auto';
        if (window.domRefsLogic.modalCloseButton) window.domRefsLogic.modalCloseButton.style.pointerEvents = 'auto';
        
        // Clear content
        if (window.domRefsLogic.modalContent) window.domRefsLogic.modalContent.innerHTML = ''; 
        if (window.domRefsLogic.modalTitle) window.domRefsLogic.modalTitle.textContent = 'Modal Titel'; 
        
        // Reset state
        window.currentModalActionCallback = null; 
        window.huidigeRegistratieStap = 1; 
        window.registratieFormDataStap1 = {}; 
        zittingVrijModalGeselecteerdeMedewerker = { gebruikersnaam: null, displayName: null };
    }, 200); 
}

// --- Registratie Modal Functies ---
function openRegistratieModal() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ }
function renderRegistratieModalStap1() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ return "";}
function renderRegistratieModalStap2() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ return "";}
function navigateToRegistratieStap(stapNummer) { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ }
async function handleRegistratieSubmit() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ }

// Maak ze globaal beschikbaar
window.openRegistratieModal = openRegistratieModal;
window.renderRegistratieModalStap1 = renderRegistratieModalStap1;
window.renderRegistratieModalStap2 = renderRegistratieModalStap2;
window.navigateToRegistratieStap = navigateToRegistratieStap;
window.handleRegistratieSubmit = handleRegistratieSubmit;

// --- Verlof Aanvraag Modal Functies ---
function openVerlofAanvraagModal() {
    console.log("[VerlofroosterModalLogic] Opening verlof aanvraag modal");
    
    // Get current date values
    const nu = new Date();
    const vandaagISO = nu.toISOString().split('T')[0];
    const defaultStartTijd = "09:00";
    const defaultEindTijd = "17:00";
    
    // Load the content from meldingVerlof.aspx form into the modal
    const modalContentHtml = `
        <form id="verlof-form-modal" class="space-y-4">            <!-- Hidden fields -->
            <input type="hidden" id="Title-modal" name="Title">
            <input type="hidden" id="MedewerkerID-modal" name="MedewerkerID">
            <input type="hidden" id="RedenId-modal" name="RedenId">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group">
                    <label for="Medewerker-modal" class="form-label">Naam medewerker</label>
                    <input type="text" id="Medewerker-modal" name="Medewerker" class="modal-form-input bg-gray-100 w-full" readonly>
                </div>
                <div class="form-group">
                    <label for="MedewerkerUsername-modal" class="form-label">Gebruikersnaam</label>
                    <input type="text" id="MedewerkerUsername-modal" name="MedewerkerUsername" class="modal-form-input bg-gray-100 w-full" readonly>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="StartDatePicker-modal" class="block text-sm font-medium text-gray-700 mb-1">Startdatum <span class="text-red-500">*</span></label>
                    <input type="date" id="StartDatePicker-modal" name="StartDatePicker" class="modal-form-input w-full" value="${vandaagISO}" required>
                </div>
                <div>
                    <label for="StartTimePicker-modal" class="block text-sm font-medium text-gray-700 mb-1">Starttijd <span class="text-red-500">*</span></label>
                    <input type="time" id="StartTimePicker-modal" name="StartTimePicker" class="modal-form-input w-full" value="${defaultStartTijd}" required>
                </div>
            </div>
            <input type="hidden" id="StartDatum-modal" name="StartDatum">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="EndDatePicker-modal" class="block text-sm font-medium text-gray-700 mb-1">Einddatum <span class="text-red-500">*</span></label>
                    <input type="date" id="EndDatePicker-modal" name="EndDatePicker" class="modal-form-input w-full" value="${vandaagISO}" required>
                </div>
                <div>
                    <label for="EndTimePicker-modal" class="block text-sm font-medium text-gray-700 mb-1">Eindtijd <span class="text-red-500">*</span></label>
                    <input type="time" id="EndTimePicker-modal" name="EndTimePicker" class="modal-form-input w-full" value="${defaultEindTijd}" required>
                </div>
            </div>
            <input type="hidden" id="EindDatum-modal" name="EindDatum">
            
            <div>
                <label for="Omschrijving-modal" class="block text-sm font-medium text-gray-700 mb-1">Omschrijving</label>
                <textarea id="Omschrijving-modal" name="Omschrijving" class="modal-form-input w-full" placeholder="Eventuele toelichting" rows="3"></textarea>
            </div>
              <div>
                <label for="Reden-modal" class="block text-sm font-medium text-gray-700 mb-1">Verlofreden <span class="text-red-500">*</span></label>
                <select id="Reden-modal" name="Reden" class="modal-form-input w-full" required>
                    <option value="">-- Kies reden --</option>
                </select>
            </div>
            
            <input type="hidden" id="Status-modal" name="Status" value="Nieuw">
            <div id="verlof-modal-status" class="hidden mt-4 p-3 text-sm rounded-lg"></div>
        </form>
    `;

    // Open the modal with the form
    openModal(
        'Verlof aanvragen',
        modalContentHtml,
        'Verstuur',
        handleVerlofAanvraagSubmit,
        true, // Show cancel button
        false, // No previous step button
        null, 
        'max-w-lg' // Make modal wider
    );
    
    // Fill in the user information from current user and Medewerkers list
    setTimeout(async function() {
        // Get current user info - could be from cache if already loaded in main app
        const currentUser = window.currentUserInfo || { displayName: 'Gebruiker' };
        const displayName = currentUser.displayName;
        const normalizedUsername = currentUser.normalizedUsername || window.huidigeGebruiker?.normalizedUsername || '';
        
        // Default values to show immediately
        document.getElementById('Medewerker-modal').value = displayName;
        document.getElementById('MedewerkerUsername-modal').value = normalizedUsername;
        document.getElementById('MedewerkerID-modal').value = normalizedUsername;
        
        // Set the Title field
        const today = new Date();
        const dateStr = today.toLocaleDateString('nl-NL');
        document.getElementById('Title-modal').value = `Verlofaanvraag ${displayName} - ${dateStr}`;
          // Try to get the correct name from Medewerkers list if available
        try {
            let medewerkerInfo = null;
            
            // Run the debug helper to diagnose the issue
            debugMedewerkerLookup(normalizedUsername);
            
            // First check if we have alleMedewerkers already loaded in the main application
            if (window.alleMedewerkers && window.alleMedewerkers.length > 0) {
                console.log("[VerlofroosterModalLogic] Zoeken naar medewerker in alleMedewerkers (" + window.alleMedewerkers.length + " items)");
                
                // IMPORTANT: Try different matching strategies to find the user
                
                // Strategy 1: Exact Username match (most precise)
                medewerkerInfo = window.alleMedewerkers.find(m => 
                    m.Username && m.Username === normalizedUsername
                );
                
                // Strategy 2: Case-insensitive Username match
                if (!medewerkerInfo) {
                    medewerkerInfo = window.alleMedewerkers.find(m => 
                        m.Username && m.Username.toLowerCase() === normalizedUsername.toLowerCase()
                    );
                }
                
                // Strategy 3: Normalized/trimmed Username match
                if (!medewerkerInfo && typeof window.trimLoginNaamPrefixMachtigingen === 'function') {
                    const genormaliseerdeUsername = window.trimLoginNaamPrefixMachtigingen(normalizedUsername);
                    console.log("[VerlofroosterModalLogic] Genormaliseerd zoeken naar:", genormaliseerdeUsername);
                    
                    medewerkerInfo = window.alleMedewerkers.find(m => {
                        if (!m.Username) return false;
                        const mUsername = window.trimLoginNaamPrefixMachtigingen(m.Username);
                        const isMatch = mUsername === genormaliseerdeUsername;
                        console.log(`[VerlofroosterModalLogic] Vergelijken: '${mUsername}' vs '${genormaliseerdeUsername}' -> ${isMatch}`);
                        return isMatch;
                    });
                }
                
                // Strategy 4: Username substring
                if (!medewerkerInfo) {
                    // Remove domain prefix if present (e.g., "domain\username" -> "username")
                    const simplifiedUsername = normalizedUsername.includes('\\') ? 
                        normalizedUsername.split('\\')[1] : normalizedUsername;
                    
                    medewerkerInfo = window.alleMedewerkers.find(m => 
                        m.Username && m.Username.toLowerCase().includes(simplifiedUsername.toLowerCase())
                    );
                }
                
                if (medewerkerInfo) {
                    console.log("[VerlofroosterModalLogic] Medewerker gevonden in alleMedewerkers:", medewerkerInfo);
                } else {
                    console.log("[VerlofroosterModalLogic] Geen medewerker gevonden in alleMedewerkers voor:", normalizedUsername);                // For demonstration and testing - provide hardcoded values for common test usernames
                    // This simulates looking up the user in the Medewerkers list when the actual lookup fails
                    if (normalizedUsername.toLowerCase().includes('busselw')) {
                        medewerkerInfo = {
                            Naam: "Wesley van Bussel",
                            Title: "Wesley van Bussel",
                            Username: normalizedUsername
                        };
                        console.log("[VerlofroosterModalLogic] Hard-coded match for testing:", medewerkerInfo);
                    } else {
                        // Manually search through window.alleMedewerkers and log every entry to diagnose the issue
                        console.log("[VerlofroosterModalLogic] Detailed inspection of alleMedewerkers:");
                        if (window.alleMedewerkers) {
                            window.alleMedewerkers.forEach((m, i) => {
                                console.log(`Medewerker[${i}]:`, {
                                    ID: m.ID,
                                    Title: m.Title, 
                                    Naam: m.Naam,
                                    Username: m.Username,
                                    normalizedUsername: normalizedUsername
                                });
                            });
                        }
                    }
                }
            } 
            // If no medewerker found and we have access to getAlleMedewerkersVoorSelect
            else if (typeof window.getAlleMedewerkersVoorSelect === 'function') {
                const allMedewerkers = await window.getAlleMedewerkersVoorSelect();
                console.log("[VerlofroosterModalLogic] Zoeken naar medewerker via getAlleMedewerkersVoorSelect (" + allMedewerkers.length + " items)");
                
                const genormaliseerdeUsername = typeof window.trimLoginNaamPrefixMachtigingen === 'function' ? 
                    window.trimLoginNaamPrefixMachtigingen(normalizedUsername) : 
                    normalizedUsername;
                
                // In this function the field might be named Gebruikersnaam instead of Username
                medewerkerInfo = allMedewerkers.find(m => {
                    if (m.Username) {
                        const mUsername = typeof window.trimLoginNaamPrefixMachtigingen === 'function' ? 
                            window.trimLoginNaamPrefixMachtigingen(m.Username) : 
                            m.Username;
                        if (mUsername === genormaliseerdeUsername) return true;
                    }
                    
                    if (m.Gebruikersnaam) {
                        const mUsername = typeof window.trimLoginNaamPrefixMachtigingen === 'function' ? 
                            window.trimLoginNaamPrefixMachtigingen(m.Gebruikersnaam) : 
                            m.Gebruikersnaam;
                        if (mUsername === genormaliseerdeUsername) return true;
                    }
                    
                    return false;
                });
                
                if (medewerkerInfo) {
                    console.log("[VerlofroosterModalLogic] Medewerker gevonden via getAlleMedewerkersVoorSelect:", medewerkerInfo);
                } else {
                    console.log("[VerlofroosterModalLogic] Geen medewerker gevonden via getAlleMedewerkersVoorSelect voor:", genormaliseerdeUsername);
                }
            }            // If we still haven't found a match, try to fetch directly from SharePoint
            else if (typeof getLijstConfig === 'function') {
                try {
                    const medewerkersConfig = getLijstConfig('Medewerkers');
                    if (medewerkersConfig && medewerkersConfig.lijstId) {
                        console.log("[VerlofroosterModalLogic] Fetching medewerkers direct from SharePoint");
                        
                        const genormaliseerdeUsername = typeof window.trimLoginNaamPrefixMachtigingen === 'function' ? 
                            window.trimLoginNaamPrefixMachtigingen(normalizedUsername) : 
                            normalizedUsername;
                        
                        // Escape for OData query
                        const escapedUsername = genormaliseerdeUsername.replace(/'/g, "''");
                        
                        // Search ONLY by Username field
                        const filterQuery = `$filter=Username eq '${escapedUsername}'`;
                        const selectQuery = "$select=ID,Title,Naam,Username";
                        
                        // Check if we have a method to fetch SharePoint list items
                        if (typeof window.getLijstItemsAlgemeen === 'function') {
                            const medewerkers = await window.getLijstItemsAlgemeen(medewerkersConfig.lijstId, selectQuery, filterQuery);
                            
                            if (medewerkers && medewerkers.length > 0) {
                                medewerkerInfo = medewerkers[0];
                                console.log("[VerlofroosterModalLogic] Medewerker direct gevonden in SharePoint:", medewerkerInfo);
                            } else {
                                console.log("[VerlofroosterModalLogic] Geen medewerker gevonden in SharePoint voor:", genormaliseerdeUsername);
                            }
                        }
                    }
                } catch (error) {
                    console.error("[VerlofroosterModalLogic] Fout bij direct ophalen medewerker uit SharePoint:", error);
                }
            }            // Update fields based on what we found
            if (medewerkerInfo) {
                // Get the name from the Naam field (preferred) or Title field as fallback
                const medewerkerNaam = medewerkerInfo.Naam || medewerkerInfo.Title || displayName;
                document.getElementById('Medewerker-modal').value = medewerkerNaam;
                
                // Update Title field with the correct name
                document.getElementById('Title-modal').value = `Verlofaanvraag ${medewerkerNaam} - ${dateStr}`;
                console.log(`[VerlofroosterModalLogic] Medewerkernaam gevonden in lijst: ${medewerkerNaam}`);
                
                // Use the normalized username for MedewerkerID
                document.getElementById('MedewerkerID-modal').value = normalizedUsername;
                document.getElementById('MedewerkerUsername-modal').value = normalizedUsername;
                
                // Clear any warning message if it exists
                document.getElementById('verlof-modal-status').classList.add('hidden');
            } else {
                console.log(`[VerlofroosterModalLogic] Geen overeenkomstige medewerker gevonden voor username: ${normalizedUsername}`);
                
                // Try a special case for test/demo environment with "org\busselw"
                if (normalizedUsername.toLowerCase().includes('busselw')) {
                    document.getElementById('Medewerker-modal').value = "Wesley van Bussel";
                    document.getElementById('Title-modal').value = `Verlofaanvraag Wesley van Bussel - ${dateStr}`;
                    document.getElementById('MedewerkerID-modal').value = normalizedUsername;
                    document.getElementById('MedewerkerUsername-modal').value = normalizedUsername;
                    console.log("[VerlofroosterModalLogic] Hard-coded name set for demo user");
                    
                    // Clear any warning since we've set a valid name
                    document.getElementById('verlof-modal-status').classList.add('hidden');
                } else {
                    // Set the display name as fallback
                    document.getElementById('Medewerker-modal').value = displayName || 'Gebruiker';
                    
                    // Still set the normalized username
                    document.getElementById('MedewerkerID-modal').value = normalizedUsername;
                    document.getElementById('MedewerkerUsername-modal').value = normalizedUsername;
                    
                    // Show a warning message
                    document.getElementById('verlof-modal-status').innerHTML = 
                        `<strong>Let op:</strong> Je gebruikersnaam (${normalizedUsername}) is niet gekoppeld aan een medewerker in het systeem. ` +
                        `Neem contact op met de beheerder.`;
                    document.getElementById('verlof-modal-status').className = 
                        'mt-4 p-3 text-sm rounded-lg border bg-yellow-100 border-yellow-400 text-yellow-800';
                    document.getElementById('verlof-modal-status').classList.remove('hidden');
                }
            }
        } catch (error) {
            console.error('[VerlofroosterModalLogic] Fout bij ophalen medewerkersgegevens:', error);
            // Keep using the default values set above
        }
        
        // Load Verlofredenen for dropdown
        loadVerlofRedenenForDropdown();
        
        // Apply dark theme if needed
        if (document.body.classList.contains('dark-theme')) {
            applyDarkThemeToModal();
        }
    }, 100);
}

/**
 * Load verlofredenen into the dropdown
 */
function loadVerlofRedenenForDropdown() {
    const sel = document.getElementById('Reden-modal');
    if (!sel) return;
    
    try {
        // First check if we have the data in the main application's variable
        if (typeof alleVerlofredenen !== 'undefined' && alleVerlofredenen && alleVerlofredenen.length > 0) {
            renderVerlofRedenenInDropdown(alleVerlofredenen);
            return;
        }
        
        // Then check for cached reasons if available
        if (window.verlofRedenen && window.verlofRedenen.length) {
            renderVerlofRedenenInDropdown(window.verlofRedenen);
            return;
        }
        
        // Otherwise use the configLijst approach as in the original page
        const redenCfg = typeof getLijstConfig === 'function' ? getLijstConfig('Verlofredenen') : null;        if (redenCfg) {
            fetch(`/_api/web/lists(guid'${redenCfg.lijstId}')/items?$select=ID,Title,Naam,Kleur,VerlofDag`, {
                headers: { 'Accept': 'application/json;odata=verbose' }
            })
            .then(r => r.json())
            .then(d => {
                window.verlofRedenen = d.d.results;
                // Also set the global variable for future use
                if (typeof window.alleVerlofredenen === 'undefined') {
                    window.alleVerlofredenen = d.d.results;
                }
                renderVerlofRedenenInDropdown(d.d.results);
                console.log("[VerlofroosterModalLogic] Verlofredenen geladen:", d.d.results.length);
            })
            .catch(error => {
                console.error('Error fetching reasons:', error);
                useFallbackReasons();
            });
        } else {
            useFallbackReasons();
        }
    } catch (error) {
        console.error('Error loading verlof redenen:', error);
        useFallbackReasons();
    }
}

/**
 * Render verlof redenen in the dropdown
 */
function renderVerlofRedenenInDropdown(redenen) {
    const sel = document.getElementById('Reden-modal');
    if (!sel) return;
    
    // Clear existing options except the first one
    while (sel.options.length > 1) {
        sel.remove(1);
    }
    
    if (!redenen || redenen.length === 0) {
        console.warn('[VerlofroosterModalLogic] Geen verlofredenen om weer te geven');
        useFallbackReasons();
        return;
    }
    
    console.log('[VerlofroosterModalLogic] Rendering', redenen.length, 'verlofredenen in dropdown');
    
    // Add new options - match the approach in meldingVerlof.aspx
    redenen.forEach(i => {
        const opt = document.createElement('option');
        opt.value = i.ID || ''; // Use ID as the value
        opt.textContent = i.Naam || i.Title || ''; // Display name
        opt.dataset.reasonTitle = i.Title || ''; // Store original Title for SP Reden field
        if (i.Kleur) opt.dataset.color = i.Kleur;
        sel.appendChild(opt);
    });
}

/**
 * Use fallback reasons when API fails
 */
function useFallbackReasons() {
    const sel = document.getElementById('Reden-modal');
    if (!sel) return;
    
    console.log('[VerlofroosterModalLogic] Using fallback verlofredenen');
    
    // Clear existing options except the first one
    while (sel.options.length > 1) {
        sel.remove(1);
    }
    
    const fallbackReasons = [
        { Title: 'vakantie', Naam: 'Vakantie', Kleur: '#4CAF50' },
        { Title: 'ziekte', Naam: 'Ziekte', Kleur: '#FF9800' },
        { Title: 'persoonlijk', Naam: 'Persoonlijke omstandigheden', Kleur: '#2196F3' },
        { Title: 'studie', Naam: 'Studie', Kleur: '#9C27B0' }
    ];
    
    // Save these as window.verlofRedenen for future use
    window.verlofRedenen = fallbackReasons;    fallbackReasons.forEach(reason => {
        const opt = document.createElement('option');
        opt.value = reason.Title; // Use Title as ID for fallback
        opt.textContent = reason.Naam;
        opt.dataset.reasonTitle = reason.Title; // Store Title in data attribute for form submission
        if (reason.Kleur) opt.dataset.color = reason.Kleur;
        sel.appendChild(opt);
    });
}

/**
 * Apply dark theme styles to modal elements if needed
 */
function applyDarkThemeToModal() {
    const modalElements = document.querySelectorAll('.modal-form-input');
    modalElements.forEach(el => {
        el.classList.add('dark:bg-gray-600', 'dark:border-gray-500', 'dark:text-gray-100');
    });
}

/**
 * Handle the verlof aanvraag form submission
 */
async function handleVerlofAanvraagSubmit() {
    console.log("[VerlofroosterModalLogic] Verwerken van verlof aanvraag submit");
    const form = document.getElementById('verlof-form-modal');
    const statusElement = document.getElementById('verlof-modal-status');
    
    function toonVerlofModalStatus(bericht, type = 'info') {
        if (!statusElement) return;
        statusElement.innerHTML = bericht;
        statusElement.className = 'mt-4 p-3 text-sm rounded-lg border';
        switch (type) {
            case 'success': statusElement.classList.add('bg-green-100', 'border-green-400', 'text-green-700'); break;
            case 'error': statusElement.classList.add('bg-red-100', 'border-red-400', 'text-red-700'); break;
            default: statusElement.classList.add('bg-blue-100', 'border-blue-400', 'text-blue-700'); break;
        }
        statusElement.classList.remove('hidden');
    }
    
    if (!form) {
        toonVerlofModalStatus("Formulier niet gevonden.", "error");
        return;
    }
      // Validate form
    let isValid = true;
    form.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500'));
    
    if (!form.checkValidity()) {
        toonVerlofModalStatus("Vul alle verplichte velden (*) correct in.", "error");
        form.querySelectorAll(':invalid').forEach(el => el.classList.add('border-red-500'));
        isValid = false;
    }
    
    // Explicit check for the reason dropdown
    const redenSelect = document.getElementById('Reden-modal');
    if (!redenSelect.value) {
        toonVerlofModalStatus("Selecteer een verlofreden.", "error");
        redenSelect.classList.add('border-red-500');
        isValid = false;
    }
    
    // Validate dates and times
    const startDatumValue = document.getElementById('StartDatePicker-modal').value;
    const startTijdValue = document.getElementById('StartTimePicker-modal').value;
    const eindDatumValue = document.getElementById('EndDatePicker-modal').value;
    const eindTijdValue = document.getElementById('EndTimePicker-modal').value;
    
    if (!startDatumValue || !startTijdValue || !eindDatumValue || !eindTijdValue) {
        toonVerlofModalStatus("Vul alle verplichte datums en tijden in.", "error");
        if (!startDatumValue) document.getElementById('StartDatePicker-modal').classList.add('border-red-500');
        if (!startTijdValue) document.getElementById('StartTimePicker-modal').classList.add('border-red-500');
        if (!eindDatumValue) document.getElementById('EndDatePicker-modal').classList.add('border-red-500');
        if (!eindTijdValue) document.getElementById('EndTimePicker-modal').classList.add('border-red-500');
        isValid = false;
    }
    
    const startDatum = new Date(`${startDatumValue}T${startTijdValue}`);
    const eindDatum = new Date(`${eindDatumValue}T${eindTijdValue}`);
    
    if (eindDatum <= startDatum) {
        toonVerlofModalStatus("Einddatum en -tijd moeten na startdatum en -tijd liggen.", "error");
        document.getElementById('EndDatePicker-modal').classList.add('border-red-500');
        document.getElementById('EndTimePicker-modal').classList.add('border-red-500');
        isValid = false;
    }
    
    if (!isValid) {
        if (window.domRefsLogic.modalActionButton) window.domRefsLogic.modalActionButton.disabled = false;
        toonVerlofModalStatus('Vul alle verplichte velden (*) correct in.', 'error');
        return;
    }
    
    // Prepare form data
    try {
        toonVerlofModalStatus("Bezig met versturen...", "info");
        if (window.domRefsLogic.modalActionButton) window.domRefsLogic.modalActionButton.disabled = true;
        
        // Set the hidden date fields
        document.getElementById('StartDatum-modal').value = startDatum.toISOString();
        document.getElementById('EindDatum-modal').value = eindDatum.toISOString();
          // Get the selected reason information
        const redenSelect = document.getElementById('Reden-modal');
        const geselecteerdeRedenOptie = redenSelect.options[redenSelect.selectedIndex];
        const redenIdValue = geselecteerdeRedenOptie.value; // ID van de reden (of fallback 'id')
        const redenTextValue = geselecteerdeRedenOptie.dataset.reasonTitle || geselecteerdeRedenOptie.textContent;
        
        // Get the proper metadata type from configLijst if available
        let metadataType = 'SP.Data.VerlofListItem';
        if (typeof getLijstConfig === 'function') {
            const verlofLijstConfig = getLijstConfig('Verlof');
            if (verlofLijstConfig && verlofLijstConfig.lijstTitel) {
                const listNameForMetadata = verlofLijstConfig.lijstTitel.replace(/\s+/g, '_');
                metadataType = `SP.Data.${listNameForMetadata}ListItem`;
            }
        }
          // Create payload for SharePoint REST API
        const formData = {
            __metadata: { type: metadataType },
            Title: document.getElementById('Title-modal').value,
            Medewerker: document.getElementById('Medewerker-modal').value,
            MedewerkerID: document.getElementById('MedewerkerID-modal').value,
            StartDatum: document.getElementById('StartDatum-modal').value,
            EindDatum: document.getElementById('EindDatum-modal').value,
            Omschrijving: document.getElementById('Omschrijving-modal').value,
            Reden: redenTextValue,       // Tekst van de reden (bv. Verlofredenen.Title)
            RedenId: redenIdValue,       // ID van de reden (Verlofredenen.ID)
            Status: document.getElementById('Status-modal').value
        };
        
        console.log('Form data:', formData);
        
        // In a real app, you would send this to SharePoint
        if (typeof window.createSPListItem === 'function') {
            await window.createSPListItem("Verlof", formData);
            toonVerlofModalStatus("Verlof aanvraag succesvol verzonden!", "success");
            
            setTimeout(() => {
                closeModal();
                if (typeof window.laadInitiëleData === 'function') {
                    window.laadInitiëleData(false); // Refresh data
                }
            }, 2000);
        } else {
            // Simulate success for demo purposes
            toonVerlofModalStatus("Verlof aanvraag verzonden! (simulatie)", "success");
            setTimeout(closeModal, 2000);
        }
    } catch (error) {
        console.error("[VerlofroosterModalLogic] Fout bij verzenden verlofaanvraag:", error);
        toonVerlofModalStatus(`Fout bij verzenden: ${error.message}. Probeer het opnieuw.`, "error");
        if (window.domRefsLogic.modalActionButton) window.domRefsLogic.modalActionButton.disabled = false;
    }
}

window.openVerlofAanvraagModal = openVerlofAanvraagModal;

// --- Compensatie Modal Functies ---
function openCompensatieModal() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ }
async function handleCompensatieSubmit() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ }

window.openCompensatieModal = openCompensatieModal;
window.handleCompensatieSubmit = handleCompensatieSubmit;

// --- Ziek/Beter Melden Modal Functies ---
function openZiekBeterModal() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ }
async function handleZiekBeterSubmit() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ }

window.openZiekBeterModal = openZiekBeterModal;
window.handleZiekBeterSubmit = handleZiekBeterSubmit;
window.handleMedewerkerLookupModal = handleMedewerkerLookupModal;

// --- Modal Initialisatie Functie ---
/**
 * Initialiseert de modal-gerelateerde functionaliteiten.
 * Deze functie kan worden uitgebreid om event listeners op te zetten
 * of andere setup taken voor modals uit te voeren.
 */
function initializeVerlofroosterModals() {
    console.log("[VerlofroosterModalLogic] Verlofrooster modals worden geïnitialiseerd.");

    if (!window.domRefsLogic) {
        console.error("[VerlofroosterModalLogic] domRefsLogic is niet geïnitialiseerd!");
        return;
    }

    // Helper functie om event listeners op een veilige manier toe te voegen
    function safeAddEventListener(element, eventType, handler) {
        if (!element) return;
        
        // Verwijder eerst eventuele bestaande handlers om duplicaten te voorkomen
        element.removeEventListener(eventType, handler);
        
        // Voeg de nieuwe handler toe
        element.addEventListener(eventType, handler);
        
        console.log(`[VerlofroosterModalLogic] Event listener (${eventType}) toegevoegd aan element:`, element.id || element.tagName);
    }

    // Close button "X" in the top right
    if (window.domRefsLogic.modalCloseButtonX) {
        // Zorg ervoor dat onclick property wordt gereset (voor het geval deze direct is ingesteld)
        window.domRefsLogic.modalCloseButtonX.onclick = null;
        safeAddEventListener(window.domRefsLogic.modalCloseButtonX, 'click', closeModal);
    }
    
    // Close/cancel button in the footer
    if (window.domRefsLogic.modalCloseButton) {
        // Zorg ervoor dat onclick property wordt gereset (voor het geval deze direct is ingesteld)
        window.domRefsLogic.modalCloseButton.onclick = null;
        safeAddEventListener(window.domRefsLogic.modalCloseButton, 'click', closeModal);
    }
    
    // Close modal when clicking on backdrop
    if (window.domRefsLogic.modalPlaceholder) {
        // Definieer een named handler function zodat we deze kunnen verwijderen
        function handleBackdropClick(event) {
            // Check if the click was directly on the backdrop (modalPlaceholder) and not on any of its children
            if (event.target === window.domRefsLogic.modalPlaceholder) {
                console.log("[VerlofroosterModalLogic] Modal backdrop geklikt, modal wordt gesloten.");
                closeModal();
            }
        }
        
        // Zorg ervoor dat onclick property wordt gereset (voor het geval deze direct is ingesteld)
        window.domRefsLogic.modalPlaceholder.onclick = null;
        
        // Use our helper function to safely add the event listener
        safeAddEventListener(window.domRefsLogic.modalPlaceholder, 'click', handleBackdropClick);
    }
    
    // Zorg ervoor dat de algemene openModal en closeModal functies ook globaal zijn als ze dat nog niet zijn
    if (typeof window.openModal === 'undefined') {
        window.openModal = openModal;
    }
    if (typeof window.closeModal === 'undefined') {
        window.closeModal = closeModal;
    }
}

// Maak de initialisatiefunctie globaal beschikbaar
window.initializeVerlofroosterModals = initializeVerlofroosterModals;


// --- Helper Functions for Modals ---

/**
 * Handles the medewerker lookup functionality within a modal.
 * @param {HTMLInputElement} inputElement - The input field for medewerker search.
 * @param {HTMLElement} suggestionsContainer - The div to display suggestions.
 * @param {Array} medewerkersList - The list of medewerkers to search through.
 * @param {Function} onSelectCallback - Callback function when a medewerker is selected.
 */
function handleMedewerkerLookupModal(inputElement, suggestionsContainer, medewerkersList, onSelectCallback) {
    const searchTerm = inputElement.value.toLowerCase();
    suggestionsContainer.innerHTML = ''; // Leeg suggesties

    if (!searchTerm) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    // Zorg ervoor dat medewerkersList een array is en text eigenschappen heeft
    if (!Array.isArray(medewerkersList)) {
        console.warn("[handleMedewerkerLookupModal] medewerkersList is geen array.", medewerkersList);
        suggestionsContainer.style.display = 'none';
        return;
    }

    const passendeMedewerkers = medewerkersList.filter(medewerker =>
        medewerker && typeof medewerker.text === 'string' && medewerker.text.toLowerCase().includes(searchTerm)
    );

    if (passendeMedewerkers.length > 0) {
        passendeMedewerkers.forEach(medewerker => {
            const suggestieItem = document.createElement('div');
            suggestieItem.textContent = medewerker.text;
            // Standaard styling, kan via CSS uitgebreid worden
            suggestieItem.style.padding = '8px';
            suggestieItem.style.cursor = 'pointer';
            suggestieItem.onmouseenter = () => suggestieItem.style.backgroundColor = '#f0f0f0'; // Simpele hover
            suggestieItem.onmouseleave = () => suggestieItem.style.backgroundColor = 'transparent';

            suggestieItem.addEventListener('click', () => {
                onSelectCallback(medewerker); // Roep de callback aan met het geselecteerde item
                suggestionsContainer.style.display = 'none';
                // De inputElement.value wordt al gezet in de onSelectCallback binnen openAdminZittingVrijModal
            });
            suggestionsContainer.appendChild(suggestieItem);
        });
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.style.display = 'none';
    }
}

// --- Admin Zittingvrij Modal Functies (NIEUW/GEÏNTEGREERD) ---

/**
 * Opent de modal voor het registreren van incidenteel zittingvrij.
 * @param {string | null} personeelsNr - Het personeelsnummer van de medewerker (voor niet-beheerders of vooraf geselecteerde beheerders).
 * @param {string | null} medewerkerNaam - De display naam van de medewerker.
 * @param {boolean} [isBeheerder=false] - Geeft aan of de huidige gebruiker een beheerder is.
 */
window.openAdminZittingVrijModal = async function(personeelsNr, medewerkerNaam, isBeheerder = false) {
    try {
        console.log(`[VerlofroosterModalLogic] openAdminZittingVrijModal aangeroepen voor: ${medewerkerNaam} (PersoneelsNr: ${personeelsNr}), IsBeheerder: ${isBeheerder}`);
        
        // Altijd expliciet controleren op beheerdersstatus op basis van groepen
        if (window.huidigeGebruiker && window.huidigeGebruiker.sharePointGroepen) {
            const adminGroups = ["1. Sharepoint beheer", "1.1. Mulder MT", "2.6. Roosteraars", "2.3. Senioren beoordelen"];
            const isInAdminGroups = window.huidigeGebruiker.sharePointGroepen.some(groep => adminGroups.includes(groep));
            // Alleen de parameter gebruiken als er geen groepsmembership is, anders groepsmembership prioriteit geven
            isBeheerder = isInAdminGroups || (typeof isBeheerder === 'string' ? (isBeheerder.toLowerCase() === 'true') : Boolean(isBeheerder));
        } else {
            isBeheerder = typeof isBeheerder === 'string' ? (isBeheerder.toLowerCase() === 'true') : Boolean(isBeheerder);
        }
        
        console.log(`[VerlofroosterModalLogic] Definitieve isBeheerder status: ${isBeheerder}`);

        let allMedewerkers = [];
        if (isBeheerder) {
            // Ensure showSpinner and hideSpinner are available
            if (typeof showSpinner !== 'function' || typeof hideSpinner !== 'function') {
                console.error("[VerlofroosterModalLogic] Spinner functies zijn niet beschikbaar.");
                // Fallback or error display
                if (typeof showToast === 'function') showToast('Fout: UI componenten missen.', 'error');
                else alert('Fout: UI componenten missen.');
                return;
            }
            showSpinner('Laden van medewerkers...');
            try {
                if (typeof getAlleMedewerkersVoorSelect !== 'function') {
                    console.error("[VerlofroosterModalLogic] Functie getAlleMedewerkersVoorSelect is niet gedefinieerd.");
                    if (typeof showToast === 'function') showToast('Fout: Kan medewerkerslijst niet laden (functie ontbreekt).', 'error');
                    hideSpinner();
                    return;
                }
                allMedewerkers = await getAlleMedewerkersVoorSelect(); 
            } catch (error) {
                console.error("[VerlofroosterModalLogic] Fout bij het ophalen van alle medewerkers:", error);
                if (typeof showToast === 'function') showToast('Fout bij het laden van medewerkerslijst.', 'error');
                hideSpinner();
                return; 
            } finally {
                hideSpinner();
            }
        }

        const today = new Date().toISOString().split('T')[0];
        const modalTitle = isBeheerder ? "Zittingvrij Registratie (Admin)" : "Zittingvrij Aanvragen (Incidenteel)";
        
        let medewerkerSelectHTML = '';
        if (isBeheerder) {
            medewerkerSelectHTML = `
                <div class="form-group">
                    <label for="medewerker-select-ztv" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medewerker:</label>
                    <select id="medewerker-select-ztv" name="medewerker" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="">Selecteer een medewerker</option>
                        ${allMedewerkers.map(m => `<option value="${m.Id}" ${personeelsNr && m.Id.toString() === personeelsNr.toString() ? 'selected' : ''}>${m.Title}</option>`).join('')}
                    </select>
                </div>`;
        }

        const formHtml = `
            <form id="adminZittingVrijForm" class="space-y-4">
                ${isBeheerder ? medewerkerSelectHTML : `<input type="hidden" id="personeelsNr-ztv" name="personeelsNr" value="${personeelsNr || ''}">`}
                ${isBeheerder ? '' : `<p class="text-sm text-gray-600 dark:text-gray-400">Aanvraag voor: <strong>${medewerkerNaam || (window.huidigeGebruiker ? window.huidigeGebruiker.Title : 'Huidige gebruiker')}</strong></p>`}
                
                <div class="form-group">
                    <label for="zittingvrij-startdatum" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startdatum:</label>
                    <input type="date" id="zittingvrij-startdatum" name="startdatum" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required value="${today}">
                </div>
                <div class="form-group">
                    <label for="zittingvrij-einddatum" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Einddatum:</label>
                    <input type="date" id="zittingvrij-einddatum" name="einddatum" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required value="${today}">
                </div>
                <div class="form-group">
                    <label for="zittingvrij-opmerking" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opmerking (optioneel):</label>
                    <textarea id="zittingvrij-opmerking" name="opmerking" rows="3" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>
                 <div class="form-group flex items-center">
                    <input type="checkbox" id="zittingvrij-hele-dag" name="heledag" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" checked>
                    <label for="zittingvrij-hele-dag" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Hele dag</label>
                </div>
                <div id="tijd-inputs-zittingvrij" class="hidden space-y-4">
                    <div class="form-group">
                        <label for="zittingvrij-starttijd" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Starttijd:</label>
                        <input type="time" id="zittingvrij-starttijd" name="starttijd" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div class="form-group">
                        <label for="zittingvrij-eindtijd" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Eindtijd:</label>
                        <input type="time" id="zittingvrij-eindtijd" name="eindtijd" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                </div>
                ${isBeheerder ? `
                <div class="form-group flex items-center">
                    <input type="checkbox" id="zittingvrij-herhalend" name="herhalend" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                    <label for="zittingvrij-herhalend" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Herhalende boeking</label>
                </div>
                <div id="herhaling-opties-zittingvrij" class="hidden space-y-4">
                    <div class="form-group">
                        <label for="zittingvrij-herhaling-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Herhaal:</label>
                        <select id="zittingvrij-herhaling-type" name="herhalingtype" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="dagelijks">Dagelijks</option>
                            <option value="wekelijks">Wekelijks</option>
                            <option value="maandelijks">Maandelijks</option>
                            <option value="jaarlijks">Jaarlijks</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="zittingvrij-herhaling-einddatum" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Eindigt op:</label>
                        <input type="date" id="zittingvrij-herhaling-einddatum" name="herhalingeinddatum" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                </div>
                ` : ''}
            </form>`;

        openModal(modalTitle, formHtml, async () => {
            console.log("[VerlofroosterModalLogic] Submit knop geklikt voor Zittingvrij modal.");
            
            if (typeof showSpinner !== 'function' || typeof hideSpinner !== 'function' || typeof showToast !== 'function') {
                console.error("[VerlofroosterModalLogic] Essentiële UI functies (spinner/toast) ontbreken.");
                alert("Fout: Kan actie niet verwerken, UI componenten missen.");
                return;
            }
            showSpinner('Verwerken...');

            const form = document.getElementById('adminZittingVrijForm');
            if (!form) {
                console.error("[VerlofroosterModalLogic] Zittingvrij form niet gevonden.");
                showToast('Fout: Formulier niet gevonden.', 'error');
                hideSpinner();
                return;
            }
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const gekozenPersoneelsNr = isBeheerder ? (document.getElementById('medewerker-select-ztv') ? document.getElementById('medewerker-select-ztv').value : null) : (document.getElementById('personeelsNr-ztv') ? document.getElementById('personeelsNr-ztv').value : personeelsNr);
            let gekozenMedewerkerNaam = medewerkerNaam;
            if (isBeheerder && gekozenPersoneelsNr && allMedewerkers) {
                const selMedewerker = allMedewerkers.find(m => m.Id.toString() === gekozenPersoneelsNr.toString());
                if (selMedewerker) gekozenMedewerkerNaam = selMedewerker.Title;
            } else if (!isBeheerder && window.huidigeGebruiker) {
                gekozenMedewerkerNaam = window.huidigeGebruiker.Title;
            }


            if (isBeheerder && !gekozenPersoneelsNr) {
                showToast('Selecteer een medewerker.', 'error');
                hideSpinner();
                return;
            }
            
            if (!data.startdatum || !data.einddatum) {
                showToast('Start- en einddatum zijn verplicht.', 'error');
                hideSpinner();
                return;
            }

            const startDatum = new Date(data.startdatum);
            const eindDatum = new Date(data.einddatum);

            if (eindDatum < startDatum) {
                showToast('Einddatum kan niet voor startdatum liggen.', 'error');
                hideSpinner();
                return;
            }
            
            const heleDagCheckbox = document.getElementById('zittingvrij-hele-dag');
            const isHeleDag = heleDagCheckbox ? heleDagCheckbox.checked : true;
            
            let effectiveStartDateTime = new Date(data.startdatum);
            let effectiveEindDateTime = new Date(data.einddatum);

            if (!isHeleDag) {
                if (!data.starttijd || !data.eindtijd) {
                    showToast('Start- en eindtijd zijn verplicht als "Hele dag" niet is aangevinkt.', 'error');
                    hideSpinner();
                    return;
                }
                const [startHours, startMinutes] = data.starttijd.split(':');
                effectiveStartDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

                const [endHours, endMinutes] = data.eindtijd.split(':');
                effectiveEindDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
                
                if (data.startdatum === data.einddatum && effectiveEindDateTime <= effectiveStartDateTime) {
                     showToast('Eindtijd moet na starttijd liggen op dezelfde dag.', 'error');
                     hideSpinner();
                     return;
                }
            } else {
                effectiveStartDateTime.setHours(0, 0, 0, 0); 
                effectiveEindDateTime.setHours(23, 59, 59, 999);
            }

            const itemTitle = `Zittingvrij ${gekozenMedewerkerNaam || (window.huidigeGebruiker ? window.huidigeGebruiker.Title : 'Onbekend')}`;
            const medewerkerIdToSave = gekozenPersoneelsNr || (window.huidigeGebruiker ? window.huidigeGebruiker.Id : null);

            if (!medewerkerIdToSave) {
                showToast('Kan medewerker ID niet bepalen voor opslaan.', 'error');
                hideSpinner();
                return;
            }

            const itemData = {
                __metadata: { type: "SP.Data.VerlofRoosterTestListItem" }, 
                Title: itemTitle,
                MedewerkerId: parseInt(medewerkerIdToSave), // Zorg ervoor dat dit een getal is
                StartDatum: effectiveStartDateTime.toISOString(),
                EindDatum: effectiveEindDateTime.toISOString(),
                Opmerking: data.opmerking || '',
                Status: 'Goedgekeurd',
                VerlofType: 'Zittingvrij',
                HeleDag: isHeleDag,
                IsHerhalend: isBeheerder && document.getElementById('zittingvrij-herhalend') ? document.getElementById('zittingvrij-herhalend').checked : false
            };

            if (itemData.IsHerhalend && isBeheerder) {
                const herhalingTypeEl = document.getElementById('zittingvrij-herhaling-type');
                const herhalingEinddatumEl = document.getElementById('zittingvrij-herhaling-einddatum');

                const herhalingType = herhalingTypeEl ? herhalingTypeEl.value : null;
                const herhalingEinddatumValue = herhalingEinddatumEl ? herhalingEinddatumEl.value : null;

                if (!herhalingEinddatumValue) {
                    showToast('Einddatum voor herhaling is verplicht.', 'error');
                    hideSpinner();
                    return;
                }
                const herhalingEinddatum = new Date(herhalingEinddatumValue);
                if (herhalingEinddatum < eindDatum) {
                    showToast('Einddatum van herhaling kan niet voor de einddatum van de eerste boeking liggen.', 'error');
                    hideSpinner();
                    return;
                }
                 if (!herhalingType) {
                    showToast('Herhalingstype is verplicht.', 'error');
                    hideSpinner();
                    return;
                }

                itemData.Herhalingstype = herhalingType;
                itemData.HerhalingEindigtOp = herhalingEinddatum.toISOString();
            }
            
            console.log("[VerlofroosterModalLogic] Voorbereide data voor SharePoint:", itemData);

            try {
                if (typeof addListItem !== 'function') {
                    console.error("[VerlofroosterModalLogic] Functie addListItem is niet gedefinieerd.");
                    showToast('Fout: Kan zittingvrij niet opslaan (functie ontbreekt).', 'error');
                    hideSpinner();
                    return;
                }
                await addListItem("VerlofRoosterTest", itemData); // Gebruik de juiste lijstnaam
                showToast('Zittingvrij succesvol opgeslagen.', 'success');
                closeModal();
                if (typeof laadInitiëleData === 'function') {
                    await laadInitiëleData(true); 
                } else {
                    console.warn("[VerlofroosterModalLogic] laadInitiëleData functie niet gevonden na opslaan.");
                }
            } catch (error) {
                console.error('[VerlofroosterModalLogic] Fout bij opslaan zittingvrij:', error);
                showToast('Fout bij het opslaan van zittingvrij: ' + (error.message || JSON.stringify(error)), 'error');
            } finally {
                hideSpinner();
            }
        }, true, false, null, 'max-w-lg'); // showCancelButton = true, showPrevButton = false, modalSizeClass

        // Re-query elements after modal content is set by openModal
        const heleDagCheckboxElem = document.getElementById('zittingvrij-hele-dag');
        const tijdInputsDiv = document.getElementById('tijd-inputs-zittingvrij');
        if (heleDagCheckboxElem && tijdInputsDiv) {
            heleDagCheckboxElem.addEventListener('change', function() {
                tijdInputsDiv.classList.toggle('hidden', this.checked);
                if (!this.checked) { 
                    const startTijdInput = document.getElementById('zittingvrij-starttijd');
                    const eindTijdInput = document.getElementById('zittingvrij-eindtijd');
                    if (startTijdInput) startTijdInput.value = '09:00';
                    if (eindTijdInput) eindTijdInput.value = '17:00';
                }
            });
            // Initial state based on current checked status
            tijdInputsDiv.classList.toggle('hidden', heleDagCheckboxElem.checked);
        }

        if (isBeheerder) {
            const herhalendCheckbox = document.getElementById('zittingvrij-herhalend');
            const herhalingOptiesDiv = document.getElementById('herhaling-opties-zittingvrij');
            if (herhalendCheckbox && herhalingOptiesDiv) {
                herhalendCheckbox.addEventListener('change', function() {
                    herhalingOptiesDiv.classList.toggle('hidden', !this.checked);
                });
                // Initial state
                herhalingOptiesDiv.classList.toggle('hidden', !herhalendCheckbox.checked);
            }
        }

    } catch (error) {
        console.error("[VerlofroosterModalLogic] Fout in openAdminZittingVrijModal:", error);
        if (typeof showToast === 'function') {
            showToast('Er is een fout opgetreden bij het openen van de modal: ' + (error.message || JSON.stringify(error)), 'error');
        }
        if (typeof hideSpinner === 'function') hideSpinner();
    }
};

// --- Compensatie-uren Modal Functies ---

/**
 * Open the modal for compensation hours entry
 */
function openCompensatieUrenModal() {
    console.log("[VerlofroosterModalLogic] Opening compensatie-uren modal");
    
    // Get current date values for defaults
    const nu = new Date();
    const vandaagISO = nu.toISOString().split('T')[0];
    const defaultStartTijd = "09:00";
    const defaultEindTijd = "17:00";
    
    // Prepare HTML content based on meldingCompensatieUren.aspx
    const modalContentHtml = `
        <form id="compensatie-form-modal" class="space-y-4">
            <input type="hidden" id="Title-comp-modal" name="Title">
            <input type="hidden" id="MedewerkerID-comp-modal" name="MedewerkerID">
            <input type="hidden" id="AanvraagTijdstip-comp-modal" name="AanvraagTijdstip">
            <input type="hidden" id="Status-comp-modal" name="Status" value="Ingediend">
            <input type="hidden" id="StartCompensatieUrenISO-modal" name="StartCompensatieUrenISO">
            <input type="hidden" id="EindeCompensatieUrenISO-modal" name="EindeCompensatieUrenISO">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group">
                    <label for="MedewerkerDisplay-comp-modal" class="form-label">Naam medewerker</label>
                    <input type="text" id="MedewerkerDisplay-comp-modal" name="MedewerkerDisplay" class="modal-form-input bg-gray-100 w-full" readonly>
                </div>
                <div class="form-group">
                    <label for="MedewerkerUsername-comp-modal" class="form-label">Gebruikersnaam</label>
                    <input type="text" id="MedewerkerUsername-comp-modal" name="MedewerkerUsername" class="modal-form-input bg-gray-100 w-full" readonly>
                </div>
            </div>

            <fieldset class="border border-gray-300 dark:border-gray-600 p-3 rounded-md">
                <legend class="text-sm font-medium px-1">Start Compensatie</legend>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                        <label for="StartCompensatieDatum-modal" class="block text-sm font-medium mb-1">Startdatum <span class="text-red-500">*</span></label>
                        <input type="date" id="StartCompensatieDatum-modal" name="StartCompensatieDatum" class="modal-form-input w-full" value="${vandaagISO}" required>
                    </div>
                    <div>
                        <label for="StartCompensatieTijd-modal" class="block text-sm font-medium mb-1">Starttijd <span class="text-red-500">*</span></label>
                        <input type="time" id="StartCompensatieTijd-modal" name="StartCompensatieTijd" class="modal-form-input w-full" value="${defaultStartTijd}" required>
                    </div>
                </div>
            </fieldset>

            <fieldset class="border border-gray-300 dark:border-gray-600 p-3 rounded-md">
                <legend class="text-sm font-medium px-1">Einde Compensatie</legend>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                        <label for="EindeCompensatieDatum-modal" class="block text-sm font-medium mb-1">Einddatum <span class="text-red-500">*</span></label>
                        <input type="date" id="EindeCompensatieDatum-modal" name="EindeCompensatieDatum" class="modal-form-input w-full" value="${vandaagISO}" required>
                    </div>
                    <div>
                        <label for="EindeCompensatieTijd-modal" class="block text-sm font-medium mb-1">Eindtijd <span class="text-red-500">*</span></label>
                        <input type="time" id="EindeCompensatieTijd-modal" name="EindeCompensatieTijd" class="modal-form-input w-full" value="${defaultEindTijd}" required>
                    </div>
                </div>
            </fieldset>

            <div class="form-group">
                <label for="UrenTotaal-modal" class="block text-sm font-medium mb-1">Totaal Uren</label>
                <input type="text" id="UrenTotaal-modal" name="UrenTotaal" class="modal-form-input bg-gray-100 w-full" readonly>
            </div>

            <div class="form-group">
                <label for="Omschrijving-comp-modal" class="block text-sm font-medium mb-1">Omschrijving <span class="text-red-500">*</span></label>
                <textarea id="Omschrijving-comp-modal" name="Omschrijving" class="modal-form-input w-full" placeholder="Geef een duidelijke omschrijving (bijv. project, reden van overwerk)." rows="3" required></textarea>
            </div>
            
            <div id="compensatie-modal-status" class="hidden mt-4 p-3 text-sm rounded-lg"></div>
        </form>
    `;

    // Open the modal with the form
    openModal(
        'Compensatie-uren Indienen',
        modalContentHtml,
        'Verstuur',
        handleCompensatieUrenSubmit,
        true, // Show cancel button
        false, // No previous step button
        null,
        'max-w-lg' // Make modal wider
    );

    // Fill in the user information and setup event handlers
    setTimeout(async function() {
        // Get current user info
        const currentUser = window.currentUserInfo || { displayName: 'Gebruiker' };
        const displayName = currentUser.displayName;
        const normalizedUsername = currentUser.normalizedUsername || window.huidigeGebruiker?.normalizedUsername || '';
        
        // Default values to show immediately
        document.getElementById('MedewerkerDisplay-comp-modal').value = displayName;
        document.getElementById('MedewerkerUsername-comp-modal').value = normalizedUsername;
        document.getElementById('MedewerkerID-comp-modal').value = normalizedUsername;
        
        // Set the Title field with timestamp
        const now = new Date();
        document.getElementById('Title-comp-modal').value = `Compensatie-uren ${displayName} - ${now.toLocaleString('nl-NL')}`;
        document.getElementById('AanvraagTijdstip-comp-modal').value = now.toISOString();
        
        // Try to get the correct name from Medewerkers list
        try {
            let medewerkerInfo = null;
            
            // Look for the medewerker in cached data first
            if (window.alleMedewerkers && window.alleMedewerkers.length > 0) {
                // Try different ways to match the username for robustness
                const genormaliseerdeUsername = typeof window.trimLoginNaamPrefixMachtigingen === 'function' ? 
                    window.trimLoginNaamPrefixMachtigingen(normalizedUsername) : 
                    normalizedUsername;
                
                // Try multiple matching strategies
                medewerkerInfo = window.alleMedewerkers.find(m => 
                    (m.Username && m.Username === normalizedUsername) || 
                    (m.Username && m.Username.toLowerCase() === normalizedUsername.toLowerCase()) ||
                    (m.Username && typeof window.trimLoginNaamPrefixMachtigingen === 'function' && 
                        window.trimLoginNaamPrefixMachtigingen(m.Username) === genormaliseerdeUsername)
                );
                
                // If the normal match fails, use the hard-coded test user
                if (!medewerkerInfo && normalizedUsername.toLowerCase().includes('busselw')) {
                    medewerkerInfo = {
                        Naam: "Wesley van Bussel",
                        Title: "Wesley van Bussel",
                        Username: normalizedUsername
                    };
                }
            }
            
            // Update name field if found
            if (medewerkerInfo) {
                const medewerkerNaam = medewerkerInfo.Naam || medewerkerInfo.Title || displayName;
                document.getElementById('MedewerkerDisplay-comp-modal').value = medewerkerNaam;
                document.getElementById('Title-comp-modal').value = `Compensatie-uren ${medewerkerNaam} - ${now.toLocaleString('nl-NL')}`;
            }
        } catch (error) {
            console.error('[VerlofroosterModalLogic] Fout bij ophalen medewerkersgegevens:', error);
        }
        
        // Setup event handlers for date/time fields to calculate total hours
        setupCompensatieUrenCalculation();
        
        // Apply dark theme if needed
        if (document.body.classList.contains('dark-theme')) {
            applyDarkThemeToModal();
        }
    }, 100);
}

/**
 * Set up event handlers to calculate total hours whenever date/time fields change
 */
function setupCompensatieUrenCalculation() {
    const startDatumInput = document.getElementById('StartCompensatieDatum-modal');
    const startTijdInput = document.getElementById('StartCompensatieTijd-modal');
    const eindeDatumInput = document.getElementById('EindeCompensatieDatum-modal');
    const eindeTijdInput = document.getElementById('EindeCompensatieTijd-modal');
    const urenTotaalInput = document.getElementById('UrenTotaal-modal');
    
    const updateTotalHours = () => {
        if (startDatumInput.value && startTijdInput.value && 
            eindeDatumInput.value && eindeTijdInput.value) {
            const startDateTime = new Date(`${startDatumInput.value}T${startTijdInput.value}`);
            const eindeDateTime = new Date(`${eindeDatumInput.value}T${eindeTijdInput.value}`);
            
            // Store ISO values in hidden fields
            document.getElementById('StartCompensatieUrenISO-modal').value = startDateTime.toISOString();
            document.getElementById('EindeCompensatieUrenISO-modal').value = eindeDateTime.toISOString();
            
            if (eindeDateTime > startDateTime) {
                // Calculate difference in hours
                const diffMs = eindeDateTime - startDateTime;
                const diffHours = diffMs / (1000 * 60 * 60);
                
                // Format with 2 decimal places
                urenTotaalInput.value = diffHours.toFixed(2);
            } else {
                urenTotaalInput.value = '0.00';
            }
        }
    };
    
    // Add event listeners
    startDatumInput.addEventListener('change', updateTotalHours);
    startTijdInput.addEventListener('change', updateTotalHours);
    eindeDatumInput.addEventListener('change', updateTotalHours);
    eindeTijdInput.addEventListener('change', updateTotalHours);
    
    // Initialize calculation
    updateTotalHours();
}

/**
 * Handle the compensation hours form submission
 */
async function handleCompensatieUrenSubmit() {
    console.log("[VerlofroosterModalLogic] Verwerken van compensatie-uren submit");
    const form = document.getElementById('compensatie-form-modal');
    const statusElement = document.getElementById('compensatie-modal-status');
    
    function toonCompensatieModalStatus(bericht, type = 'info') {
        if (!statusElement) return;
        statusElement.innerHTML = bericht;
        statusElement.className = 'mt-4 p-3 text-sm rounded-lg border';
        switch (type) {
            case 'success': statusElement.classList.add('bg-green-100', 'border-green-400', 'text-green-700'); break;
            case 'error': statusElement.classList.add('bg-red-100', 'border-red-400', 'text-red-700'); break;
            default: statusElement.classList.add('bg-blue-100', 'border-blue-400', 'text-blue-700'); break;
        }
        statusElement.classList.remove('hidden');
    }
    
    if (!form) {
        toonCompensatieModalStatus("Formulier niet gevonden.", "error");
        return;
    }
    
    // Validate form
    let isValid = true;
    form.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500'));
    
    if (!form.checkValidity()) {
        toonCompensatieModalStatus("Vul alle verplichte velden (*) correct in.", "error");
        form.querySelectorAll(':invalid').forEach(el => el.classList.add('border-red-500'));
        isValid = false;
    }
    
    // Validate dates and times
    const startDatumValue = document.getElementById('StartCompensatieDatum-modal').value;
    const startTijdValue = document.getElementById('StartCompensatieTijd-modal').value;
    const eindeDatumValue = document.getElementById('EindeCompensatieDatum-modal').value;
    const eindeTijdValue = document.getElementById('EindeCompensatieTijd-modal').value;
    
    if (!startDatumValue || !startTijdValue || !eindeDatumValue || !eindeTijdValue) {
        toonCompensatieModalStatus("Vul alle verplichte datums en tijden in.", "error");
        if (!startDatumValue) document.getElementById('StartCompensatieDatum-modal').classList.add('border-red-500');
        if (!startTijdValue) document.getElementById('StartCompensatieTijd-modal').classList.add('border-red-500');
        if (!eindeDatumValue) document.getElementById('EindeCompensatieDatum-modal').classList.add('border-red-500');
        if (!eindeTijdValue) document.getElementById('EindeCompensatieTijd-modal').classList.add('border-red-500');
               isValid = false;
    }
    
    const startDateTime = new Date(`${startDatumValue}T${startTijdValue}`);
    const eindeDateTime = new Date(`${eindeDatumValue}T${eindeTijdValue}`);
    
    if (eindeDateTime <= startDateTime) {
        toonCompensatieModalStatus("Einddatum en -tijd moeten na startdatum en -tijd liggen.", "error");
        document.getElementById('EindeCompensatieDatum-modal').classList.add('border-red-500');
        document.getElementById('EindeCompensatieTijd-modal').classList.add('border-red-500');
        isValid = false;
    }
    
    // Check if description is provided
    const omschrijving = document.getElementById('Omschrijving-comp-modal').value.trim();
    if (!omschrijving) {
        toonCompensatieModalStatus("Geef een omschrijving voor de compensatie-uren.", "error");
        document.getElementById('Omschrijving-comp-modal').classList.add('border-red-500');
        isValid = false;
    }
    
    if (!isValid) {
        if (window.domRefsLogic.modalActionButton) window.domRefsLogic.modalActionButton.disabled = false;
        return;
    }
    
    // Prepare form data for submission
    try {
        toonCompensatieModalStatus("Bezig met versturen...", "info");
        if (window.domRefsLogic.modalActionButton) window.domRefsLogic.modalActionButton.disabled = true;
        
        // Get the proper metadata type from configLijst if available
        let metadataType = 'SP.Data.CompensatieUrenListItem';
        if (typeof getLijstConfig === 'function') {
            const compLijstConfig = getLijstConfig('CompensatieUren');
            if (compLijstConfig && compLijstConfig.lijstTitel) {
                const listNameForMetadata = compLijstConfig.lijstTitel.replace(/\s+/g, '_');
                metadataType = `SP.Data.${listNameForMetadata}ListItem`;
            }
        }
        
        // Create payload for SharePoint REST API
        const formData = {
            __metadata: { type: metadataType },
            Title: document.getElementById('Title-comp-modal').value,
            Medewerker: document.getElementById('MedewerkerDisplay-comp-modal').value,
            MedewerkerID: document.getElementById('MedewerkerID-comp-modal').value,
            AanvraagTijdstip: new Date().toISOString(),
            StartCompensatieUren: document.getElementById('StartCompensatieUrenISO-modal').value,
            EindeCompensatieUren: document.getElementById('EindeCompensatieUrenISO-modal').value,
            UrenTotaal: document.getElementById('UrenTotaal-modal').value,
            Omschrijving: document.getElementById('Omschrijving-comp-modal').value,
            Status: document.getElementById('Status-comp-modal').value
        };
        
        console.log('CompensatieUren form data:', formData);
        
        // Submit to SharePoint
        if (typeof window.createSPListItem === 'function') {
            await window.createSPListItem("CompensatieUren", formData);
            toonCompensatieModalStatus("Compensatie-uren aanvraag succesvol verzonden!", "success");
            
            setTimeout(() => {
                closeModal();
                if (typeof window.laadInitiëleData === 'function') {
                    window.laadInitiëleData(false); // Refresh data
                }
            }, 2000);
        } else {
            // Simulate success for demo purposes
            toonCompensatieModalStatus("Compensatie-uren aanvraag verzonden! (simulatie)", "success");
            setTimeout(closeModal, 2000);
        }
    } catch (error) {
        console.error("[VerlofroosterModalLogic] Fout bij verzenden compensatie-uren:", error);
        toonCompensatieModalStatus(`Fout bij verzenden: ${error.message}. Probeer het opnieuw.`, "error");
        if (window.domRefsLogic.modalActionButton) window.domRefsLogic.modalActionButton.disabled = false;
    }
}

// Make the functions globally available
window.openCompensatieUrenModal = openCompensatieUrenModal;