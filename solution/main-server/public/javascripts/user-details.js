/* -------------------------------------------------------------------------- */
/*                            Globals & Constants                             */
/* -------------------------------------------------------------------------- */

/**
 * Number of user list items to display per page.
 * @type {number}
 */
const PAGE_SIZE = 100;

/**
 * Stores the complete list of anime entries in the user's collection.
 * @type {Array<Object>}
 */
let allUserList = [];

/**
 * Tracks the current active page in the user list table (1-based).
 * @type {number}
 */
let currentPage = 1;

/* -------------------------------------------------------------------------- */
/*                            Initialization                                  */
/* -------------------------------------------------------------------------- */

/**
 * Initializes the user details page on DOM content load.
 * Retrieves the username from the URL query parameters and initiates data loading.
 * Sets up tab navigation, list filtering, and pagination.
 */
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');

    if (!username) {
        showError("Username mancante nell'URL (?username=john)");
        return;
    }

    setupTabs();
    setupListFilter();
    setupPaginationButtons();
    loadUserDetails(username);
});

/* -------------------------------------------------------------------------- */
/*                            Data Fetching                                   */
/* -------------------------------------------------------------------------- */

/**
 * Fetches comprehensive user details from the API.
 * Retrieves profile data, statistics, recent activity, anime list, and favorites.
 * Dispatches data to specific population functions.
 *
 * @param {string} username - The username of the user to load.
 * @returns {Promise<void>}
 */
async function loadUserDetails(username) {
    try {
        showLoading();
        // Chiama la nuova API Gateway unificata
        const response = await axios.get(`/api/users/${encodeURIComponent(username)}`);
        const data = response.data;

        const profile = data.profile;
        populateUserHeader(profile);
        populateUserStats(profile);
        populateUserProfileInfo(profile);
        populateUserRecent(data.recent || []);
        populateUserList(data.list || []);
        populateUserFavourites(data.favourites || []);
        populateUserScoreStats(data.list || []);

        hideLoading();
    } catch (error) {
        console.error('Errore caricamento dati utente:', error);
        showError('Errore nel caricamento dei dati utente');
    }
}

/* -------------------------------------------------------------------------- */
/*                            Tab Navigation                                  */
/* -------------------------------------------------------------------------- */

/**
 * Sets up the tab navigation logic.
 * Handles click events on tab links to toggle visibility of content sections
 * (Profile, List, Favorites, Stats).
 */
function setupTabs() {
    const tabs = document.querySelectorAll('#user-tabs .nav-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-section');

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            ['profile-section', 'list-section', 'favs-section', 'stats-section']
                .forEach(id => {
                    const section = document.getElementById(id);
                    if (section) {
                        section.style.display = (id === target) ? 'block' : 'none';
                    }
                });
        });
    });
}

/* -------------------------------------------------------------------------- */
/*                            Header & Profile Info                           */
/* -------------------------------------------------------------------------- */

/**
 * Populates the user header with summary information.
 * Updates username, display name, watching status summary, join date, and total stats.
 *
 * @param {Object} profile - User profile object.
 */
function populateUserHeader(profile) {
    updateText('user-username', profile.username || 'N/A');
    updateText('user-displayname', profile.displayName || '');

    const statsSummary =
        `${profile.watching || 0} Watching • ` +
        `${profile.completed || 0} Completed • ` +
        `${profile.on_hold || 0} On Hold`;
    updateText('user-stats-summary', statsSummary.trim());

    updateText(
        'user-location-age',
        `${profile.location || 'N/A'} • Joined ${profile.joined || 'N/A'} • ${profile.gender || 'N/A'}`
    );

    const total =
        (profile.watching || 0) +
        (profile.completed || 0) +
        (profile.on_hold || 0) +
        (profile.dropped || 0) +
        (profile.plan_to_watch || 0);

    updateText('user-total-stats', `Total: ${total} • Avg Score: ${profile.avgScore || 'N/A'}`);
}

/**
 * Populates the detailed statistics summary section.
 *
 * @param {Object} profile - User profile object containing status counts.
 */
function populateUserStats(profile) {
    updateText('user-stats-watching', `Watching: ${profile.watching || 0}`);
    updateText('user-stats-completed', `Completed: ${profile.completed || 0}`);
    updateText('user-stats-onhold', `On hold: ${profile.on_hold || 0}`);
    updateText('user-stats-dropped', `Dropped: ${profile.dropped || 0}`);
    updateText('user-stats-plantowatch', `Plan to watch: ${profile.plan_to_watch || 0}`);
}

/**
 * Populates the user's personal information section.
 *
 * @param {Object} profile - User profile object with location, gender, etc.
 */
function populateUserProfileInfo(profile) {
    updateText('user-location', `Location: ${profile.location || 'N/A'}`);
    updateText('user-joined', `Joined: ${profile.joined || 'N/A'}`);
    updateText('user-gender', `Gender: ${profile.gender || 'N/A'}`);
}

/* -------------------------------------------------------------------------- */
/*                            Recent Activity                                 */
/* -------------------------------------------------------------------------- */

/**
 * Renders the user's recent activity list.
 * Shows the latest 8 updated anime entries as mini cards.
 *
 * @param {Array<Object>} recent - List of recent anime updates.
 */
function populateUserRecent(recent) {
    clearContainer('user-recent-list');
    recent.slice(0, 8).forEach(anime => {
        // Forza il tipo 'anime' per le attività recenti (sono sempre rating di anime)
        anime.type = 'anime';
        appendAnimeMiniCard('user-recent-list', anime);
    });
}

/* -------------------------------------------------------------------------- */
/*                            User List & Pagination                          */
/* -------------------------------------------------------------------------- */

/**
 * Initializes the full user anime list.
 * Resets pagination to the first page and triggers rendering.
 *
 * @param {Array<Object>} list - Complete list of user's anime entries.
 */
function populateUserList(list) {
    allUserList = list || [];
    currentPage = 1;
    renderCurrentPage();
}

/**
 * Sets up the status filter dropdown for the anime list.
 * Resets pagination to page 1 when the filter changes.
 */
function setupListFilter() {
    const filter = document.getElementById('list-status-filter');
    if (filter) {
        filter.addEventListener('change', () => {
            currentPage = 1;
            renderCurrentPage();
        });
    }
}

/**
 * Sets up pagination controls (Previous/Next buttons).
 */
function setupPaginationButtons() {
    const prevBtn = document.getElementById('list-prev');
    const nextBtn = document.getElementById('list-next');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCurrentPage();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const { totalPages } = getFilteredAndPaged();
            if (currentPage < totalPages) {
                currentPage++;
                renderCurrentPage();
            }
        });
    }
}

/**
 * Filters the user list based on the selected status and calculates pagination data.
 *
 * @returns {Object} An object containing:
 * - filtered: The full filtered list.
 * - pageItems: The slice of items for the current page.
 * - totalPages: Total number of pages.
 * - page: The validated current page number.
 */
function getFilteredAndPaged() {
    const filter = document.getElementById('list-status-filter');
    const value = filter ? filter.value.toLowerCase() : 'all';

    const filtered = allUserList.filter(entry => {
        if (value === 'all') return true;
        const status = (entry.status || '').toLowerCase();
        return status === value;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(Math.max(currentPage, 1), totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    return { filtered, pageItems, totalPages, page: safePage };
}

/**
 * Renders the current page of the user anime list into the table body.
 * Updates pagination information text.
 */
function renderCurrentPage() {
    const tbody = document.getElementById('user-anime-list-body');
    if (!tbody) return;

    const { filtered, pageItems, totalPages, page } = getFilteredAndPaged();
    currentPage = page;

    clearTableRows('user-anime-list-body');

    const fragment = document.createDocumentFragment();
    pageItems.forEach(entry => {
        const row = createListRow(entry);
        fragment.appendChild(row);
    });
    tbody.appendChild(fragment);

    updatePaginationInfo(page, totalPages, filtered.length);
}

/**
 * Updates the pagination info text (e.g., "Page 1 / 5 • 450 items").
 *
 * @param {number} page - Current page number.
 * @param {number} totalPages - Total number of pages.
 * @param {number} totalItems - Total number of filtered items.
 */
function updatePaginationInfo(page, totalPages, totalItems) {
    const infoSpan = document.getElementById('list-page-info');
    if (!infoSpan) return;
    infoSpan.textContent = `Page ${page} / ${totalPages} • ${totalItems} items`;
}

/**
 * Creates a table row (TR) element for a single anime list entry.
 *
 * @param {Object} entry - Anime list entry object.
 * @returns {HTMLTableRowElement} The constructed table row.
 */
function createListRow(entry) {
    const row = document.createElement('tr');

    const animeTd = document.createElement('td');
    const link = document.createElement('a');
    // Nella lista anime, sappiamo che sono sempre anime
    link.href = `anime-details?id=${encodeURIComponent(entry.animeId)}`;
    link.textContent = entry.title || 'N/A';
    link.classList.add('text-light', 'text-decoration-none');
    animeTd.appendChild(link);
    row.appendChild(animeTd);

    const statusTd = document.createElement('td');
    let statusDisplay = (entry.status || 'N/A')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    const status = entry.status;
    const badgeClass =
        status === 'completed' ? 'bg-success' :
            status === 'watching' ? 'bg-primary' :
                status === 'on_hold' ? 'bg-warning' :
                    status === 'dropped' ? 'bg-danger' :
                        status === 'plan_to_watch' ? 'bg-secondary' :
                            'bg-secondary';

    const badge = document.createElement('span');
    badge.className = `badge ${badgeClass}`;
    badge.textContent = statusDisplay;
    statusTd.appendChild(badge);
    row.appendChild(statusTd);

    const scoreTd = document.createElement('td');
    scoreTd.textContent = (entry.score && entry.score > 0) ? entry.score : '-';
    row.appendChild(scoreTd);

    const epsTd = document.createElement('td');
    epsTd.textContent = entry.numWatchedEpisodes || 0;
    row.appendChild(epsTd);

    const rewatchTd = document.createElement('td');
    rewatchTd.textContent = entry.isRewatching ? 'Sì' : '-';
    row.appendChild(rewatchTd);

    return row;
}

/* -------------------------------------------------------------------------- */
/*                            Favorites & Stats                               */
/* -------------------------------------------------------------------------- */

/**
 * Renders the user's favorite anime grid.
 *
 * @param {Array<Object>} favs - List of favorite anime/character/person objects.
 */
function populateUserFavourites(favs) {
    clearContainer('user-favourites-grid');
    favs.forEach(item => {
        appendAnimeMiniCard('user-favourites-grid', item);
    });
}

/**
 * Calculates and renders the score distribution statistics table.
 * Shows the count and percentage of anime given a specific score (1-10).
 *
 * @param {Array<Object>} list - Complete user anime list.
 */
function populateUserScoreStats(list) {
    clearTableRows('user-score-distribution');
    const scores = {};
    list.forEach(entry => {
        if (entry.score) {
            scores[entry.score] = (scores[entry.score] || 0) + 1;
        }
    });

    const total = list.length || 1;
    Object.keys(scores).sort((a, b) => b - a).forEach(score => {
        const count = scores[score];
        const perc = ((count / total) * 100).toFixed(1);
        appendTableRow('user-score-distribution', [score, count, `${perc}%`]);
    });
}

/* -------------------------------------------------------------------------- */
/*                            DOM & Template Helpers                          */
/* -------------------------------------------------------------------------- */

/**
 * Appends a mini card to a container using a template.
 * Used for "Recent Activity" and "Favorites".
 * Handles different types (Anime, Character, Person).
 *
 * @param {string} containerId - ID of the container element.
 * @param {Object} item - Item object data (anime, character, or person).
 */
function appendAnimeMiniCard(containerId, item) {
    const template = document.getElementById('anime-mini-card-template');
    if (!template) return;

    const fragment = template.content.cloneNode(true);
    const img = fragment.querySelector('.anime-mini-img');
    const title = fragment.querySelector('.anime-mini-title');
    const status = fragment.querySelector('.anime-mini-status');

    // Helper per formattare lo status (solo se presente)
    const getStatusDisplay = (st) => {
        if (!st) return '';
        const map = {
            'watching': 'Watching',
            'completed': 'Completed',
            'on_hold': 'On Hold',
            'dropped': 'Dropped',
            'plan_to_watch': 'Plan To Watch'
        };
        return map[st] || st;
    };

    // Immagine e Titolo
    img.src = item.imageUrl || '/placeholder-anime.jpg';
    img.alt = item.title || '';
    title.textContent = item.title || 'N/A';

    // Gestione Link Dinamico (fondamentale per supportare Person e Character)
    const id = item.id || item.animeId || item.malId;
    let detailsPage = 'anime-details'; // default

    // Controlliamo il tipo per indirizzare alla pagina giusta
    // Il backend ora restituisce type: 'anime', 'character', o 'person'
    const type = (item.type || '').toLowerCase();

    if (type === 'character') {
        detailsPage = 'character-details'; // Assicurati di avere questa pagina frontend
    } else if (type === 'person' || type === 'people') {
        detailsPage = 'person-details';    // Assicurati di avere questa pagina frontend
    }

    const targetUrl = `/${detailsPage}?id=${encodeURIComponent(id)}`;
    title.href = targetUrl;

    // Gestione Sottotitolo (Status/Score vs Type)
    if (item.status) {
        // Caso "Recent Activity" (ha status e score)
        const stText = getStatusDisplay(item.status);
        const scText = item.score ? ` • ${item.score}` : '';
        status.textContent = `${stText}${scText}`;
    } else {
        // Caso "Favorites"
        // Mostriamo il tipo (es. "Character", "Person") formattato bene
        const typeLabel = type.charAt(0).toUpperCase() + type.slice(1) || 'Favorite';
        status.textContent = typeLabel;
    }

    const container = document.getElementById(containerId);
    if (container) {
        container.appendChild(fragment);
        const colDiv = container.lastElementChild;
        const card = colDiv ? colDiv.querySelector('.card') : null;

        if (card) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                // Evita di scatenare il click se si clicca direttamente sul titolo (che è già un <a>)
                if (e.target !== title) {
                    window.location.href = targetUrl;
                }
            });
            card.addEventListener('mouseenter', () => card.style.transform = 'scale(1.02)');
            card.addEventListener('mouseleave', () => card.style.transform = 'scale(1)');
        }
    }
}

/**
 * Appends a new row to a table body with the provided cell texts.
 *
 * @param {string} tableId - ID of the table body element.
 * @param {Array<string|number>} cells - Array of text values for the cells.
 */
function appendTableRow(tableId, cells) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    const row = document.createElement('tr');
    cells.forEach(text => {
        const td = document.createElement('td');
        td.textContent = text;
        row.appendChild(td);
    });
    tbody.appendChild(row);
}

/* -------------------------------------------------------------------------- */
/*                            Utility Functions                               */
/* -------------------------------------------------------------------------- */

/**
 * Updates the text content of a DOM element.
 *
 * @param {string} id - Element ID.
 * @param {string} text - Text content to set.
 */
function updateText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
}

/**
 * Clears the inner HTML of a container element.
 *
 * @param {string} containerId - Element ID.
 */
function clearContainer(containerId) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = '';
}

/**
 * Clears all rows from a table body.
 *
 * @param {string} tableId - Table body ID.
 */
function clearTableRows(tableId) {
    const tbody = document.getElementById(tableId);
    if (tbody) tbody.innerHTML = '';
}

/**
 * Displays a loading spinner at the top of the user details container.
 */
function showLoading() {
    const container = document.getElementById('user-details');
    if (!container) return;

    let spinner = document.getElementById('loading-spinner');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.className = 'loading-spinner text-center py-5';
        spinner.innerHTML =
            '<div class="spinner-border text-light" role="status">' +
            '<span class="visually-hidden">Loading...</span>' +
            '</div>';
        container.prepend(spinner);
    }
}

/**
 * Removes the loading spinner from the DOM.
 */
function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner && spinner.parentNode) {
        spinner.parentNode.removeChild(spinner);
    }
}

/**
 * Displays a critical error message in the main container.
 * Clears existing content before showing the alert.
 *
 * @param {string} message - Error message to display.
 */
function showError(message) {
    const container = document.getElementById('user-details');
    if (!container) return;
    container.innerHTML = '';
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger';
    alert.textContent = message;
    container.appendChild(alert);
}
