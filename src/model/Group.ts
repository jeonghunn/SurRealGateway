import {
    AllowNull,
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
import {RoomStatus, Status} from "../core/type";
import { User } from "./User";

@Table
export class Group extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER.UNSIGNED)
    id!: number;

    @AllowNull
    @Length({ max: 30 })
    @Column({
        type: DataType.TEXT,
    })
    public get name(): string {
        return this.getDataValue('name') || this.getDataValue('user')?.name || 'Unknown';
    }

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

    @BelongsTo(() => User, 'user_id')
    user! : User;

    @Index('group_user_target')
    @AllowNull
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    @ForeignKey(() => User)
    target_id!: number;

    @BelongsTo(() => User,  'target_id')
    target! : User;

    @Length({min: 0, max: 250})
    @AllowNull
    @Column(DataType.TEXT)
    ip_address!: string;

    @Column(DataType.INTEGER)
    limit!: number;

    @Column(DataType.INTEGER)
    status!: Status;

    @Column(DataType.INTEGER)
    privacy!: number;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;

}

