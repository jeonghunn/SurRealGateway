import {
    AutoIncrement,
    BelongsTo,
    Column,
    CreatedAt,
    DataType,
    ForeignKey,
    Index,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from "sequelize-typescript";
import {
    RelationCategory,
    RelationStatus,
} from "../core/type";
import { User } from "./User";

@Table
export class Relation extends Model {
    @AutoIncrement
    @PrimaryKey
    @Index('relation_user_target')
    @Column(DataType.INTEGER)
    id!: number;

    @Column(DataType.TINYINT)
    category!: RelationCategory;

    @Index('relation_user_target')
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    @ForeignKey(() => User)
    user_id!: number;

    @Index('relation_user_target')
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    @ForeignKey(() => User)
    target_id!: number;

    @BelongsTo(() => User,  'target_id')
    target! : User;

    @Column(DataType.TINYINT)
    status!: RelationStatus;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;


}

