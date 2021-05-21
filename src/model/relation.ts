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
import {Gender, RelationCategory, RoomStatus, Status} from "./type";
import { sequelize } from "../bin/db";
import {User} from "./user";

@Table
export class Relation extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number = 0;

    @Column(DataType.INTEGER)
    category!: RelationCategory;

    @Column(DataType.INTEGER)
    user!: User;

    @Column(DataType.INTEGER)
    target!: User;

    @Column(DataType.INTEGER)
    status!: Status;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;


}

sequelize.addModels([ Relation ]);
