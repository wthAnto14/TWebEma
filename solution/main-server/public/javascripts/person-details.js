/* -------------------------------------------------------------------------- */
/*                            Globals & Constants                             */
/* -------------------------------------------------------------------------- */

/**
 * Number of voice work items to display per page.
 * @type {number}
 */
const PAGE_SIZE = 15;

/**
 * Stores the full list of voice acting roles (voice works) retrieved from the server.
 * @type {Array<Object>}
 */
let allVoiceWorks = [];

/**
 * Tracks the current active page of the voice works table (1-based index).
 * @type {number}
 */
let currentPage = 1;

/**
 * Keeps track of the current sorting configuration for the voice works table.
 * @type {{ key: string|null, dir: 'asc'|'desc'|null }}
 */
let currentOrder = { key: 'animeTitle', dir: 'asc' };

/* -------------------------------------------------------------------------- */
/*                            Initialization                                  */
/* -------------------------------------------------------------------------- */

/**
 * Initializes the person details page on DOM load.
 * Retrieves the person ID from the URL query string and initiates data fetching.
 * Sets up event listeners for sorting and pagination.
 */
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        showError('Person ID mancante nell’URL');
        return;
    }

    setupSortingHeaders();
    setupPaginationButtons();
    loadPerson(id);
});

/* -------------------------------------------------------------------------- */
/*                            Data Fetching                                   */
/* -------------------------------------------------------------------------- */

/**
 * Fetches detailed information about a person (voice actor) from the API.
 * Populates the UI with personal details and voice acting roles.
 *
 * @param {string} id - The unique identifier of the person to load.
 * @returns {Promise<void>}
 */
async function loadPerson(id) {
    try {
        const res = await axios.get(`/api/person/${id}`);
        const data = res.data || {};

        populatePerson(data.person, data.alternateNames || []);
        allVoiceWorks = data.voiceWorks || [];
        currentPage = 1;
        renderVoiceWorks();
    } catch (e) {
        console.error(e);
        showError('Errore nel caricamento dei dati del doppiatore');
    }
}

/* -------------------------------------------------------------------------- */
/*                            UI Population                                   */
/* -------------------------------------------------------------------------- */

/**
 * Populates the DOM elements with the person's biographical information.
 * Handles the display of name, images, alternate names, birthday, and external links.
 * Hides elements if corresponding data is missing.
 *
 * @param {Object} person - The person object containing biographical data.
 * @param {Array<string>} altNames - List of alternate names for the person.
 */
function populatePerson(person, altNames) {
    if (!person) {
        showError('Doppiatore non trovato');
        return;
    }

    const img = document.getElementById('person-image');
    const nameEl = document.getElementById('person-name');
    const givenEl = document.getElementById('person-given-name');
    const familyEl = document.getElementById('person-family-name');
    const altEl = document.getElementById('person-alt-names');
    const bdayEl = document.getElementById('person-birthday');
    const favEl = document.getElementById('person-favorites');
    const locEl = document.getElementById('person-location');
    const webEl = document.getElementById('person-website');
    const malLinkEl = document.getElementById('person-mal-link');

    if (img) {
        img.src = person.imageUrl || '/placeholder-person.jpg';
        img.alt = person.name || 'Voice actor';
    }
    if (nameEl) {
        nameEl.textContent = person.name || 'Unknown';
    }

    if (givenEl) {
        givenEl.textContent = person.givenName ?? '';
        if (!person.givenName) givenEl.parentElement.style.display = 'none';
    }

    if (familyEl) {
        familyEl.textContent = person.familyName ?? '';
        if (!person.familyName) familyEl.parentElement.style.display = 'none';
    }

    const altText = (altNames || []).filter(Boolean).join(', ');
    if (altEl) {
        if (altText) {
            altEl.textContent = `Also known as: ${altText}`;
        } else {
            altEl.textContent = '';
            altEl.style.display = 'none';
        }
    }

    if (bdayEl) {
        if (person.birthday) {
            const dateStr = person.birthday.split('T')[0];
            bdayEl.textContent = `Birthday: ${dateStr}`;
        } else {
            bdayEl.textContent = '';
            bdayEl.style.display = 'none';
        }
    }

    if (favEl) {
        if (person.favorites) {
            favEl.textContent = `Favorites: ${person.favorites}`;
        } else {
            favEl.textContent = '';
            favEl.style.display = 'none';
        }
    }

    if (locEl) {
        if (person.relevantLocation) {
            locEl.textContent = `Location: ${person.relevantLocation}`;
        } else {
            locEl.textContent = '';
            locEl.style.display = 'none';
        }
    }

    if (webEl) {
        webEl.textContent = '';
        if (person.websiteUrl) {
            const prefix = document.createTextNode('Website: ');
            const link = document.createElement('a');
            link.href = person.websiteUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = person.websiteUrl;
            webEl.appendChild(prefix);
            webEl.appendChild(link);
        } else {
            webEl.style.display = 'none';
        }
    }

    if (malLinkEl) {
        if (person.url) {
            malLinkEl.href = person.url;
            malLinkEl.textContent = 'View on MyAnimeList';
        } else {
            malLinkEl.style.display = 'none';
        }
    }
}

/* -------------------------------------------------------------------------- */
/*                            Sorting Logic                                   */
/* -------------------------------------------------------------------------- */

/**
 * Attaches click event listeners to table headers to enable sorting.
 * Maps header IDs to the corresponding data keys in the voice works objects.
 */
function setupSortingHeaders() {
    const mapping = {
        'vw-sort-anime': 'animeTitle',
        'vw-sort-character': 'characterName',
        'vw-sort-role': 'role',
        'vw-sort-language': 'language'
    };

    Object.entries(mapping).forEach(([id, key]) => {
        const th = document.getElementById(id);
        if (!th) return;
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => {
            toggleSort(key);
        });
    });
}

/**
 * Toggles the sort direction for a given column key.
 * Cycle: Ascending -> Descending -> Original (null).
 * Resets to page 1 after sorting.
 *
 * @param {string} key - The property key to sort by (e.g., 'animeTitle').
 */
function toggleSort(key) {
    if (currentOrder.key !== key) {
        currentOrder = { key, dir: 'asc' };
    } else {
        if (currentOrder.dir === 'asc') {
            currentOrder.dir = 'desc';
        } else if (currentOrder.dir === 'desc') {
            currentOrder = { key: null, dir: null }; // ordine originale
        } else {
            currentOrder.dir = 'asc';
        }
    }
    currentPage = 1;
    renderVoiceWorks();
}

/**
 * Returns a sorted copy of the provided list based on the current sort configuration.
 *
 * @param {Array<Object>} list - The list of voice works to sort.
 * @returns {Array<Object>} The sorted list.
 */
function applySorting(list) {
    if (!currentOrder.key || !currentOrder.dir) {
        return list.slice();
    }

    const key = currentOrder.key;
    const dir = currentOrder.dir === 'asc' ? 1 : -1;

    return list.slice().sort((a, b) => {
        const va = (a[key] || '').toString().toLowerCase();
        const vb = (b[key] || '').toString().toLowerCase();
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
    });
}

/**
 * Updates the table header text to include sort direction arrows (↑/↓).
 */
function updateSortIcons() {
    const mapping = {
        'vw-sort-anime': 'animeTitle',
        'vw-sort-character': 'characterName',
        'vw-sort-role': 'role',
        'vw-sort-language': 'language'
    };

    Object.entries(mapping).forEach(([id, key]) => {
        const th = document.getElementById(id);
        if (!th) return;

        const baseText =
            th.getAttribute('data-base-text') ||
            th.textContent.replace(/[\u2191\u2193]/g, '').trim();

        th.setAttribute('data-base-text', baseText);
        th.textContent = baseText;

        if (currentOrder.key === key && currentOrder.dir) {
            const arrow = currentOrder.dir === 'asc' ? ' \u2191' : ' \u2193';
            th.textContent = baseText + arrow;
        }
    });
}

/* -------------------------------------------------------------------------- */
/*                            Pagination Logic                                */
/* -------------------------------------------------------------------------- */

/**
 * Attaches event listeners to the previous and next pagination buttons.
 */
function setupPaginationButtons() {
    const prevBtn = document.getElementById('vw-prev-page');
    const nextBtn = document.getElementById('vw-next-page');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage -= 1;
                renderVoiceWorks();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = getTotalPages();
            if (currentPage < totalPages) {
                currentPage += 1;
                renderVoiceWorks();
            }
        });
    }
}

/**
 * Calculates the total number of pages based on the total items and page size.
 * @returns {number} The total number of pages.
 */
function getTotalPages() {
    if (!allVoiceWorks.length) return 1;
    return Math.ceil(allVoiceWorks.length / PAGE_SIZE);
}

/**
 * Updates the visibility and state of pagination controls.
 * Shows/hides the nav bar and updates the page counter text.
 */
function updatePaginationUI() {
    const nav = document.getElementById('vw-pagination-nav');
    const pageInfo = document.getElementById('vw-page-info');
    const prevBtn = document.getElementById('vw-prev-page');
    const nextBtn = document.getElementById('vw-next-page');

    const totalPages = getTotalPages();

    if (allVoiceWorks.length > PAGE_SIZE && nav) {
        nav.classList.remove('d-none');
    } else if (nav) {
        nav.classList.add('d-none');
    }

    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
    }
}

/* -------------------------------------------------------------------------- */
/*                            Rendering                                       */
/* -------------------------------------------------------------------------- */

/**
 * Renders the table of voice works.
 * Handles sorting, pagination slicing, and creating table rows for each item.
 * Updates UI controls after rendering.
 */
function renderVoiceWorks() {
    const tbody = document.getElementById('person-works-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!allVoiceWorks.length) {
        updatePaginationUI();
        updateSortIcons();
        return;
    }

    const sorted = applySorting(allVoiceWorks);

    const totalPages = getTotalPages();
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageItems = sorted.slice(start, end);

    pageItems.forEach(w => {
        const tr = document.createElement('tr');

        const tdAnime = document.createElement('td');
        tdAnime.textContent = w.animeTitle || '';

        const tdChar = document.createElement('td');
        tdChar.textContent = w.characterName || '';

        const tdRole = document.createElement('td');
        tdRole.textContent = w.role || '';

        const tdLang = document.createElement('td');
        tdLang.textContent = w.language || '';

        tr.appendChild(tdAnime);
        tr.appendChild(tdChar);
        tr.appendChild(tdRole);
        tr.appendChild(tdLang);

        tbody.appendChild(tr);
    });

    updatePaginationUI();
    updateSortIcons();
}

/**
 * Displays a global error message on the page.
 * @param {string} msg - The error message to display.
 */
function showError(msg) {
    const err = document.getElementById('person-error');
    if (!err) return;
    err.textContent = msg;
    err.classList.remove('d-none');
}
