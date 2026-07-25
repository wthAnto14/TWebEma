const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @typedef {Object} Profile
 * @property {string} username - The unique identifier for the user.
 * @property {('Male'|'Female'|'Non-binary'|'Unknown'|'')} [gender=''] - User's gender identity.
 * @property {string} [birthday] - Date of birth as a string.
 * @property {string} [location] - User's geographical location.
 * @property {Date} [joined] - Date when the user account was created.
 * @property {number} [watching] - Count of anime currently being watched.
 * @property {number} [completed] - Count of completed anime.
 * @property {number} [on_hold] - Count of anime on hold.
 * @property {number} [dropped] - Count of dropped anime.
 * @property {number} [plan_to_watch] - Count of anime planned to watch.
 */

/**
 * Mongoose Schema for User Profiles.
 * Stores personal information and aggregated anime statistics for a user.
 *
 * @type {mongoose.Schema<Profile>}
 */
const profileSchema = new Schema({
    username: { type: String, required: true, unique: true },
    gender: { type: String, enum: ['Male', 'Female', 'Non-binary', 'Unknown', ''], default: '' },
    birthday: { type: String },
    location: { type: String },
    joined: { type: Date },
    watching: { type: Number, min: 0 },
    completed: { type: Number, min: 0 },
    on_hold: { type: Number, min: 0 },
    dropped: { type: Number, min: 0 },
    plan_to_watch: { type: Number, min: 0 }
});

module.exports = mongoose.model('Profile', profileSchema);
