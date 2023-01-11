import express from "express";
import { nanoid } from "nanoid";
const router = express.Router();
const idLength = 5; //primary key

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - userID
 *         - userName
 *         - coinBalance
 *       properties:
 *         userID:
 *           type: string
 *           description: The auto-generated id of the user
 *         userName:
 *           type: string
 *           description: The username of the user
 *         coinBalance:
 *           type: integer
 *           description: Coin balance of the user
 *       example:
 *         "userID": "bqNiw"
 *         "userName": "Hugh"
 *         "coinBalance": 100
 */

 /**
  * @swagger
  * tags:
  *   name: Users
  *   description: The User-Coin Balance managing API
  */

/**
 * @swagger
 * /users/{userName}:
 *   post:
 *     summary: Create a user with a username => initializes the user with userName, userID, and a coinBalance of 100
 *     tags: [Users]
 *     parameters:
 *      - in: path
 *        name: userName
 *        schema:
 *          type: string
 *        required: true
 *        description: The Username
 *     responses:
 *       200:
 *         description: User was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: User tried to input duiplicate name. Username capitalization matters! For example, jason != Jason
 *       500:
 *         description: Internal server error
 */

 router.post("/:userName", (req, res) => { // route, callback function
	
	const userInput = req.params.userName;
	let userDB = req.app.db;
	userDB.read();
	let userArray = userDB.data.users; // array of users

	try {
		// Error 400: check if userName exists already
		for (let i = 0; i < userArray.length; i++) {
			if (userArray[i].userName === userInput) {
				return res.status(400).send(`${userInput} is a duplicate name and already in the database!`)
			}
		}

		const newUser = {
			id: nanoid(idLength),
			userName: userInput,
			coinBalance: 100
		};

		// add user to database
		userDB.data.users.push(newUser)
		userDB.write()
		
		// 200 OK
		return res.send(newUser)

	} catch (error) {
		console.log(error)
		return res.status(500).send(error);
	}
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Returns a list of Users with their => userIDs, userNames, and coinBalances.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of userNames, userID, and coinBalance.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */

 router.get("/", (req, res) => {
	
	try{
		req.app.db.read()
		const users = req.app.db.data;
		
		// 200 OK
		return res.send(users);

	} catch(error) {
		console.log(error)
		return res.status(500).send(error);
	}
	
});

/**
 * @swagger
 * /users/{userName}:
 *   get:
 *     summary: Returns a specific User and their Coin Balance.
 *     tags: [Users]
 *     parameters:
 *      - in: path
 *        name: userName
 *        schema:
 *          type: string
 *        required: true
 *        description: The Username
 *     responses:
 *       200:
 *         description: A single user with their userID, userName, and coinBalance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found in database. Username capitalization matters! For example, jason != Jason
 *       500:
 *         description: Internal server error
 */

 router.get("/:userName", (req, res) => {
	
	const userInput = req.params.userName;
	let userDB = req.app.db;
	userDB.read();
	let userArray = userDB.data.users; // array of users

	try{
		// check if userName exists already
		for (let i = 0; i < userArray.length; i++) {
			if (userArray[i].userName === userInput) {
				// 200 OK
				return res.send(userArray[i])
			} 
		}
		// Error 404: If for loop exits without returning user object from DB, user does not exist
		return res.status(404).send(`${userInput} does not exist in the database.`
			+ ` Username capitalization matters! For example, jason != Jason`)
	
	} catch(error) {
		console.log(error)
		return res.status(500).send(error);
	}
	
});

/**
 * @swagger
 * /users/{userName1}/{userName2}/{coinsToTransfer}:
 *  put:
 *    summary: Transfer coins from User 1 to User 2
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: userName1
 *        schema:
 *          type: string
 *        required: true
 *        description: Username of User 1, HAS to exist in database
 *      - in: path
 *        name: userName2
 *        schema:
 *          type: string
 *        required: true
 *        description: Username of User 2, HAS to exist in database
 *      - in: path
 *        name: coinsToTransfer
 *        schema:
 *          type: integer
 *        required: true
 *        description: Amount of coins to transfer from User 1 to User 2, cannot be negative AND User 1 HAS to have enough coins.
 *      
 *    responses:
 *      200:
 *        description: Coins were successfully transferred from User 1 to User 2.
 *      400:
 *        description: Coin transfer amount is not allowed or not possible.
 *      404:
 *        description: User 1, User 2, or BOTH were not found in the database.
 *      500:
 *        description: Internal server error
 */

 router.put("/:userName1/:userName2/:coinsToTransfer", (req, res) => {
	
	// initialize variables
	const userInput1 = req.params.userName1;
	const userInput2 = req.params.userName2;
	const coinTransfer = parseInt(req.params.coinsToTransfer);
	let userDB = req.app.db;
	userDB.read();
	let userArray = userDB.data.users; // array of users

	let user1 = null;
	let user2 = null;
	try {
		// check if both userNames are in the database
		let user1Exist = false;
		let user2Exist = false;
		for (let i = 0; i < userArray.length; i++) {
			if (userArray[i].userName === userInput1) {
				// user 1 exists
				user1Exist = true;
				user1 = userArray[i];
			}
			if (userArray[i].userName === userInput2) {
				// user 2 exists
				user2Exist = true;
				user2 = userArray[i];
			}
		}
		// Error 404: Users weren't found
		if (!user1Exist && !user2Exist) {
			return res.status(404).send(`Both ${userInput1} AND ${userInput2} do not exist in the database.`);
		} else if (!user1Exist) {
			return res.status(404).send(`${userInput1} does not exist in the database.`);
		} else if (!user2Exist) {
			return res.status(404).send(`${userInput2} does not exist in the database.`);
		}
		// Error 400: Inputted coin balance is incorrect
		if (user1.coinBalance < coinTransfer) {
			return res.status(400).send(`${user1.userName} only has ${user1.coinBalance} coins, ${coinTransfer}` + 
			` coins is too much for a possible transfer`);
		} else if (coinTransfer < 0) {
			return res.status(400).send(`${coinTransfer} is a negative amount and not allowed!`);
		}


		const previousUser1Bal = user1.coinBalance;
		user1.coinBalance -= coinTransfer;

		const previousUser2Bal = user2.coinBalance;
		user2.coinBalance += coinTransfer;
		
		// 200 OK
		return res.send(`${user1.userName} previously had ${previousUser1Bal} coins, now they have ${user1.coinBalance} coins.\n` 
		+ `${user2.userName} previously had ${previousUser2Bal} coins, now they have ${user2.coinBalance} coins.`)

	} catch (error) {
		console.log(error)
		return res.status(500).send(error);
	}
});


export default router;
