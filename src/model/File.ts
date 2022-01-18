import {
    AllowNull,
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    ForeignKey,
    Index, Length,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from "sequelize-typescript";
import {
    AttendeeType, AttendeePermission,
    Status, ChatType,
} from "../core/type";
import { User } from "./User";
import {Room} from "./Room";

@Table
export class Chat extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.BIGINT.UNSIGNED)
    id!: number;

    @Index
    @ForeignKey(() => User)
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    user_id!: number;

    @Index
    @ForeignKey(() => Room)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    room_id!: number;

    @Column(DataType.TINYINT)
    status!: Status;

    @Column(DataType.TINYINT)
    type!: ChatType;

    @AllowNull
    @Column(DataType.TEXT)
    message!: string;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;

}

