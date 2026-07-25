// ============================================
// index.js - ROUTES (modificato con Swagger stile prof)
// ============================================

var express = require('express');
var router = express.Router();
const axios = require('axios');

/**
 * @swagger
 * tags:
 *   - name: Pages
 *     description: HTML pages rendering
 *   - name: Anime
 *     description: Anime search and details (proxy to Spring Boot)
 *   - name: Person
 *     description: Person details (proxy to Spring Boot)
 *   - name: Reviews
 *     description: Anime reviews (proxy to MongoDB server)
 *   - name: Users
 *     description: User profiles and ratings (proxy to MongoDB server)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AnimeSearchResult:
 *       type: object
 *       properties:
 *         malId:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "Cowboy Bebop"
 *         imageUrl:
 *           type: string
 *           example: "https://cdn.myanimelist.net/images/anime/4/19644.jpg"
 *     AnimeDetails:
 *       type: object
 *       properties:
 *         malId:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "Cowboy Bebop"
 *         titleJapanese:
 *           type: string
 *           example: "カウボーイビバップ"
 *         type:
 *           type: string
 *           example: "TV"
 *         totalEpisodes:
 *           type: integer
 *           example: 26
 *         imageUrl:
 *           type: string
 *           example: "https://cdn.myanimelist.net/images/anime/4/19644.jpg"
 *     PersonDetails:
 *       type: object
 *       properties:
 *         personMalId:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Watanabe, Shinichiro"
 *         imageUrl:
 *           type: string
 *           example: "https://cdn.myanimelist.net/images/voiceactors/2/12345.jpg"
 *     Review:
 *       type: object
 *       properties:
 *         animeId:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: "user123"
 *         score:
 *           type: integer
 *           example: 9
 *         reviewText:
 *           type: string
 *           example: "Amazing anime!"
 *     UserProfile:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           example: "otaku99"
 *         gender:
 *           type: string
 *           example: "Male"
 *         location:
 *           type: string
 *           example: "Tokyo, Japan"
 *         joined:
 *           type: string
 *           example: "2020-05-12"
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Errore nella chiamata al server"
 */

/**
 * GET home page.
 * @swagger
 * /:
 *   get:
 *     summary: Render the home page
 *     description: Returns the main HTML page for the Anime Portal
 *     tags:
 *       - Pages
 *     responses:
 *       200:
 *         description: HTML content of the home page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/', function(req, res, next) {
  res.redirect('/anime/search');
});

/**
 * @swagger
 * /anime/search:
 *   get:
 *     summary: Render anime search page
 *     description: Returns HTML page for anime search interface
 *     tags:
 *       - Pages
 *     responses:
 *       200:
 *         description: Anime search HTML page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/anime/search', function (req, res) {
  res.render('anime-search', { title: 'Anime Search' });
});

/**
 * Proxy ricerca anime -> Spring Boot
 * @swagger
 * /api/anime/search:
 *   get:
 *     summary: Search anime by title
 *     description: Proxies search request to Spring Boot backend (PostgreSQL)
 *     tags:
 *       - Anime
 *     parameters:
 *       - in: query
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: Anime title to search
 *         example: "Naruto"
 *     responses:
 *       200:
 *         description: List of anime matching the title
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AnimeSearchResult'
 *       400:
 *         description: Missing title parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/anime/search', async (req, res) => {
  const title = req.query.title;
  if (!title) {
    return res.status(400).json({ error: 'Titolo mancante' });
  }

  try {
    const response = await axios.get('http://localhost:8080/api/anime/search', {
      params: { title }
    });
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Errore nella chiamata al server' });
  }
});

/**
 * Pagina dettagli anime (HBS)
 * @swagger
 * /anime-details:
 *   get:
 *     summary: Render anime details page
 *     description: Returns HTML page for displaying anime details
 *     tags:
 *       - Pages
 *     responses:
 *       200:
 *         description: Anime details HTML page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/anime-details', function (req, res) {
  res.render('anime-details', { title: 'Anime Details' });
});

/**
 * Proxy dettagli anime -> Spring Boot
 * @swagger
 * /api/anime/{id}:
 *   get:
 *     summary: Get anime details by ID
 *     description: Proxies request to Spring Boot backend to retrieve anime details from PostgreSQL
 *     tags:
 *       - Anime
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Anime MAL ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Anime details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnimeDetails'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/anime/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const response = await axios.get(`http://localhost:8080/api/anime/${id}`);
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res
        .status(err.response?.status || 500)
        .json({ error: 'Errore nella chiamata al server' });
  }
});

/**
 * @swagger
 * /person-details:
 *   get:
 *     summary: Render person details page
 *     description: Returns HTML page for displaying person details
 *     tags:
 *       - Pages
 *     responses:
 *       200:
 *         description: Person details HTML page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/person-details', (req, res) => {
  res.render('person-details', { title: 'Person Details' });
});

/**
 * @swagger
 * /api/person/{id}:
 *   get:
 *     summary: Get person details by ID
 *     description: Proxies request to Spring Boot backend to retrieve person details from PostgreSQL
 *     tags:
 *       - Person
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Person MAL ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Person details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonDetails'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/person/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const response = await axios.get(`http://localhost:8080/api/person/${id}`);
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(err.response?.status || 500)
        .json({ error: 'Errore nella chiamata al server' });
  }
});

/**
 * @swagger
 * /anime/{id}/reviews:
 *   get:
 *     summary: Render anime reviews page
 *     description: Returns HTML page displaying paginated reviews for an anime
 *     tags:
 *       - Pages
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Anime MAL ID
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of reviews per page
 *     responses:
 *       200:
 *         description: Reviews HTML page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       500:
 *         description: Error loading reviews
 */
router.get('/anime/:id/reviews', async (req, res) => {
  const { id: anime_id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const reviewsResponse = await axios.get(
        `http://localhost:3001/mongo/reviews?anime_id=${anime_id}&page=${page}&limit=${limit}`
    );
    res.render('anime-reviews', {
      anime_id,
      reviews: reviewsResponse.data.reviews,
      pagination: reviewsResponse.data.pagination
    });
  } catch (err) {
    console.error('Errore reviews:', err.message);
    res.status(500).render('error', { message: 'Errore caricamento reviews' });
  }
});

/**
 * Proxy reviews anime -> server Mongo (porta 3001)
 * @swagger
 * /api/anime/{id}/reviews:
 *   get:
 *     summary: Get anime reviews (paginated)
 *     description: Proxies request to MongoDB server to retrieve reviews for a specific anime
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Anime MAL ID
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Reviews per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Paginated reviews for the anime
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 152
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/anime/:id/reviews', async (req, res) => {
  const { id: anime_id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const response = await axios.get('http://localhost:3001/reviews', {
      params: { anime_id, page, limit }
    });
    res.json(response.data);
  } catch (err) {
    console.error('Errore reviews:', err.message);
    res.status(err.response?.status || 500)
        .json({ error: 'Errore nella chiamata al server reviews' });
  }
});

/**
 * @swagger
 * /user-details:
 *   get:
 *     summary: Render user details page
 *     description: Returns HTML page for displaying user profile and stats
 *     tags:
 *       - Pages
 *     responses:
 *       200:
 *         description: User details HTML page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/user-details', function (req, res) {
  res.render('user-details', { title: 'User Details' });
});

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users by username
 *     description: Proxies search request to MongoDB server to find users matching query
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (min 2 characters)
 *         example: "otaku"
 *     responses:
 *       200:
 *         description: List of matching users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                     example: "otaku99"
 *       400:
 *         description: Query too short
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/users/search', async (req, res) => {
  const q = req.query.q;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Query troppo corta' });
  }

  try {
    const response = await axios.get('http://localhost:3001/users/search', {
      params: { q: q.trim() },
      timeout: 5000
    });
    res.json(response.data);
  } catch (err) {
    console.error('Proxy users/search ERR:', {
      message: err.message,
      status: err.response?.status,
      url: err.config?.url
    });
    res.status(500).json({ error: 'Errore server utenti', details: err.message });
  }
});

/**
 * @swagger
 * /api/users/{username}:
 *   get:
 *     summary: Retrieve full user profile details
 *     description: >
 *       Fetches a comprehensive user profile including personal info, statistics, recent activity,
 *       full anime list, and favourites. It aggregates data from the MongoDB user service
 *       and enriches it with details (titles, images) from the PostgreSQL anime/character/person service.
 *     tags:
 *       - User Aggregation
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique username of the user to retrieve
 *         example: "vincent007009"
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   description: User profile information from MongoDB
 *                   properties:
 *                     username:
 *                       type: string
 *                     displayName:
 *                       type: string
 *                     location:
 *                       type: string
 *                     joined:
 *                       type: string
 *                       format: date
 *                     gender:
 *                       type: string
 *                     watching:
 *                       type: integer
 *                     completed:
 *                       type: integer
 *                     on_hold:
 *                       type: integer
 *                     dropped:
 *                       type: integer
 *                     plan_to_watch:
 *                       type: integer
 *                 recent:
 *                   type: array
 *                   description: List of recently updated anime (max 8)
 *                   items:
 *                     $ref: '#/components/schemas/AnimeListEntry'
 *                 list:
 *                   type: array
 *                   description: Full list of anime in user's collection
 *                   items:
 *                     $ref: '#/components/schemas/AnimeListEntry'
 *                 favourites:
 *                   type: array
 *                   description: List of user's favourite items (Anime, Characters, People)
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the item (animeId, characterId, or personId)
 *                       type:
 *                         type: string
 *                         enum: [anime, character, person, people, TV, Movie]
 *                         description: The type of the favourite item
 *                       title:
 *                         type: string
 *                         description: Enriched title/name from PostgreSQL
 *                       imageUrl:
 *                         type: string
 *                         description: Enriched image URL from PostgreSQL
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error or failure to contact downstream services
 *
 * components:
 *   schemas:
 *     AnimeListEntry:
 *       type: object
 *       properties:
 *         animeId:
 *           type: integer
 *         score:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [watching, completed, on_hold, dropped, plan_to_watch]
 *         numWatchedEpisodes:
 *           type: integer
 *         title:
 *           type: string
 *         imageUrl:
 *           type: string
 *         totalEpisodes:
 *           type: integer
 */
router.get('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // 1. Recupera dati base da Mongo
    const profileRes = await axios.get(`http://localhost:3001/profiles/${username}`);
    const ratingsRes = await axios.get(`http://localhost:3001/users/${username}/ratings?limit=100`);
    const favsRes = await axios.get(`http://localhost:3001/users/${username}/favourites`);

    const profile = profileRes.data;
    const ratings = ratingsRes.data;
    const favourites = favsRes.data;
    const recent = ratings.slice(0, 8);

    // 2. Separa gli ID per categoria
    const animeIds = new Set(ratings.map(r => r.animeId));
    const charIds = new Set();
    const personIds = new Set();

    favourites.forEach(f => {
      // Normalizza i tipi per evitare problemi (anime, TV, Movie, OVA -> anime)
      if (!f.type || ['anime', 'TV', 'Movie', 'OVA', 'Special'].includes(f.type)) {
        animeIds.add(f.id);
      } else if (f.type === 'character') {
        charIds.add(f.id);
      } else if (f.type === 'person' || f.type === 'people') { // <--- Accetta entrambi
        personIds.add(f.id);
      }
    });

    // 3. Chiamate Batch in Parallelo
    const promises = [];

    // Anime
    if (animeIds.size > 0) {
      promises.push(
          axios.post('http://localhost:8080/api/anime/batch', { ids: [...animeIds] })
              .then(r => ({ type: 'anime', data: r.data }))
              .catch(e => { console.error('Anime batch error', e.message); return { type: 'anime', data: [] }; })
      );
    }

    // Characters
    if (charIds.size > 0) {
      promises.push(
          axios.post('http://localhost:8080/api/characters/batch', { ids: [...charIds] })
              .then(r => ({ type: 'character', data: r.data }))
              .catch(e => { console.error('Character batch error', e.message); return { type: 'character', data: [] }; })
      );
    }

    // People
    if (personIds.size > 0) {
      promises.push(
          // Assicurati che l'URL sia corretto (singolare o plurale come definito in Java)
          axios.post('http://localhost:8080/api/person/batch', { ids: [...personIds] })
              .then(r => ({ type: 'person', data: r.data }))
              .catch(e => { console.error('Person batch error', e.message); return { type: 'person', data: [] }; })
      );
    }

    const results = await Promise.all(promises);

    // 4. Mappe di Lookup
    const animeMap = {};
    const charMap = {};
    const personMap = {};

    results.forEach(res => {
      if (res.type === 'anime') {
        res.data.forEach(item => {
          animeMap[item.malId] = {
            title: item.title,
            imageUrl: item.imageUrl || '',
            totalEpisodes: item.totalEpisodes || 0
          };
        });
      } else if (res.type === 'character') {
        res.data.forEach(item => {
          charMap[item.malId] = {
            title: item.name,
            imageUrl: item.imageUrl || ''
          };
        });
      } else if (res.type === 'person') {
        res.data.forEach(item => {
          // CORREZIONE QUI: item.personMalId (senza la 'i' in Mail)
          if (item.personMalId) {
            personMap[item.personMalId] = {
              title: item.name,
              imageUrl: item.imageUrl || ''
            };
          }
        });
      }
    });

    // 5. Arricchisci i dati
    const recentWithDetails = recent.map(r => ({ ...r, ...animeMap[r.animeId] }));
    const listWithDetails = ratings.map(r => ({ ...r, ...animeMap[r.animeId] }));

    const favouritesWithDetails = favourites.map(f => {
      let details = {};

      if (!f.type || ['anime', 'TV', 'Movie', 'OVA', 'Special'].includes(f.type)) {
        details = animeMap[f.id] || {};
      } else if (f.type === 'character') {
        details = charMap[f.id] || {};
      } else if (f.type === 'person' || f.type === 'people') { // <--- Accetta entrambi
        details = personMap[f.id] || {};
      }

      return {
        ...f,
        title: details.title || 'Unknown Title',
        imageUrl: details.imageUrl || '/images/placeholder.jpg'
      };
    });

    res.json({
      profile,
      recent: recentWithDetails,
      list: listWithDetails,
      favourites: favouritesWithDetails
    });

  } catch (error) {
    console.error('User API error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
