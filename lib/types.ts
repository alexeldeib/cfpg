import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Authenticator = {
    id: Generated<string>;
    credentialId: string;
    userId: string;
    publicKey: Buffer;
    counter: string;
    transports: string | null;
};
export type Challenge = {
    id: Generated<string>;
    userId: string;
    content: string;
    createdAt: Generated<Timestamp>;
};
export type User = {
    id: Generated<string>;
    username: string;
    createdAt: Generated<Timestamp>;
};
export type DB = {
    Authenticator: Authenticator;
    Challenge: Challenge;
    User: User;
};
