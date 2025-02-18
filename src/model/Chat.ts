import {
    AutoIncrement,
    BelongsTo,
    Column,
    CreatedAt,
    DataType,
    Default,
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
import { Group } from "./Group";
import { Room } from "./Room";
import {Attach} from "./Attach";
import { Topic } from "./Topic";

@Table
export class Chat extends Model {
    @PrimaryKey
    @Column(DataType.UUIDV4)
    id!: string;

    @Column({
        type: DataType.TINYINT,
        defaultValue: 0,
    })
    category!: ChatType;

    @Column(DataType.TEXT)
    content!: string;

    @Index
    @ForeignKey(() => User)
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    user_id!: number;

    @BelongsTo(() => User)
    user! : User;

    @Index
    @ForeignKey(() => Topic)
    @Column({
        type: DataType.TEXT,
    })
    topic_id!: string;

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

