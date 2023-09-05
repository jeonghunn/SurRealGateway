import {
    AllowNull,
    AutoIncrement,
    BelongsTo,
    Column,
    CreatedAt,
    DataType,
    Default,
    ForeignKey,
    Index,
    Length,
    Model,
    PrimaryKey,
    Table,
    Unique,
    UpdatedAt,
} from "sequelize-typescript";
import { Status } from "../core/type";
import { User } from "./User";

@Table
export class Client extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUIDV4)
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
    @Unique('client_user_token_unique')
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

    @Column(DataType.DATE)
    last_active: Date;

    @AllowNull
    @Length({ max: 255 })
    @Unique('client_user_token_unique')
    @Column(DataType.TEXT)
    @Index
    token!: string;


}

