const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @typedef {Object} Rating
 * @property {string} username - The user associated with this rating/status.
 * @property {number} anime_id - The ID of the anime being tracked.
 * @property {('watching'|'completed'|'on_hold'|'dropped'|'plan_to_watch'|'unknown')} status - Current watch status.
 * @property {number} [score] - User's score for the anime (0-10).
 * @property {boolean} [is_rewatching=false] - Whether the user is rewatching the anime.
 * @property {number} [num_watched_episodes] - Number of episodes watched so far.
 */

/**
 * Mongoose Schema for Anime Ratings/Status.
 * Tracks a user's interaction with a specific anime, including score and progress.
 *
 * @type {mongoose.Schema<Rating>}
 */
const ratingSchema = new Schema({
    username: { type: String, required: true },
    anime_id: { type: Number, required: true },
    status: {
        type: String,
        enum: ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch', 'unknown'],
        required: true
    },
    score: { type: Number, min: 0, max: 10 },
    is_rewatching: { type: Boolean, default: false },
    num_watched_episodes: { type: Number, min: 0 }
});

ratingSchema.index({ username: 1, anime_id: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
