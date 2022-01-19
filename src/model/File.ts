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
import {
    Status,
    FileType,
} from "../core/type";
import { User } from "./User";
import { Room } from "./Room";
import { Chat } from './Chat';

@Table
export class File extends Model {
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
    @ForeignKey(() => Room)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    room_id!: number;

    @Column(DataType.TINYINT)
    status!: Status;

    @Column(DataType.TINYINT)
    type!: FileType;

    @ForeignKey(() => Chat)
    @AllowNull
    @Column(DataType.BIGINT.UNSIGNED)
    chat_id?: number;

    @Length({min: 0, max: 250})
    @AllowNull
    @Column(DataType.TEXT)
    ip_address!: string;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;

}

