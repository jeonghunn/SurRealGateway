import { User } from "../model/User";

export enum Gender {
    NON_SEXUAL,
    MALE,
    FEMALE,
}

export enum ChatCategory {
    NORMAL,
    NOTICE,
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
}

export enum CommunicationType {
    CHAT,
    LIVE
  }

export class Communication {
  public T: CommunicationType | undefined;
  public createdAt?: Date;
}

export class ChatMessage extends Communication {
    public id?: number;
    public content: string | undefined;
    public user?: User;
  }
  
  export class Live extends Communication {
    public B: any;
  }