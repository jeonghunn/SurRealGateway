import {
    AutoIncrement,
    BelongsTo,
    Column,
    CreatedAt,
    DataType,
    ForeignKey,
    HasMany,
    Index,
    Length,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from "sequelize-typescript";
import {
    ChatType,
    Status,
} from "../core/type";
import { User } from "./User";
import { Room } from "./Room";
import {Attach} from "./Attach";
import { Chat } from "./Chat";

@Table
export class Topic extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.BIGINT.UNSIGNED)
    id!: number;

    @Length({max: 140})
    @Column(DataType.TEXT)
    name!: string;

    @Index
    @BelongsTo(() => Topic, 'parent_id')
    parent! : Topic;

    @Index
    @ForeignKey(() => Chat)
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    chat_id!: number;

    @Index
    @ForeignKey(() => Room)
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    room_id!: number;

    @Length({min: 0, max: 250})
    @Column(DataType.TEXT)
    ip_address?: string;

    @Column(DataType.INTEGER)
    status!: Status;

    @Column(DataType.JSON)
    meta?: any;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;

}

