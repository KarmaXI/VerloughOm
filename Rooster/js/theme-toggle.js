/**
 * Theme functionality for Verlofrooster application
 * This script manages applying the theme based on user settings
 */

document.addEventListener('DOMContentLoaded', function() {
    // We'll apply theme based on user settings once they're loaded
    // Initial display will use system default until user settings are available
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Initialize with system preference temporarily until user settings are loaded
    if (prefersDark) {
        document.body.classList.add('dark-theme');
        console.log('[Theme] Temporary dark theme applied based on system preference');
    } else {
        document.body.classList.remove('dark-theme');
        console.log('[Theme] Temporary light theme applied based on system preference');
    }

    // The actual theme will be set by updateThemeFromUserSettings() after gebruikersInstellingen is loaded
    console.log('[Theme] Theme system initialized, waiting for user settings to load');
});

/**
 * Applies theme based on user settings
 * @param {string} theme - 'light' or 'dark'
 */
function applyTheme(theme) {
    const isDarkMode = theme === 'dark';
    
    // Apply theme class to both html and body elements for complete coverage
    document.documentElement.classList.toggle('dark-theme', isDarkMode);
    document.body.classList.toggle('dark-theme', isDarkMode);
    
    // Explicitly update hardcoded Tailwind classes for key elements
    updateTailwindClassesForTheme(isDarkMode);
    
    // Dispatch a custom event that other components can listen for
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDarkMode } }));
    
    console.log(`[Theme] Applied ${isDarkMode ? 'dark' : 'light'} theme based on user settings`);
}

/**
 * Updates Tailwind classes for elements that have hardcoded color classes
 * @param {boolean} isDarkMode - Whether dark mode is active
 */
function updateTailwindClassesForTheme(isDarkMode) {
    // Mapping of selectors to their light/dark class pairs
    const elementsToUpdate = [
        {
            selector: 'body',
            lightClasses: ['bg-gray-50', 'text-gray-800'],
            darkClasses: ['bg-gray-900', 'text-gray-100']
        },
        {
            selector: '#app-header',
            lightClasses: ['bg-white', 'shadow-md'],
            darkClasses: ['bg-gray-800', 'shadow-md']
        },
        {
            selector: '#app-title',
            lightClasses: ['text-gray-800'],
            darkClasses: ['text-white']
        },        {
            selector: '#legenda-section',
            lightClasses: ['bg-white', 'border-gray-200'],
            darkClasses: ['bg-gray-800', 'border-gray-700']
        },
        {
            selector: '#legenda-title',
            lightClasses: ['text-gray-800'],
            darkClasses: ['text-white']
        },
        {
            selector: '#current-month-year',
            lightClasses: ['text-gray-800'],
            darkClasses: ['text-white']
        },
        {
            selector: '.nav-button',
            lightClasses: ['text-gray-600', 'hover:bg-gray-200'],
            darkClasses: ['text-gray-300', 'hover:bg-gray-700']
        },
        {
            selector: '.nav-button-alt',
            lightClasses: ['bg-gray-200', 'hover:bg-gray-300', 'text-gray-700'],
            darkClasses: ['bg-gray-700', 'hover:bg-gray-600', 'text-gray-200']
        },
        {
            selector: '.filter-input',
            lightClasses: ['bg-white', 'border-gray-300', 'text-gray-800'],
            darkClasses: ['bg-gray-700', 'border-gray-600', 'text-white']
        },
        {
            selector: '.modal-card',
            lightClasses: ['bg-white', 'border-gray-200'],
            darkClasses: ['bg-gray-800', 'border-gray-700']
        },
        {
            selector: '#modal-title',
            lightClasses: ['text-gray-800'],
            darkClasses: ['text-white']
        },        {
            selector: '#modal-content',
            lightClasses: ['text-gray-700'],
            darkClasses: ['text-gray-300']
        },
        {
            selector: '#rooster-dropdown-button',
            lightClasses: ['bg-gray-200', 'hover:bg-gray-300', 'text-gray-700', 'border-gray-300'],
            darkClasses: ['bg-gray-700', 'hover:bg-gray-600', 'text-gray-200', 'border-gray-600']
        },
        {
            selector: '#rooster-dropdown-menu',
            lightClasses: ['bg-white', 'border-gray-200'],
            darkClasses: ['bg-gray-800', 'border-gray-700']
        },
        {
            selector: '.dropdown-item',
            lightClasses: ['text-gray-700', 'hover:bg-gray-100'],
            darkClasses: ['text-gray-300', 'hover:bg-gray-700']
        },        {
            selector: '#rooster-grid-container',
            lightClasses: ['bg-gray-100', 'border-gray-300'],
            darkClasses: ['bg-gray-700', 'border-gray-600']
        },
        {
            selector: '#rooster-grid-header',
            lightClasses: ['bg-gray-200', 'gap-px'],
            darkClasses: ['bg-gray-600', 'gap-px']
        },
        {
            selector: '#rooster-data-rows',
            lightClasses: ['divide-gray-300'],
            darkClasses: ['divide-gray-600']
        }
    ];
    
    // Update classes for each element
    elementsToUpdate.forEach(item => {
        const elements = document.querySelectorAll(item.selector);
        if (elements.length) {
            elements.forEach(el => {
                // Remove all potential theme classes first
                [...item.lightClasses, ...item.darkClasses].forEach(cls => {
                    el.classList.remove(cls);
                });
                
                // Add appropriate theme classes
                const classesToAdd = isDarkMode ? item.darkClasses : item.lightClasses;
                classesToAdd.forEach(cls => {
                    el.classList.add(cls);
                });
            });
        }
    });
}

/**
 * Apply theme-specific styling to calendar day headers
 */
function updateRoosterDayHeadersForTheme() {
    const isDarkMode = document.body.classList.contains('dark-theme');
    const dagHeaders = document.querySelectorAll('.dag-header');
    
    dagHeaders.forEach(header => {
        // Remove existing theme classes
        header.classList.remove('bg-gray-200', 'bg-gray-700', 'text-gray-700', 'text-gray-200', 'border-gray-300', 'border-gray-600');
        
        // Add theme-specific classes
        if (isDarkMode) {
            header.classList.add('bg-gray-700', 'text-gray-200', 'border-gray-600');
        } else {
            header.classList.add('bg-gray-200', 'text-gray-700', 'border-gray-300');
        }
    });
}

// Update calendar styling when theme changes
document.addEventListener('themeChanged', updateRoosterDayHeadersForTheme);

/**
 * Update all roster cells based on current theme
 */
function updateRoosterCellsForTheme() {
    const isDarkMode = document.body.classList.contains('dark-theme');
    
    // Update regular cells
    const cells = document.querySelectorAll('.rooster-cel');
    cells.forEach(cell => {
        // Remove theme-specific classes
        cell.classList.remove('bg-white', 'bg-gray-800', 'text-gray-800', 'text-gray-200', 'border-gray-300', 'border-gray-600');
        
        // Add appropriate classes based on theme
        if (isDarkMode) {
            cell.classList.add('bg-gray-800', 'text-gray-200', 'border-gray-600');
        } else {
            cell.classList.add('bg-white', 'text-gray-800', 'border-gray-300');
        }
    });
    
    // Update medewerker cells
    const medewerkerCells = document.querySelectorAll('.rooster-cel-medewerker');
    medewerkerCells.forEach(cell => {
        // Remove theme-specific classes
        cell.classList.remove('bg-white', 'bg-gray-800', 'text-gray-800', 'text-gray-200', 'border-gray-300', 'border-gray-600');
        
        // Add appropriate classes based on theme
        if (isDarkMode) {
            cell.classList.add('bg-gray-800', 'text-gray-200', 'border-gray-600');
        } else {
            cell.classList.add('bg-white', 'text-gray-800', 'border-gray-300');
        }
    });
    
    console.log(`[Theme] Updated roster cells for ${isDarkMode ? 'dark' : 'light'} theme`);
}

// Update roster cells when theme changes
document.addEventListener('themeChanged', updateRoosterCellsForTheme);

/**
 * Updates theme from user settings
 * This function will be called after user settings are loaded
 */
function updateThemeFromUserSettings() {
    // Check if user settings have been loaded
    if (window.gebruikersInstellingen && window.gebruikersInstellingen.soortWeergave) {
        const userTheme = window.gebruikersInstellingen.soortWeergave;
        applyTheme(userTheme);
        console.log('[Theme] Theme applied from user settings:', userTheme);
    } else {
        console.log('[Theme] User settings not available yet, theme will be updated once they are loaded');
    }
}

// Make functions globally available so they can be called from verlofrooster_logic.js
window.applyTheme = applyTheme;
window.updateThemeFromUserSettings = updateThemeFromUserSettings;
// Log that theme functionality is loaded
console.log('[Theme] Theme functionality loaded');