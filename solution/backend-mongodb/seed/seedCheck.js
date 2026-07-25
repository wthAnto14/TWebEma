const { mongoose } = require('../databases/database');
const { seedAll } = require('./seedAll');

async function seedIfNeeded() {
    const count = await mongoose.connection.db
        .collection('ratings')
        .countDocuments();

    if (count === 0) {
        console.log('Seeding MongoDB (prima esecuzione)...');
        await seedAll();
    } else {
        console.log('MongoDB già popolato, salto seeding.');
    }
}

module.exports = { seedIfNeeded };
