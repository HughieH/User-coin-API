import express from "express";
import { LowSync } from "lowdb";
import morgan from "morgan";
import cors from "cors";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import router from "./routes/users.js";
import { JSONFileSync } from 'lowdb/node'

const PORT = 4000;

const db = new LowSync(new JSONFileSync("db.json"))

const options = {
	definition: {
		openapi: "3.0.3",
		info: {
			title: "Coin User API in Node.js",
			version: "1.0.0",
			description: "An Express API for creating and interacting with users and their coin balances.\
			\nCreated by Hou Wai Wan for the VoyceMe backend technical assignment.",
		},
		servers: [
			{
				url: "http://localhost:4000",
			},
		],
	},
	apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

const app = express();

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

app.db = db;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/users", router);


app.listen(PORT, () => console.log(`The server is running on port ${PORT}`));
