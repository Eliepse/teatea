import knex from "knex";

export function knexConnection() {
	return knex({
		client: "pg",
		connection: {
			host: "localhost",
			user: "admin",
			password: "admin",
			database: "teatea",
			port: 2345,
		},
	});
}
