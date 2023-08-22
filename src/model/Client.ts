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
import { Status } from "../core/type";
import { User } from "./User";

@Table
export class Client extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER.UNSIGNED)
    id!: number;

    @AllowNull
    @Length({ max: 100 })
    @Column(DataType.TEXT)
    name!: string;

    @AllowNull
    @Column(DataType.TEXT)
    user_agent!: string;

    @Index
    @ForeignKey(() => User)
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    user_id!: number;

    @BelongsTo(() => User, 'user_id')
    user!: User;

    @Length({ min: 0, max: 250 })
    @AllowNull
    @Column(DataType.TEXT)
    ip_address!: string;

    @Column(DataType.INTEGER)
    status!: Status;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;

    @AllowNull
    @Column(DataType.TEXT)
    token!: string;


}

