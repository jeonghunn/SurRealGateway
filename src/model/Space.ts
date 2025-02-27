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
    Unique,
    UpdatedAt,
} from "sequelize-typescript";
import {
    SpaceStatus,
    Status,
} from "../core/type";
import { User } from "./User";
import { Room } from "./Room";

@Table
export class Space extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.BIGINT.UNSIGNED)
    id!: number;

    @Unique('space_key_version_unique')
    @Column(DataType.UUIDV4)
    key!: string;

    @Column({
        type: DataType.STRING,
        defaultValue: 0,
    })
    category!: string;

    @Column(DataType.TEXT)
    title!: string;

    @Column(DataType.TEXT)
    content!: string;

    @Index
    @ForeignKey(() => User)
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: true,
    })
    user_id!: number;

    @Index
    @ForeignKey(() => Room)
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    room_id!: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    topic_id!: string;

    @Column(DataType.INTEGER)
    status!: SpaceStatus;

    @Unique('space_key_version_unique')
    @Column(DataType.INTEGER)
    version!: number;

    @Column(DataType.JSON)
    meta?: any;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;

}

