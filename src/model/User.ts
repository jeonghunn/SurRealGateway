import {
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    HasOne,
    Index,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from "sequelize-typescript";
import {
    Gender,
    UserPermission,
    UserStatus,
} from "../core/type";
import { Relation } from "./Relation";

@Table
export class User extends Model {
    @AutoIncrement
    @PrimaryKey
    @Index
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    id!: number;

    @Column(DataType.TEXT)
    email_name!: string;

    @Column(DataType.TEXT)
    email_host!: string;

    @Column(DataType.TEXT)
    password!: string;

    @Column(DataType.TEXT)
    name!: string;

    @Column(DataType.TEXT)
    last_name!: string;

    @Column(DataType.TEXT)
    color!: string;

    @Column(DataType.TINYINT)
    gender!: Gender;

    @Column(DataType.TINYINT)
    status!: UserStatus;

    @Column(DataType.TINYINT)
    permission!: UserPermission;

    @HasOne(() => Relation)
    relation!: Relation;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;

    public get email(): string {
        return `${this.email_name}@${this.email_host}`;
    }

}
