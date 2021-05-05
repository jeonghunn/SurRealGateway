import {
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    ForeignKey,
    Length,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from "sequelize-typescript";
import { RoomStatus } from "./type";
import { sequelize } from "../bin/db";
import { User } from "./user";

@Table
export class Room extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number = 0;

    @Length({ max: 30 })
    @Column(DataType.TEXT)
    name!: string;

    @Length({ max: 30 })
    @Column(DataType.TEXT)
    description!: string;

    @ForeignKey(() => User)
    @Column(DataType.BIGINT)
    user!: User;

    @Length({min: 0, max: 250})
    @Column(DataType.TEXT)
    ip_address!: string;

    @Column(DataType.INTEGER)
    online_count!: number;

    @Column(DataType.INTEGER)
    limit!: number;

    @Column(DataType.JSON)
    participates!: number[];

    @Column(DataType.INTEGER)
    status!: RoomStatus;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;

}

sequelize.addModels([ Room ]);
