import {
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    ForeignKey,
    Index,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from "sequelize-typescript";
import {
    AttendeeType,
    Status,
} from "../core/type";
import { User } from "./User";

@Table
export class Attendee extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER.UNSIGNED)
    id!: number;

    @Index
    @ForeignKey(() => User)
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    user_id!: number;

    @Index
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        allowNull: false,
    })
    target_id!: number;

    @Column(DataType.TINYINT)
    status!: Status;

    @Column(DataType.TINYINT)
    type!: number;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;

}

