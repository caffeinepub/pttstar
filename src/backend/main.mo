import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import List "mo:core/List";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types for radio
  module Radio {
    public type Mode = {
      #dmr;
      #dstar;
      #ysf;
      #p25;
      #nxdn;
      #others;
    };

    public type Talkgroup = {
      name : Text;
      id : Text;
    };

    public type Network = {
      mode : Mode;
      networkLabel : Text;
      address : Text;
      talkgroups : [Talkgroup];
    };

    public type Transmission = {
      fromCallsign : Text;
      timestamp : Int;
      network : Text;
      talkgroup : Text;
    };

    public func compare(transmission1 : Transmission, transmission2 : Transmission) : Order.Order {
      Int.compare(transmission1.timestamp, transmission2.timestamp);
    };
  };

  type PersistentNetwork = {
    mode : Radio.Mode;
    networkLabel : Text;
    address : Text;
    talkgroups : [Radio.Talkgroup];
  };

  type PersistentTransmission = {
    fromCallsign : Text;
    timestamp : Int;
    network : Text;
    talkgroup : Text;
  };

  type ImmutableUserProfile = {
    callsign : Text;
    name : ?Text;
    licenseAcknowledgement : Bool;
    favoriteNetworks : [Text];
  };

  type PersistentUserProfile = {
    callsign : Text;
    name : ?Text;
    licenseAcknowledgement : Bool;
    favoriteNetworks : Set.Set<Text>;
  };

  type SignalMessage = {
    sender : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  let userProfiles = Map.empty<Principal, PersistentUserProfile>();
  let builtinNetworks = Map.empty<Text, PersistentNetwork>();
  var nowHearingList : List.List<PersistentTransmission> = List.empty<PersistentTransmission>();

  // Signaling system state
  let signalMessages = List.empty<SignalMessage>();

  // Helper to convert persistent profile to immutable shared type
  func toSharedImmutableProfile(persistentProfile : PersistentUserProfile) : ImmutableUserProfile {
    {
      callsign = persistentProfile.callsign;
      name = persistentProfile.name;
      licenseAcknowledgement = persistentProfile.licenseAcknowledgement;
      favoriteNetworks = persistentProfile.favoriteNetworks.toArray();
    };
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?ImmutableUserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller).map(func(p) { toSharedImmutableProfile(p) });
  };

  public query ({ caller }) func getUserProfile(profileOwner : Principal) : async ?ImmutableUserProfile {
    if (profileOwner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile unless admin");
    };
    userProfiles.get(profileOwner).map(func(p) { toSharedImmutableProfile(p) });
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : ImmutableUserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let persistentProfile : PersistentUserProfile = {
      callsign = profile.callsign;
      name = profile.name;
      licenseAcknowledgement = profile.licenseAcknowledgement;
      favoriteNetworks = Set.empty<Text>();
    };
    userProfiles.add(caller, persistentProfile);
  };

  // Network Directory
  public query ({ caller }) func getBuiltinNetworks() : async [PersistentNetwork] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view networks");
    };
    builtinNetworks.values().toArray();
  };

  // Now Hearing
  public query ({ caller }) func getNowHearing() : async [PersistentTransmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view activity");
    };
    nowHearingList.toArray();
  };

  public shared ({ caller }) func updateNowHearing() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update activity");
    };
    let mockTransmission : PersistentTransmission = {
      fromCallsign = "W1AW";
      timestamp = Time.now();
      network = "BrandMeister";
      talkgroup = "3100";
    };
    nowHearingList.add(mockTransmission);
  };

  // Favorite Networks
  public shared ({ caller }) func toggleFavoriteNetwork(networkId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage favorites");
    };
    let persistentProfile = switch (userProfiles.get(caller)) {
      case (null) {
        {
          callsign = "";
          name = null;
          licenseAcknowledgement = false;
          favoriteNetworks = Set.empty<Text>();
        };
      };
      case (?profile) { profile };
    };

    let isFavorite = persistentProfile.favoriteNetworks.contains(networkId);

    if (isFavorite) {
      persistentProfile.favoriteNetworks.remove(networkId);
    } else {
      persistentProfile.favoriteNetworks.add(networkId);
    };

    userProfiles.add(caller, persistentProfile);
    not isFavorite;
  };

  public query ({ caller }) func getFavoriteNetworks() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view favorites");
    };
    let persistentProfile = switch (userProfiles.get(caller)) {
      case (null) {
        {
          callsign = "";
          name = null;
          licenseAcknowledgement = false;
          favoriteNetworks = Set.empty<Text>();
        };
      };
      case (?profile) { profile };
    };

    persistentProfile.favoriteNetworks.toArray();
  };

  // Signaling Functions
  public shared ({ caller }) func sendSignal(content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send signals");
    };

    let message : SignalMessage = {
      sender = caller;
      content;
      timestamp = Time.now();
    };

    signalMessages.add(message);
  };

  public query ({ caller }) func getSignals(callerTimestamp : Nat) : async [SignalMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve signals");
    };

    let now = Time.now();

    let newMessages = signalMessages.toArray().filter(
      func(msg) {
        msg.timestamp > now - 40_000_000_000;
      }
    );

    newMessages;
  };
};
