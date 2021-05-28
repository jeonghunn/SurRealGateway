import {
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    Index,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from "sequelize-typescript";
import {
    RelationCategory,
    RelationStatus,
} from "./type";
import { sequelize } from "../bin/db";
import {User} from "./user";

@Table
export class Relation extends Model {
    @AutoIncrement
    @PrimaryKey
    @Index('relation_user_target')
    @Column(DataType.INTEGER)
    id: number = 0;

    @Column(DataType.TINYINT)
    category!: RelationCategory;

    @Index('relation_user_target')
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    user!: User;

    @Index('relation_user_target')
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    target!: User;

    @Column(DataType.TINYINT)
    status!: RelationStatus;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;


}

sequelize.addModels([ Relation ]);
