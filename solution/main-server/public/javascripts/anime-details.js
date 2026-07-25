/**
 * Anime details page script.
 * Handles: tabs, loading anime details, characters, voice actors (filter/sort/pagination),
 * recommendations, reviews and related DOM utilities.
 */

/* ---------------- Page init ---------------- */

/**
 * Initializes the page when the DOM is fully loaded.
 * Reads the anime id from the URL and triggers initial data loading.
 *
 * @listens DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get('id');

    if (!animeId) {
        showError("Anime ID mancante nell'URL");
        return;
    }

    setupTabs(animeId);
    loadAnimeDetails(animeId);
    loadAnimeReviews(animeId);
});

/* ---------------- API: Anime details ---------------- */

/**
 * Fetches anime details from the backend and populates all sections.
 *
 * @param {string} animeId - Anime identifier read from query string.
 * @returns {Promise<void>}
 */
async function loadAnimeDetails(animeId) {
    try {
        showLoading();

        const response = await axios.get(`/api/anime/${animeId}`);
        const data = response.data;

        populateAnimeDetails(data.anime);
        populateStats(data.stats);
        populateCharacters(data.characters);
        populateVoiceActors(data.voiceActors);
        populateRecommendations(data.recommendations);

        hideLoading();
    } catch (error) {
        console.error('Errore caricamento dati:', error);
        showError('Errore nel caricamento dei dati');
    }
}

/* ---------------- Tabs ---------------- */

/**
 * Sets up tab navigation. Clicking a tab shows its section and hides the others.
 * Also reloads reviews when the reviews tab is selected.
 *
 * @param {string} animeId - Current anime id (used to reload reviews).
 * @returns {void}
 */
function setupTabs(animeId) {
    currentAnimeId = animeId;
    const tabs = document.querySelectorAll('#anime-tabs .nav-link');

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-section');
            tabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');

            [
                'details-section',
                'characters-section',
                'stats-section',
                'voice-section',
                'recommendations-section',
                'reviews-section',
            ].forEach((id) => {
                const section = document.getElementById(id);
                if (section) {
                    section.style.display = id === target ? 'block' : 'none';
                }
            });

            if (target === 'reviews-section' && animeId) {
                loadAnimeReviews(animeId, 1);
            }
        });
    });
}

/* ---------------- Loading / Error ---------------- */

/**
 * Shows a loading spinner in the main container (if not already present).
 * @returns {void}
 */
function showLoading() {
    const container = document.getElementById('anime-details');
    const existingSpinner = container.querySelector('.loading-spinner');
    if (!existingSpinner) {
        const spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.className = 'loading-spinner text-center py-5';
        spinner.textContent = 'Caricamento dettagli anime...';
        container.appendChild(spinner);
    }
}

/**
 * Removes the loading spinner if present.
 * @returns {void}
 */
function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.remove();
}

/**
 * Displays an error alert inside the main container and removes any spinner.
 *
 * @param {string} message - Error message to show.
 * @returns {void}
 */
function showError(message) {
    hideLoading();
    const container = document.getElementById('anime-details');
    const existingError = container.querySelector('.error-alert');
    if (existingError) existingError.remove();

    const alert = document.createElement('div');
    alert.className = 'alert alert-danger error-alert';
    alert.textContent = message;
    container.appendChild(alert);
}

/* ---------------- Anime header + synopsis ---------------- */

/**
 * Populates the main “details” header section (image, titles, type/status, score, dates, synopsis).
 *
 * @param {Object} anime - Anime object.
 * @param {string} [anime.imageUrl] - Poster URL.
 * @param {string} [anime.title] - Main title.
 * @param {string} [anime.titleJapanese] - Japanese title.
 * @param {string} [anime.type] - Type (TV/Movie/etc).
 * @param {string} [anime.status] - Airing status.
 * @param {number} [anime.score] - Score (avg).
 * @param {string|Date} [anime.startDate] - Start date.
 * @param {string|Date} [anime.endDate] - End date.
 * @param {string} [anime.url] - External link (e.g., MAL).
 * @param {string} [anime.synopsis] - Synopsis text.
 * @returns {void}
 */
function populateAnimeDetails(anime) {
    updateElement('anime-image', {
        src: anime.imageUrl || '/placeholder-anime.jpg',
        alt: anime.title,
    });
    updateText('anime-title', anime.title);
    updateText('anime-title-jp', anime.titleJapanese || '');

    const typeStatus = `${anime.type || ''}${anime.status ? ' · ' + anime.status : ''}`.trim();
    updateText('anime-type-status', typeStatus);
    updateText('anime-score', `Score: ${anime.score || 'N/A'}`);

    const startDate = anime.startDate ? new Date(anime.startDate).toISOString().split('T')[0] : '';
    const endDate = anime.endDate ? new Date(anime.endDate).toISOString().split('T')[0] : '';
    updateText('anime-dates', `From: ${startDate} – To: ${endDate}`);

    updateElement('anime-mal-link', { href: anime.url || '#' });
    updateText('anime-synopsis-text', anime.synopsis || 'Synopsis non disponibile');
}

/* ---------------- Stats ---------------- */

/**
 * Populates the stats section and the score distribution table.
 *
 * @param {Object|null} stats - Stats object or null/undefined.
 * @param {number} [stats.total]
 * @param {number} [stats.watching]
 * @param {number} [stats.completed]
 * @param {number} [stats.onHold]
 * @param {number} [stats.dropped]
 * @param {number} [stats.planToWatch]
 * @returns {void}
 */
function populateStats(stats) {
    if (!stats) return;

    updateText('anime-stats-total', `Total users: ${stats.total || 0}`);
    updateText('anime-stats-watching', `Watching: ${stats.watching || 0}`);
    updateText('anime-stats-completed', `Completed: ${stats.completed || 0}`);
    updateText('anime-stats-onhold', `On hold: ${stats.onHold || 0}`);
    updateText('anime-stats-dropped', `Dropped: ${stats.dropped || 0}`);
    updateText('anime-stats-plantowatch', `Plan to watch: ${stats.planToWatch || 0}`);

    clearTableRows('anime-score-distribution');

    for (let i = 10; i >= 1; i--) {
        const votes = stats[`score${i}Votes`] || 0;
        const percentage = stats[`score${i}Percentage`] || 0;
        if (votes > 0) {
            appendTableRow('anime-score-distribution', [
                i,
                Math.round(votes).toLocaleString(),
                `${percentage.toFixed(1)}%`,
            ]);
        }
    }
}

/* ---------------- Characters ---------------- */

/**
 * Full characters list.
 * @type {Array<Object>}
 */
let allCharacters = [];

/**
 * Populates the characters section (preview list + full list).
 *
 * @param {Array<Object>} characters - Characters list.
 * @returns {void}
 */
function populateCharacters(characters) {
    allCharacters = characters || [];

    clearContainer('anime-characters-list');
    allCharacters.slice(0, 8).forEach((char) => {
        appendCharacterCard('anime-characters-list', char);
    });

    clearContainer('anime-characters-all');
    allCharacters.forEach((char) => {
        appendCharacterCard('anime-characters-all', char);
    });
}

/**
 * Appends a character card (cloned from template) into a container.
 *
 * @param {string} containerId - Target container id.
 * @param {Object} char - Character data.
 * @param {string} [char.image] - Character image URL.
 * @param {string} [char.name] - Character name.
 * @param {string} [char.role] - Role (Main/Supporting).
 * @returns {void}
 */
function appendCharacterCard(containerId, char) {
    const template = document.getElementById('character-card-template');
    if (!template) return;

    const fragment = template.content.cloneNode(true);
    const img = fragment.querySelector('.character-img');
    const nameEl = fragment.querySelector('.character-name');
    const roleEl = fragment.querySelector('.character-role');

    img.src = char.image || '/placeholder-character.jpg';
    img.alt = char.name;
    nameEl.textContent = char.name;
    roleEl.textContent = char.role;

    const container = document.getElementById(containerId);
    if (container) {
        container.appendChild(fragment);
    }
}

/* ---------------- Voice Actors ---------------- */

/**
 * Full voice actors list.
 * @type {Array<Object>}
 */
let allVoiceActors = [];

/**
 * Current ordering state for voice actors table.
 * @type {{ key: (string|null), dir: ('asc'|'desc'|null) }}
 */
let currentVoiceOrder = { key: null, dir: null };

/**
 * Current page for voice actors table.
 * @type {number}
 */
let currentVoicePage = 1;

/**
 * Items per page for voice actors table.
 * @type {number}
 */
const VOICE_ITEMS_PER_PAGE = 16;

/**
 * Initializes voice actors data, language filters, and default sorting.
 *
 * @param {Array<Object>} voiceActors - List of voice actor entries.
 * @returns {void}
 */
function populateVoiceActors(voiceActors) {
    allVoiceActors = voiceActors || [];

    const languages = Array.from(new Set(allVoiceActors.map((v) => v.language).filter(Boolean))).sort();

    // Summary select (top 10 by language)
    const summarySelect = document.getElementById('voice-language-filter');
    if (summarySelect) {
        populateLanguageSelect(summarySelect, languages);
        summarySelect.value = 'Japanese'; // Default Japanese
        summarySelect.addEventListener('change', () => {
            applyVoiceLanguageFilter(summarySelect.value);
        });
        applyVoiceLanguageFilter('Japanese'); // Default render
    }

    // Voice tab select (full table filter)
    const voiceSelect = document.getElementById('voice-all-language-filter');
    if (voiceSelect) {
        populateLanguageSelect(voiceSelect, languages);
        voiceSelect.value = 'All';
        voiceSelect.addEventListener('change', () => {
            currentVoicePage = 1;
            renderVoiceActorsPage();
        });
    }

    currentVoiceOrder = { key: 'language', dir: 'asc' };
}

/**
 * Populates a language <select> with "All" plus the provided languages.
 *
 * @param {HTMLSelectElement} select - Target select element.
 * @param {Array<string>} languages - Sorted list of languages.
 * @returns {void}
 */
function populateLanguageSelect(select, languages) {
    select.innerHTML = '<option value="All">All</option>';
    languages.forEach((lang) => {
        const opt = document.createElement('option');
        opt.value = lang;
        opt.textContent = lang;
        select.appendChild(opt);
    });
}

/**
 * Applies a language filter and renders the top 10 entries into the summary table.
 *
 * @param {string} language - Language to filter by ("All" means no filter).
 * @returns {void}
 */
function applyVoiceLanguageFilter(language) {
    let filtered = allVoiceActors;

    if (language && language !== 'All') {
        filtered = allVoiceActors.filter((v) => v.language === language);
    }

    const top10 = filtered.slice(0, 10);
    renderVoiceActorsRows(top10, 'anime-voice-actors-body');
}

/**
 * Renders a list of voice actor entries into a table body.
 *
 * @param {Array<Object>} list - Voice actors to render.
 * @param {string} tableBodyId - Target tbody id.
 * @returns {void}
 */
function renderVoiceActorsRows(list, tableBodyId) {
    clearTableRows(tableBodyId);
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) return;

    list.forEach((va) => {
        const row = document.createElement('tr');

        const tdCharacter = document.createElement('td');
        tdCharacter.textContent = va.characterName || '';
        row.appendChild(tdCharacter);

        const tdRole = document.createElement('td');
        tdRole.textContent = va.role || '';
        row.appendChild(tdRole);

        const tdActor = document.createElement('td');
        if (va.personMalId != null) {
            const link = document.createElement('a');
            link.href = `/person-details?id=${encodeURIComponent(va.personMalId)}`;
            link.textContent = va.personName || '';
            link.classList.add('text-decoration-none');
            tdActor.appendChild(link);
        } else {
            tdActor.textContent = va.personName || '';
        }
        row.appendChild(tdActor);

        const tdLanguage = document.createElement('td');
        tdLanguage.textContent = va.language || '';
        row.appendChild(tdLanguage);

        tbody.appendChild(row);
    });
}

/**
 * Renders the “All voice actors” table applying filter, ordering and pagination.
 *
 * @returns {void}
 */
function renderVoiceActorsPage() {
    let list = [...allVoiceActors];

    const voiceSelect = document.getElementById('voice-all-language-filter');
    const currentFilter = voiceSelect ? voiceSelect.value : 'All';

    if (currentFilter !== 'All') {
        list = list.filter((v) => v.language === currentFilter);
    }

    // Ordering
    if (currentVoiceOrder.key && currentVoiceOrder.dir) {
        const key = currentVoiceOrder.key;
        const dir = currentVoiceOrder.dir === 'asc' ? 1 : -1;
        list.sort((a, b) => {
            const va = (a[key] || '').toString().toLowerCase();
            const vb = (b[key] || '').toString().toLowerCase();
            if (va < vb) return -1 * dir;
            if (va > vb) return 1 * dir;
            return 0;
        });
    }

    // Pagination
    const start = (currentVoicePage - 1) * VOICE_ITEMS_PER_PAGE;
    const end = start + VOICE_ITEMS_PER_PAGE;
    const pageList = list.slice(start, end);

    renderVoiceActorsRows(pageList, 'anime-voice-actors-all');
    renderVoicePagination();
    updateVoiceSortIcons();
}

/**
 * Renders pagination controls for the “All voice actors” table.
 *
 * @returns {void}
 */
function renderVoicePagination() {
    let filteredList = [...allVoiceActors];
    const voiceSelect = document.getElementById('voice-all-language-filter');
    const currentFilter = voiceSelect ? voiceSelect.value : 'All';

    if (currentFilter !== 'All') {
        filteredList = filteredList.filter((v) => v.language === currentFilter);
    }

    const totalPages = Math.ceil(filteredList.length / VOICE_ITEMS_PER_PAGE);

    let paginationNav = document.querySelector('#voice-section nav');
    if (!paginationNav) {
        paginationNav = document.createElement('nav');
        paginationNav.className = 'mt-3';
        const tableContainer = document.querySelector('#voice-section .table-responsive');
        if (tableContainer) {
            tableContainer.parentNode.insertBefore(paginationNav, tableContainer.nextSibling);
        }
    }

    const ul = paginationNav.querySelector('ul');
    if (ul) ul.remove();

    const paginationUl = document.createElement('ul');
    paginationUl.className = 'pagination pagination-sm justify-content-center';
    paginationNav.appendChild(paginationUl);

    // Buttons
    appendVoicePaginationButton(paginationUl, '« Prev', currentVoicePage - 1, currentVoicePage === 1);

    const startPage = Math.max(1, currentVoicePage - 2);
    const endPage = Math.min(totalPages, currentVoicePage + 2);

    for (let p = startPage; p <= endPage; p++) {
        appendVoicePaginationButton(paginationUl, p.toString(), p, false, p === currentVoicePage);
    }

    appendVoicePaginationButton(
        paginationUl,
        'Next »',
        currentVoicePage + 1,
        currentVoicePage >= totalPages
    );
}

/**
 * Appends a pagination button for voice actors pagination.
 *
 * @param {HTMLElement} container - The <ul> element container.
 * @param {string} label - Button label.
 * @param {number} targetPage - Target page number (1-based).
 * @param {boolean} disabled - Whether the button is disabled.
 * @param {boolean} [active=false] - Whether the button is the active page.
 * @returns {void}
 */
function appendVoicePaginationButton(container, label, targetPage, disabled, active = false) {
    const li = document.createElement('li');
    li.className = `page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}`;

    const button = document.createElement('button');
    button.className = 'page-link';
    button.type = 'button';
    button.textContent = label;

    if (!disabled) {
        button.addEventListener('click', () => {
            currentVoicePage = targetPage;
            renderVoiceActorsPage();
        });
    }

    li.appendChild(button);
    container.appendChild(li);
}

/**
 * Updates the sort “arrow” indicators in the voice actors table headers.
 * NOTE: this function is defined twice in the original file; the later definition overwrites the earlier one.
 *
 * @returns {void}
 */
function updateVoiceSortIcons() {
    const mapping = {
        'va-sort-character': 'characterName',
        'va-sort-role': 'role',
        'va-sort-actor': 'personName',
        'va-sort-language': 'language',
    };
    Object.entries(mapping).forEach(([id, key]) => {
        const th = document.getElementById(id);
        if (!th) return;
        const baseText =
            th.getAttribute('data-base-text') || th.textContent.replace(/[↑↓]/g, '').trim();
        th.setAttribute('data-base-text', baseText);
        th.textContent = baseText;
        if (currentVoiceOrder.key === key && currentVoiceOrder.dir) {
            const arrow = currentVoiceOrder.dir === 'asc' ? ' ↑' : ' ↓';
            th.textContent = baseText + arrow;
        }
    });
}

/**
 * Triggers voice actors table initialization when the voice tab is opened.
 * @type {HTMLElement|null}
 */
const voiceTab = document.querySelector('[data-section="voice-section"]');

voiceTab.addEventListener('click', () => {
    if (allVoiceActors.length > 0) {
        setupVoiceSortHeaders();
        currentVoicePage = 1;
        renderVoiceActorsPage();
    }
});

/**
 * Sets up the "See All Voice Actors" button behavior.
 *
 * @listens DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', function () {
    const seeAllBtn = document.getElementById('see-all-voice-actors');
    if (seeAllBtn) {
        seeAllBtn.addEventListener('click', () => {
            const voiceTab = document.querySelector('[data-section="voice-section"]');
            if (voiceTab) {
                voiceTab.click();
                currentVoicePage = 1;
                const voiceSelect = document.getElementById('voice-all-language-filter');
                if (voiceSelect) voiceSelect.value = 'All';
            }
        });
    }
});

/* --- Sorting headers per All Voice Actors --- */

/**
 * Attaches click handlers to voice actors table headers to enable sorting.
 *
 * @returns {void}
 */
function setupVoiceSortHeaders() {
    const mapping = {
        'va-sort-character': 'characterName',
        'va-sort-role': 'role',
        'va-sort-actor': 'personName',
        'va-sort-language': 'language',
    };

    Object.entries(mapping).forEach(([id, key]) => {
        const th = document.getElementById(id);
        if (!th) return;

        th.style.cursor = 'pointer';
        th.addEventListener('click', () => {
            toggleVoiceSort(key);
        });
    });
}

/**
 * Toggles sort state for the voice actors list.
 * Cycle: not selected -> asc -> desc -> none.
 *
 * @param {string} key - Field name to sort by.
 * @returns {void}
 */
function toggleVoiceSort(key) {
    if (currentVoiceOrder.key !== key) {
        currentVoiceOrder = { key, dir: 'asc' };
    } else {
        if (currentVoiceOrder.dir === 'asc') {
            currentVoiceOrder.dir = 'desc';
        } else if (currentVoiceOrder.dir === 'desc') {
            currentVoiceOrder = { key: null, dir: null };
        } else {
            currentVoiceOrder.dir = 'asc';
        }
    }
    renderVoiceActorsPage();
    updateVoiceSortIcons();
}

/**
 * Updates the sort icons in headers (unicode arrows variant).
 * NOTE: This second definition overwrites the earlier updateVoiceSortIcons().
 *
 * @returns {void}
 */
function updateVoiceSortIcons() {
    const mapping = {
        'va-sort-character': 'characterName',
        'va-sort-role': 'role',
        'va-sort-actor': 'personName',
        'va-sort-language': 'language',
    };

    Object.entries(mapping).forEach(([id, key]) => {
        const th = document.getElementById(id);
        if (!th) return;

        const baseText =
            th.getAttribute('data-base-text') || th.textContent.replace(/[\u2191\u2193]/g, '').trim();
        th.setAttribute('data-base-text', baseText);
        th.textContent = baseText;

        if (currentVoiceOrder.key === key && currentVoiceOrder.dir) {
            const arrow = currentVoiceOrder.dir === 'asc' ? ' \u2191' : ' \u2193';
            th.textContent = baseText + arrow;
        }
    });
}

/* ---------------- Recommendations ---------------- */

/**
 * Full recommendations list.
 * @type {Array<Object>}
 */
let allRecommendations = [];

/**
 * Stores recommendations and renders them.
 *
 * @param {Array<Object>} recommendations - Recommended anime list.
 * @returns {void}
 */
function populateRecommendations(recommendations) {
    allRecommendations = recommendations || [];
    renderRecommendations(allRecommendations, 'anime-recommendations');
}

/**
 * Renders recommendation cards into a container.
 *
 * @param {Array<Object>} list - Recommended anime list.
 * @param {string} containerId - Target container id.
 * @returns {void}
 */
function renderRecommendations(list, containerId) {
    clearContainer(containerId);
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!list || !list.length) {
        const noRec = document.createElement('p');
        noRec.className = 'col-12 text-muted text-center py-5';
        noRec.textContent = 'Nessuna raccomandazione disponibile.';
        container.appendChild(noRec);
        return;
    }

    list.forEach((anime) => {
        const template = document.getElementById('recommendation-card-template');
        if (!template) {
            console.error('Template recommendation-card-template mancante');
            return;
        }

        const fragment = template.content.cloneNode(true);
        const img = fragment.querySelector('.anime-img');
        const titleEl = fragment.querySelector('.card-title');
        const typeBadge = fragment.querySelector('.badge');
        const scoreEl = fragment.querySelector('.card-body span'); // generic

        if (!img || !titleEl || !typeBadge) {
            console.warn('Elementi template mancanti per:', anime.title);
            return;
        }

        img.src = anime.imageUrl || '/placeholder-anime.jpg';
        img.alt = anime.title;
        titleEl.textContent = anime.title;
        typeBadge.textContent = anime.type || 'N/A';
        if (scoreEl) {
            scoreEl.textContent = anime.score ? anime.score.toFixed(1) : 'N/A';
        }

        const card = fragment.querySelector('.card');
        if (card) {
            card.addEventListener('click', () => {
                window.location.href = `anime-details?id=${anime.malId}`;
            });
            card.addEventListener('mouseenter', () => (card.style.transform = 'scale(1.05)'));
            card.addEventListener('mouseleave', () => (card.style.transform = 'scale(1)'));
        }

        container.appendChild(fragment);
    });
}

/* ---------------- Reviews ---------------- */

/**
 * Current anime id (shared across components).
 * @type {string|null}
 */
let currentAnimeId = null;

/**
 * Fetches paginated reviews for the given anime and renders them.
 *
 * @param {string} animeId - Anime id.
 * @param {number} [page=1] - Page number (1-based).
 * @param {number} [limit=15] - Page size.
 * @returns {Promise<void>}
 */
async function loadAnimeReviews(animeId, page = 1, limit = 15) {
    try {
        const response = await axios.get(`/api/anime/${animeId}/reviews`, {
            params: { page, limit },
        });
        renderReviews(response.data.reviews || []);
        renderReviewsPagination(animeId, response.data.pagination || {});
    } catch (error) {
        console.error('Errore caricamento reviews:', error);
        showReviewsError();
    }
}

/**
 * Renders reviews list into the reviews container.
 *
 * @param {Array<Object>} reviews - Reviews list.
 * @returns {void}
 */
function renderReviews(reviews) {
    const container = document.getElementById('anime-reviews-container');
    if (!container) return;

    clearContainer('anime-reviews-container');

    if (!reviews.length) {
        const noReviews = document.createElement('p');
        noReviews.className = 'text-muted';
        noReviews.textContent = 'Nessuna recensione disponibile.';
        container.appendChild(noReviews);
        return;
    }

    reviews.forEach((review) => {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = 'list-group-item list-group-item-action list-group-item-dark mb-2';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'd-flex w-100 justify-content-between mb-1';

        const usernameEl = document.createElement('a');
        usernameEl.href = `user-details?username=${encodeURIComponent(review.username)}`;
        usernameEl.textContent = review.username;
        usernameEl.className = 'mb-1 text-light text-decoration-none h6';
        usernameEl.style.cursor = 'pointer';
        usernameEl.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `user-details?username=${encodeURIComponent(review.username)}`;
        });
        headerDiv.appendChild(usernameEl);

        const scoreBadge = document.createElement('span');
        scoreBadge.className = 'badge bg-primary fs-6';
        scoreBadge.textContent = `${review.score}/10`;
        headerDiv.appendChild(scoreBadge);

        reviewDiv.appendChild(headerDiv);

        const statusP = document.createElement('p');
        statusP.className = 'mb-2 small';
        statusP.textContent = `${review.status} • ${review.episodes} episodi`;
        reviewDiv.appendChild(statusP);

        const dateEl = document.createElement('small');
        dateEl.className = 'text-muted d-block';
        dateEl.textContent = new Date(review.date).toLocaleDateString('it-IT');
        reviewDiv.appendChild(dateEl);

        container.appendChild(reviewDiv);
    });
}

/**
 * Renders reviews pagination buttons (max 5 pages visible).
 *
 * @param {string} animeId - Anime id.
 * @param {Object} pagination - Pagination metadata.
 * @param {number} [pagination.page=1] - Current page.
 * @param {number} [pagination.totalPages=1] - Total pages.
 * @returns {void}
 */
function renderReviewsPagination(animeId, pagination) {
    const ul = document.getElementById('reviews-pagination');
    if (!ul) return;

    clearContainer('reviews-pagination');

    const { page = 1, totalPages = 1 } = pagination;
    if (totalPages <= 1) return;

    // Prev
    appendPaginationButton(ul, '« Prev', page - 1, page === 1, animeId);

    // Pages
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);
    for (let p = startPage; p <= endPage; p++) {
        appendPaginationButton(ul, p.toString(), p, false, animeId, p === page);
    }

    // Next
    appendPaginationButton(ul, 'Next »', page + 1, page === totalPages, animeId);
}

/**
 * Appends a reviews pagination button.
 *
 * @param {HTMLElement} container - <ul> container.
 * @param {string} label - Button label.
 * @param {number} targetPage - Target page.
 * @param {boolean} disabled - Disabled state.
 * @param {string} animeId - Anime id used to reload reviews.
 * @param {boolean} [active=false] - Active state.
 * @returns {void}
 */
function appendPaginationButton(container, label, targetPage, disabled, animeId, active = false) {
    const li = document.createElement('li');
    li.className = `page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}`;

    const button = document.createElement('button');
    button.className = 'page-link';
    button.type = 'button';
    button.textContent = label;

    if (!disabled) {
        button.addEventListener('click', () => loadAnimeReviews(animeId, targetPage));
    }

    li.appendChild(button);
    container.appendChild(li);
}

/**
 * Shows a warning alert inside the reviews container.
 * @returns {void}
 */
function showReviewsError() {
    const container = document.getElementById('anime-reviews-container');
    if (!container) return;

    clearContainer('anime-reviews-container');

    const alert = document.createElement('div');
    alert.className = 'alert alert-warning';
    alert.textContent = 'Errore nel caricamento delle recensioni.';
    container.appendChild(alert);
}

/* ---------------- Utility DOM ---------------- */

/**
 * Updates the textContent of an element by id.
 *
 * @param {string} id - Element id.
 * @param {string} text - Text to set.
 * @returns {void}
 */
function updateText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
}

/**
 * Assigns multiple properties to a DOM element by id.
 * Example: updateElement('img', { src: '...', alt: '...' }).
 *
 * @param {string} id - Element id.
 * @param {Object<string, any>} attrs - Key/value map of properties to assign.
 * @returns {void}
 */
function updateElement(id, attrs) {
    const element = document.getElementById(id);
    if (element) {
        Object.entries(attrs).forEach(([key, value]) => {
            element[key] = value;
        });
    }
}

/**
 * Clears the inner HTML of a table body/container element by id.
 *
 * @param {string} tableId - Target element id (tbody or container).
 * @returns {void}
 */
function clearTableRows(tableId) {
    const tbody = document.getElementById(tableId);
    if (tbody) tbody.innerHTML = '';
}

/**
 * Appends a row to a table body identified by id.
 *
 * @param {string} tableId - Target tbody id.
 * @param {Array<string|number>} cells - Cell contents.
 * @returns {void}
 */
function appendTableRow(tableId, cells) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;

    const row = document.createElement('tr');
    cells.forEach((cellText) => {
        const td = document.createElement('td');
        td.textContent = cellText;
        row.appendChild(td);
    });
    tbody.appendChild(row);
}

/**
 * Clears a container element by id.
 *
 * @param {string} containerId - Container id.
 * @returns {void}
 */
function clearContainer(containerId) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = '';
}
