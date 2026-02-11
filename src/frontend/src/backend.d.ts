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
    networkLabel: string;
    address: string;
    talkgroups: Array<Talkgroup>;
    networkType: NetworkType;
}
export type Time = bigint;
export interface PersistentTransmission {
    fromCallsign: string;
    talkgroup: string;
    network: string;
    dmrOperatorName?: string;
    timestamp: bigint;
    dmrId?: bigint;
    dmrOperatorLocation?: string;
}
export interface Talkgroup {
    id: string;
    name: string;
}
export interface SignalMessage {
    roomKey: string;
    content: string;
    sender: Principal;
    timestamp: Time;
}
export interface ImmutableUserProfile {
    name?: string;
    licenseAcknowledgement: boolean;
    ssid?: bigint;
    favoriteNetworks: Array<string>;
    callsign: string;
    dmrId?: bigint;
}
export enum NetworkType {
    dmr = "dmr",
    p25 = "p25",
    ysf = "ysf",
    nxdn = "nxdn",
    analog = "analog",
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
    getSignalsAfterTimestampForRoom(callerTimestamp: Time, roomKey: string): Promise<Array<SignalMessage>>;
    getUserProfile(profileOwner: Principal): Promise<ImmutableUserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: ImmutableUserProfile): Promise<void>;
    sendSignal(content: string, roomKey: string): Promise<void>;
    toggleFavoriteNetwork(networkId: string): Promise<boolean>;
    updateNowHearing(fromCallsign: string, network: string, talkgroup: string, dmrId: bigint | null, dmrOperatorName: string | null, dmrOperatorLocation: string | null): Promise<void>;
}
