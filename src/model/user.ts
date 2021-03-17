import { sequelize } from "../bin/db";
import {
    DataTypes,
    Model,
} from "sequelize";


export class User extends Model {
    id: number = 0;
    email_name: string = "";
    email_host: string = "";
    password?: string = "";
    name?: string;
    last_name?: string;
    gender: number = 0;
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}
User.init({
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    email_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email_host: {
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

},{
    sequelize,
    modelName: 'user',
    tableName: 'user',
});
