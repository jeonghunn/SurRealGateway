import { sequelize } from "../bin/db";
import {
    DataTypes,
    Model,
} from "sequelize";


class User extends Model {
    id: number = 0;
    email: string = "";
    password: string = "";
    name: string = "";
    last_name: string = "";
    gender: number = 0;
}
User.init({
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    gender: DataTypes.TINYINT,

}, { sequelize, modelName: 'user' });
