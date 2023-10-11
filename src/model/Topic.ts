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
import { Group } from "./Group";
import { Room } from "./Room";
import {Attach} from "./Attach";

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
    @ForeignKey(() => User)
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    user_id!: number;

    @Index
    @ForeignKey(() => Room)
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    room_id!: number;

    @BelongsTo(() => Group, 'group_id')
    group! : Group;

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

