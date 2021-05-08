import {
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from "sequelize-typescript";
import {Gender} from "./type";
import { sequelize } from "../bin/db";

@Table
export class User extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.BIGINT)
    id: number = 0;

    @Column(DataType.TEXT)
    email_name!: string;

    @Column(DataType.TEXT)
    email_host!: string;

    @Column(DataType.TEXT)
    password!: string;

    @Column(DataType.TEXT)
    name!: string;

    @Column(DataType.TEXT)
    last_name!: string;

    @Column(DataType.TINYINT)
    gender!: Gender;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;

    public get email(): string {
        return `${this.email_name}@${this.email_host}`;
    }

}

sequelize.addModels([ User ]);
