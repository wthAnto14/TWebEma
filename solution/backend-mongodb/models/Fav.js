const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @typedef {Object} Fav
 * @property {string} username - The user who added the favorite.
 * @property {('anime'|'character'|'person'|'manga')} fav_type - The category of the favorite item.
 * @property {number} id - The unique ID of the item (e.g., Anime ID or Character ID).
 */

/**
 * Mongoose Schema for User Favorites.
 * Represents an item (anime, character, etc.) marked as favorite by a user.
 *
 * @type {mongoose.Schema<Fav>}
 */
const favSchema = new Schema({
    username: { type: String, required: true },
    fav_type: { type: String, enum: ['anime', 'character', 'company', 'people'], required: true },
    id: { type: Number, required: true }
});

favSchema.index({ username: 1, fav_type: 1 });

module.exports = mongoose.model('Fav', favSchema);
