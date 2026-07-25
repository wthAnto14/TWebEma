const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Rating = require('../models/Rating');
const Profile = require('../models/Profile');
const Fav = require('../models/Fav');
const Recommendation = require('../models/Recommendation');

const DATA_DIR = path.join(process.cwd(), 'data');
const BATCH_SIZE = 50000;

function importCsv(fileName, makeDoc, Model) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(DATA_DIR, fileName);
        const buffer = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', row => {
                buffer.push(makeDoc(row));
                if (buffer.length >= BATCH_SIZE) {
                    Model.insertMany(buffer.splice(0, buffer.length))
                        .catch(err => console.error(`Errore insertMany ${fileName}:`, err.message));
                }
            })
            .on('end', async () => {
                if (buffer.length > 0) {
                    await Model.insertMany(buffer);
                }
                console.log(`Import terminato: ${fileName}`);
                resolve();
            })
            .on('error', err => {
                console.error(`Errore durante la lettura di ${fileName}:`, err.message);
                reject(err);
            });
    });
}

async function seedAll() {
    await importCsv('ratings.csv', row => ({
        username: row.username,
        anime_id: Number(row.anime_id),
        status: row.status,
        score: row.score ? Number(row.score) : 0,
        is_rewatching: row.is_rewatching === '1' || row.is_rewatching === 'true',
        num_watched_episodes: Number(row.num_watched_episodes || 0),
    }), Rating);

    await importCsv('profiles.csv', row => ({
        username: row.username,
        gender: row.gender || '',
        birthday: row.birthday || '',
        location: row.location || '',
        joined: row.joined ? new Date(row.joined) : undefined,
        watching: Number(row.watching || 0),
        completed: Number(row.completed || 0),
        on_hold: Number(row.on_hold || 0),
        dropped: Number(row.dropped || 0),
        plan_to_watch: Number(row.plan_to_watch || 0),
    }), Profile);

    await importCsv('favs.csv', row => ({
        username: row.username,
        fav_type: row.fav_type,
        id: Number(row.id),
    }), Fav);
}

module.exports = { seedAll };
