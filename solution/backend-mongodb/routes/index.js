const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');

/**
 * @swagger
 * tags:
 *   - name: Reviews
 *     description: Anime reviews management
 *   - name: Profiles
 *     description: User profiles management
 *   - name: Users
 *     description: User search and data
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f1b2c3e4b0d1a2f3c4e5d6"
 *         anime_id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: "otaku123"
 *         content:
 *           type: string
 *           example: "Great anime, loved the ending!"
 *         score:
 *           type: integer
 *           example: 9
 *         date:
 *           type: string
 *           format: date-time
 *     UserProfile:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           example: "otaku123"
 *         gender:
 *           type: string
 *           example: "Male"
 *         location:
 *           type: string
 *           example: "Tokyo"
 *         joined:
 *           type: string
 *           format: date-time
 *     Rating:
 *       type: object
 *       properties:
 *         animeId:
 *           type: integer
 *           example: 1535
 *         rating:
 *           type: integer
 *           example: 10
 *     Favourite:
 *       type: object
 *       properties:
 *         animeId:
 *           type: integer
 *           example: 21
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Internal Server Error"
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get reviews for an anime
 *     description: Retrieve a paginated list of reviews for a specific anime ID
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: query
 *         name: anime_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: MAL ID of the anime
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
 *         description: List of reviews found
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
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/reviews', controller.getReviewsByAnime);

/**
 * @swagger
 * /profiles/{username}:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve detailed profile information for a specific user
 *     tags:
 *       - Profiles
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the profile to retrieve
 *         example: "otaku123"
 *     responses:
 *       200:
 *         description: User profile found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profiles/:username', controller.getUserProfile);

/**
 * @swagger
 * /users/{username}/ratings:
 *   get:
 *     summary: Get user ratings
 *     description: Retrieve a list of anime ratings given by a user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: User's username
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Max number of ratings to return
 *     responses:
 *       200:
 *         description: List of user ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rating'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/users/:username/ratings', controller.getUserRatings);

/**
 * @swagger
 * /users/{username}/favourites:
 *   get:
 *     summary: Get user favourites
 *     description: Retrieve a list of favorite anime for a user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: User's username
 *     responses:
 *       200:
 *         description: List of user favourites
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Favourite'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/users/:username/favourites', controller.getUserFavourites);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search for users
 *     description: Search users by a partial username string (autocomplete style)
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Partial username query
 *         example: "ota"
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/users/search', controller.searchUsernames);

module.exports = router;
