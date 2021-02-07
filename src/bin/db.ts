import { Sequelize } from "sequelize";
const config = require('../config/db_config');

export const sequelize = new Sequelize(
    config.database,
    config.user,
    config.password,
    {
        host: config.host,
        dialect: "mariadb",
    }
);
