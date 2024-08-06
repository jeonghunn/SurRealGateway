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
import { Space } from "./Space";

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

    @Length({max: 80})
    @Column(DataType.TEXT)
    category!: string;

    @Index
    @ForeignKey(() => Chat)
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: true,
    })
    chat_id!: number;

    @Index
    @ForeignKey(() => Room)
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    room_id!: number;

    @ForeignKey(() => Space)
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: true,
    })
    space_id!: number;

    @BelongsTo(() => Space, 'space_id')
    space! : Space;


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

