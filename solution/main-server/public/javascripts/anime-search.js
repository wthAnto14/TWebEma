/* -------------------------------------------------------------------------- */
/*                                DOM Elements                                */
/* -------------------------------------------------------------------------- */

/**
 * The main search form element.
 * @type {HTMLFormElement}
 */
const form = document.getElementById('search-form');

/**
 * The input field for the anime title search.
 * @type {HTMLInputElement}
 */
const input = document.getElementById('title-input');

/**
 * The section element that wraps the search results.
 * @type {HTMLElement}
 */
const resultsSection = document.getElementById('results-section');

/**
 * The container element where anime result items will be appended.
 * @type {HTMLElement}
 */
const resultsList = document.getElementById('results');

/**
 * Paragraph element used to display status messages (loading, errors, no results).
 * @type {HTMLParagraphElement}
 */
const messageP = document.getElementById('message');

/**
 * The HTML template for a single anime result item.
 * @type {HTMLTemplateElement}
 */
const template = document.getElementById('anime-item-template');

/**
 * The button used to submit the search form.
 * @type {HTMLButtonElement}
 */
const searchButton = document.getElementById('search-button');

/* -------------------------------------------------------------------------- */
/*                                Pagination                                  */
/* -------------------------------------------------------------------------- */

/**
 * The navigation container for pagination controls.
 * @type {HTMLElement}
 */
const paginationNav = document.getElementById('pagination-nav');

/**
 * Button to go to the previous page of results.
 * @type {HTMLButtonElement}
 */
const prevPageBtn = document.getElementById('prev-page');

/**
 * Button to go to the next page of results.
 * @type {HTMLButtonElement}
 */
const nextPageBtn = document.getElementById('next-page');

/**
 * Element displaying the current page number and total pages.
 * @type {HTMLElement}
 */
const pageInfo = document.getElementById('page-info');

/**
 * Number of results to display per page.
 * @type {number}
 */
const PAGE_SIZE = 10;

/**
 * Stores the complete list of search results fetched from the server.
 * @type {Array<Object>}
 */
let allResults = [];

/**
 * Tracks the current page number being displayed (1-based index).
 * @type {number}
 */
let currentPage = 1;

/* -------------------------------------------------------------------------- */
/*                            Anime Search Logic                              */
/* -------------------------------------------------------------------------- */

/**
 * Clears all currently displayed anime result items from the DOM.
 * Removes elements with the class 'anime-item-instance'.
 */
function clearResults() {
    resultsList
        .querySelectorAll('.anime-item-instance')
        .forEach((el) => el.remove());
}

/**
 * Renders a specific page of search results.
 * Calculates the slice of `allResults` to show based on `PAGE_SIZE` and the requested page.
 * Clones the template for each anime and populates it with data.
 * Updates pagination controls (buttons disabled state, page info text).
 *
 * @param {number} page - The page number to render (1-based).
 */
function renderPage(page) {
    if (!allResults.length) return;

    const totalPages = Math.ceil(allResults.length / PAGE_SIZE);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    clearResults();

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageItems = allResults.slice(start, end);

    pageItems.forEach((anime) => {
        const clone = template.cloneNode(true);
        clone.id = '';
        clone.classList.remove('d-none');
        clone.classList.add('anime-item-instance', 'anime-result-link');

        const malId = anime.malId ?? anime.mal_id;
        if (malId != null) {
            clone.setAttribute('data-anime-id', malId);
        }

        const title = clone.querySelector('.anime-title');
        const score = clone.querySelector('.anime-score');
        const type = clone.querySelector('.anime-type');
        const titleJap = clone.querySelector('.title-japanese');
        const img = clone.querySelector('.anime-poster');

        if (title) {
            title.textContent = anime.title || 'Titolo sconosciuto';
        }
        if (score) {
            score.textContent = anime.score ?? 'N/A';
        }
        if (type) {
            type.textContent = anime.type || 'N/A';
        }
        if (titleJap) {
            titleJap.textContent = anime.titleJapanese || 'N/A';
        }
        if (img) {
            img.src = anime.imageUrl || '';
            img.alt = anime.title || 'Poster anime';
        }

        resultsList.appendChild(clone);
    });

    if (paginationNav) {
        paginationNav.classList.remove('d-none');
    }
    if (pageInfo) {
        pageInfo.textContent = `Pagina ${currentPage} di ${totalPages}`;
    }
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage === 1;
    }
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage === totalPages;
    }
}

// Event Listeners for Anime Search

if (form) {
    /**
     * Handles the search form submission.
     * Prevents default submission, shows loading state, fetches data from the API,
     * and triggers the rendering of the first page of results.
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titleValue = input.value.trim();
        if (!titleValue) return;

        messageP.classList.add('d-none');
        messageP.textContent = '';

        resultsSection.classList.remove('d-none');
        clearResults();
        if (paginationNav) {
            paginationNav.classList.add('d-none');
        }

        messageP.textContent = 'Caricamento...';
        messageP.classList.remove('d-none');

        try {
            const response = await axios.get('/api/anime/search', {
                params: { title: titleValue }
            });
            const data = response.data;

            messageP.classList.add('d-none');
            messageP.textContent = '';

            if (!data || data.length === 0) {
                messageP.textContent = 'Nessun risultato trovato.';
                messageP.classList.remove('d-none');
                allResults = [];
                if (paginationNav) paginationNav.classList.add('d-none');
                return;
            }

            allResults = data;
            renderPage(1);
        } catch (err) {
            console.error(err);
            clearResults();
            messageP.textContent = 'Errore nella chiamata al server.';
            messageP.classList.remove('d-none');
            if (paginationNav) paginationNav.classList.add('d-none');
        }
    });
}

if (input && searchButton) {
    /**
     * Enables or disables the search button based on input length.
     * Requires at least 3 characters to enable the button.
     */
    const toggleButton = () => {
        const value = input.value.trim();
        searchButton.disabled = value.length < 3;
    };
    toggleButton();
    input.addEventListener('input', toggleButton);
}

if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
        renderPage(currentPage - 1);
    });
}

if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
        renderPage(currentPage + 1);
    });
}

/**
 * Global event listener for clicking on an anime result card.
 * Redirects the user to the anime details page using the 'data-anime-id' attribute.
 */
document.addEventListener('click', (event) => {
    const target = event.target.closest('.anime-result-link');
    if (!target) return;

    const animeId = target.getAttribute('data-anime-id');
    if (!animeId) return;

    window.location.href = `/anime-details?id=${encodeURIComponent(animeId)}`;
});

/* -------------------------------------------------------------------------- */
/*                            User Search Logic                               */
/* -------------------------------------------------------------------------- */

/**
 * The form element for searching users.
 * @type {HTMLFormElement}
 */
const userForm = document.getElementById('user-search-form');

/**
 * The input field for the username search.
 * @type {HTMLInputElement}
 */
const userInput = document.getElementById('username-input');

/**
 * The button used to submit the user search form.
 * @type {HTMLButtonElement}
 */
const userSearchButton = document.getElementById('user-search-button');

/**
 * The container list where user search results will be displayed.
 * @type {HTMLElement}
 */
const userResultsList = document.getElementById('user-results');

/**
 * Paragraph element used to display messages for user search (loading, errors).
 * @type {HTMLElement}
 */
const userMessage = document.getElementById('user-message');

/**
 * Clears the user search results list.
 */
function clearUserResults() {
    if (userResultsList) userResultsList.innerHTML = '';
}

if (userInput && userSearchButton) {
    /**
     * Enables or disables the user search button based on input length.
     * Requires at least 2 characters to enable the button.
     */
    const toggleUserBtn = () => {
        const value = userInput.value.trim();
        userSearchButton.disabled = value.length < 2;
    };
    toggleUserBtn();
    userInput.addEventListener('input', toggleUserBtn);
}

if (userForm) {
    /**
     * Handles the user search form submission.
     * Fetches matching users from the API and displays them as a list.
     * Clicking a user redirects to their details page.
     */
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const q = userInput.value.trim();
        if (!q) return;

        clearUserResults();
        if (userMessage) {
            userMessage.textContent = 'Loading...';
            userMessage.classList.remove('d-none');
        }

        try {
            const res = await axios.get('/api/users/search', { params: { q } });
            const users = res.data || [];

            clearUserResults();
            if (!users.length) {
                if (userMessage) {
                    userMessage.textContent = 'Nessun utente trovato.';
                    userMessage.classList.remove('d-none');
                }
                return;
            }

            if (userMessage) userMessage.classList.add('d-none');

            users.forEach(u => {
                const li = document.createElement('li');
                li.className = 'list-group-item bg-dark text-light d-flex justify-content-between align-items-center user-result-item hover-scale';
                li.textContent = u.username;
                li.title = u.username;
                li.addEventListener('click', () => {
                    window.location.href = `/user-details?username=${encodeURIComponent(u.username)}`;
                });
                userResultsList.appendChild(li);
            });
        } catch (err) {
            console.error('Errore ricerca utenti:', err);
            clearUserResults();
            if (userMessage) {
                userMessage.textContent = 'Errore nella ricerca utenti.';
                userMessage.classList.remove('d-none');
            }
        }
    });
}
