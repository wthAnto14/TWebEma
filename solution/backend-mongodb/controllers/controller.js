const mongoose = require('mongoose');

const Rating = require('../models/Rating.js');
const Fav = require('../models/Fav.js');
const Profile = require('../models/Profile.js');

/**
 * Get the reviews for a specific anime with pagination.
 * @param {Object} req - The Express request object containing anime_id, page, and limit.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends the reviews and pagination metadata.
 */
async function getReviewsByAnime(req, res) {
    try {
        const { anime_id } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Rating.countDocuments({
            anime_id: parseInt(anime_id),
            score: { $exists: true, $gt: 0 }
        });

        const reviews = await Rating.find({
            anime_id: parseInt(anime_id),
            score: { $exists: true, $gt: 0 }
        })
            .select('username score status num_watched_episodes createdAt')
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 })  // indice _id sempre veloce
            .lean();

        res.json({
            reviews: reviews.map(r => ({
                username: r.username,
                score: r.score,
                status: r.status,
                episodes: r.num_watched_episodes || 0,
                date: r.createdAt
            })),
            pagination: {
                page,
                totalPages: Math.ceil(total / limit),
                total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Reviews error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
}

/**
 * Get a user's profile and their aggregated anime statistics.
 * @param {Object} req - The Express request object containing the username parameter.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends the user profile merged with their statistics.
 */
async function getUserProfile(req, res) {
    try {
        const { username } = req.params;  // ← username invece di userId

        // 1. Profilo base
        const profile = await Profile.findOne({ username }).lean();
        if (!profile) return res.status(404).json({ error: 'User not found' });

        // 2. Stats da ratings (match su username)
        const stats = await Rating.aggregate([
            { $match: { username } },  // ← username string
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    avgScore: { $avg: '$score' }
                }
            }
        ]);

        // Mappa stats (nota: profile ha già campi numerici!)
        const statsMap = {
            watching: stats.find(s => s._id === 'watching')?.count || profile.watching || 0,
            completed: stats.find(s => s._id === 'completed')?.count || profile.completed || 0,
            on_hold: stats.find(s => s._id === 'on_hold')?.count || profile.on_hold || 0,
            dropped: stats.find(s => s._id === 'dropped')?.count || profile.dropped || 0,
            plan_to_watch: stats.find(s => s._id === 'plan_to_watch')?.count || profile.plan_to_watch || 0,
            avgScore: stats[0]?.avgScore ? Math.round(stats[0].avgScore * 10) / 10 : 0
        };

        res.json({
            ...profile,
            ...statsMap,
            total: Object.values(statsMap).slice(0,5).reduce((a,b)=>a+b, 0)
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
}

/**
 * Get all anime ratings for a specific user.
 * @param {Object} req - The Express request object containing the username parameter.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends the list of user ratings.
 */
async function getUserRatings(req, res) {
    try {
        const { username } = req.params;  // ← username

        const ratings = await Rating.find({ username })  // ← username string
            .sort({ createdAt: -1 })
            .lean();

        res.json(ratings.map(r => ({
            animeId: r.anime_id,  // ← per frontend
            title: '',  // da Postgres
            imageUrl: '',  // da Postgres
            status: r.status,
            score: r.score,
            numWatchedEpisodes: r.num_watched_episodes,
            isRewatching: r.is_rewatching,
        })));

    } catch (error) {
        console.error('Ratings error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
}

/**
 * Get a user's favorite animes.
 * @param {Object} req - The Express request object containing the username parameter.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends the list of favorite animes.
 */
async function getUserFavourites(req, res) {
    try {
        const { username } = req.params;

        const favs = await Fav.find({ username })
            .lean();

        res.json(favs.map(f => ({
            id: f.id,
            animeId: f.id,
            title: '',
            imageUrl: '',
            type: f.fav_type
        })));

    } catch (error) {
        console.error('Favs error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
}

/**
 * Search for users by a username query string.
 * @param {Object} req - The Express request object containing the query parameter 'q'.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends a list of matching usernames (max 30).
 */
async function searchUsernames(req, res) {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({ error: 'Query troppo corta' });
        }

        const regex = new RegExp(q.trim(), 'i');
        console.log('Regex:', regex.source); // DEBUG

        console.log('Profile model:', Profile.modelName || 'OK'); // DEBUG

        const users = await Profile.find({ username: regex })
            .select('username')
            .limit(30)
            .lean();
        res.json(users);

    } catch (error) {
        console.error('searchUsernames ERRORE:', {
            message: error.message,
            name: error.name,
            query: req.query
        });
        res.status(500).json({ error: 'Server Error', debug: error.message });
    }
}


module.exports = {
    getReviewsByAnime,
    getUserProfile,
    getUserRatings,
    getUserFavourites,
    searchUsernames
};
