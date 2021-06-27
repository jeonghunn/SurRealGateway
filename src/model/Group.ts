import {
    AllowNull,
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    ForeignKey,
    Index,
    Length,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from "sequelize-typescript";
import {RoomStatus, Status} from "../core/type";
import { User } from "./User";

@Table
export class Group extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER.UNSIGNED)
    id!: number;

    @Length({ max: 30 })
    @Column(DataType.TEXT)
    @AllowNull
    name!: string;

    @AllowNull
    @Length({ max: 300 })
    @Column(DataType.TEXT)
    description!: string;

    @Index
    @ForeignKey(() => User)
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    user_id!: number;

    @Index('group_user_target')
    @AllowNull
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    @ForeignKey(() => User)
    target_id!: number;

    @Length({min: 0, max: 250})
    @AllowNull
    @Column(DataType.TEXT)
    ip_address!: string;

    @Column(DataType.INTEGER)
    limit!: number;

    @Column(DataType.INTEGER)
    status!: Status;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;

}

