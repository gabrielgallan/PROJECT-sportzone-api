import { env } from "./env/index.ts";
import { app } from "./http/app.ts";

app.listen(
	{
		port: env.PORT,
		host: "0.0.0.0",
	},
	(err, address) => {
		if (err) {
			console.error(err);
			process.exit(1);
		}

		console.log(`HTTP server is running on ${address}`);
	},
);
