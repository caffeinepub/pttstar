import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";

module {
  type PersistentUserProfile = {
    callsign : Text;
    name : ?Text;
    licenseAcknowledgement : Bool;
    favoriteNetworks : Set.Set<Text>;
  };

  type PersistentNetwork = {
    mode : {
      #dmr;
      #dstar;
      #ysf;
      #p25;
      #nxdn;
      #others;
    };
    networkLabel : Text;
    address : Text;
    talkgroups : [{
      name : Text;
      id : Text;
    }];
  };

  type PersistentTransmission = {
    fromCallsign : Text;
    timestamp : Int;
    network : Text;
    talkgroup : Text;
  };

  type SignalMessage = {
    sender : Principal;
    content : Text;
    timestamp : Int;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, PersistentUserProfile>;
    builtinNetworks : Map.Map<Text, PersistentNetwork>;
    nowHearingList : List.List<PersistentTransmission>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, PersistentUserProfile>;
    builtinNetworks : Map.Map<Text, PersistentNetwork>;
    nowHearingList : List.List<PersistentTransmission>;
    signalMessages : List.List<SignalMessage>;
  };

  public func run(old : OldActor) : NewActor {
    { old with signalMessages = List.empty<SignalMessage>() };
  };
};
