import { User } from "../model/User";

export enum Gender {
    NON_SEXUAL,
    MALE,
    FEMALE,
}

export enum ChatCategory {
    MESSAGE,
    TOPIC_PREVIEW,
}

export enum RoomStatus {
    NORMAL,
    REMOVED,
    BLOCKED,
}

export enum Status {
    NORMAL,
    REMOVED,
}

export enum SpaceStatus{
    NORMAL,
    REMOVED,
    DEACTIVATED,
}

export enum AttachStatus {
    NORMAL,
    PROCESSING,
    REMOVED,
    UNPROCESSED,
}

export enum PrivacyType {
    PUBLIC,
    MEMBERS_ONLY,
    PRIVATE,
}

export enum RelationStatus {
    NORMAL,
    REMOVED,
    PENDING,
    REQUEST_RECEIVED,
}

export enum UserStatus {
    NORMAL,
    REMOVED,
    DEACTIVATED,
}

export enum TopicCategory {
    REPLY = 'reply',
  }

export enum AttachStorage {
    LOCAL='LOCAL',
    S3='S3',
}

export enum UserPermission {
    USER,
    ADMIN,
}

export enum RelationCategory {
    FRIEND,
    BLOCKED,
}

export enum AttendeeType {
    GROUP,
    ROOM,
}

export enum AttendeePermission {
    BLOCKED,
    MEMBER,
    MODERATOR,
    MANAGER,
    ADMIN,
}

export enum ChatType {
    MESSAGE,
    EVENT,
}

export enum FileType {
    BINARY,
    IMAGE,
    VIDEO,
}

export enum CommunicationType {
    AUTH,
    CHAT,
    LIVE,
    TOPIC,
}

export class Communication {
    public T: CommunicationType | undefined;
    public createdAt?: Date;
    public ticket_id?: string;
}

export class CommunicationResult extends Communication {
    public result?: boolean;
    public message?: string;
}

export class LiveMessage extends Communication {
    public id?: string | any;
    public category: number;
    public content: string | any | undefined;
    public user?: User;
    public topic_id?: string | null;
    public meta?: any;
}

export class AuthMessage extends Communication {
    public token?: string;
}

export class Live extends Communication {
    public B: any;
}

export class SimpleUser {
    public id!: number;
    public name?: string;
    public color?: string;
}
