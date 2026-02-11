import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PersistentNetwork {
    mode: Mode;
    networkLabel: string;
    address: string;
    talkgroups: Array<Talkgroup>;
}
export type Time = bigint;
export interface PersistentTransmission {
    fromCallsign: string;
    talkgroup: string;
    network: string;
    timestamp: bigint;
}
export interface Talkgroup {
    id: string;
    name: string;
}
export interface SignalMessage {
    content: string;
    sender: Principal;
    timestamp: Time;
}
export interface ImmutableUserProfile {
    name?: string;
    licenseAcknowledgement: boolean;
    favoriteNetworks: Array<string>;
    callsign: string;
}
export enum Mode {
    dmr = "dmr",
    p25 = "p25",
    ysf = "ysf",
    nxdn = "nxdn",
    others = "others",
    dstar = "dstar"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getBuiltinNetworks(): Promise<Array<PersistentNetwork>>;
    getCallerUserProfile(): Promise<ImmutableUserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFavoriteNetworks(): Promise<Array<string>>;
    getNowHearing(): Promise<Array<PersistentTransmission>>;
    getSignals(callerTimestamp: bigint): Promise<Array<SignalMessage>>;
    getUserProfile(profileOwner: Principal): Promise<ImmutableUserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: ImmutableUserProfile): Promise<void>;
    sendSignal(content: string): Promise<void>;
    toggleFavoriteNetwork(networkId: string): Promise<boolean>;
    updateNowHearing(): Promise<void>;
}
