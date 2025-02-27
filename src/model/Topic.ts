import {
    AutoIncrement,
    BelongsTo,
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
} from "../core/type";
import { User } from "./User";
import { Room } from "./Room";
import {Attach} from "./Attach";
import { Chat } from "./Chat";
import { Space } from "./Space";

@Table
export class Topic extends Model {
    @PrimaryKey
    @Length({max: 36})
    @Column(DataType.TEXT)
    id!: string;

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
        type: DataType.TEXT,
        allowNull: true,
    })
    chat_id!: string;

    @BelongsTo(() => Chat, 'chat_id')
    chat! : Chat;

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

