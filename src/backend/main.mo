import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import List "mo:core/List";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Iter "mo:core/Iter";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Radio {
    public type NetworkType = {
      #analog;
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
      networkType : NetworkType;
      networkLabel : Text;
      address : Text;
      talkgroups : [Talkgroup];
    };

    public type Transmission = {
      fromCallsign : Text;
      timestamp : Int;
      network : Text;
      talkgroup : Text;
      dmrId : ?Nat;
      dmrOperatorName : ?Text;
      dmrOperatorLocation : ?Text;
    };

    public func compare(transmission1 : Transmission, transmission2 : Transmission) : Order.Order {
      Int.compare(transmission1.timestamp, transmission2.timestamp);
    };
  };

  type PersistentTransmission = {
    fromCallsign : Text;
    timestamp : Int;
    network : Text;
    talkgroup : Text;
    dmrId : ?Nat;
    dmrOperatorName : ?Text;
    dmrOperatorLocation : ?Text;
  };

  type PersistentNetwork = {
    networkType : Radio.NetworkType;
    networkLabel : Text;
    address : Text;
    talkgroups : [Radio.Talkgroup];
  };

  type ImmutableUserProfile = {
    callsign : Text;
    name : ?Text;
    licenseAcknowledgement : Bool;
    favoriteNetworks : [Text];
    dmrId : ?Nat;
    ssid : ?Nat;
  };

  type PersistentUserProfile = {
    callsign : Text;
    name : ?Text;
    licenseAcknowledgement : Bool;
    favoriteNetworks : Set.Set<Text>;
    dmrId : ?Nat;
    ssid : ?Nat;
  };

  type SignalMessage = {
    sender : Principal;
    content : Text;
    timestamp : Time.Time;
    roomKey : Text;
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
      dmrId = persistentProfile.dmrId;
      ssid = persistentProfile.ssid;
    };
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?ImmutableUserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller).map(toSharedImmutableProfile);
  };

  public query ({ caller }) func getUserProfile(profileOwner : Principal) : async ?ImmutableUserProfile {
    if (profileOwner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile unless admin");
    };
    userProfiles.get(profileOwner).map(toSharedImmutableProfile);
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
      dmrId = profile.dmrId;
      ssid = profile.ssid;
    };
    userProfiles.add(caller, persistentProfile);
  };

  // Network Directory
  public query ({ caller }) func getBuiltinNetworks() : async [PersistentNetwork] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view networks");
    };
    let dmrNetworks : [
      {
        identifier : Text;
        networkLabel : Text;
        address : Text;
      }
    ] = [
      {
        identifier = "brandmeister_worldwide";
        networkLabel = "BrandMeister Worldwide";
        address = "bm.worldwide.network:62031";
      },
      {
        identifier = "bm_europe_wide";
        networkLabel = "BM Europe Wide";
        address = "bm.europe.network:62031";
      },
      {
        identifier = "brandmeister_north_america";
        networkLabel = "BrandMeister North America";
        address = "bm.northamerica.network:62031";
      },
      {
        identifier = "brandmeister_asia_pacific";
        networkLabel = "BrandMeister Asia-Pacific";
        address = "bm.asiapacific.network:62031";
      },
      {
        identifier = "brandmeister_south_america";
        networkLabel = "BrandMeister South America";
        address = "bm.southamerica.network:62031";
      },
      {
        identifier = "brandmeister_africa";
        networkLabel = "BrandMeister Africa";
        address = "bm.africa.network:62031";
      },
      {
        identifier = "brandmeister_australia";
        networkLabel = "BrandMeister Australia";
        address = "bm.australia.network:62031";
      },
      {
        identifier = "brandmeister_global";
        networkLabel = "BrandMeister Global";
        address = "bm.global.network:62031";
      },
      {
        identifier = "brandmeister_uk";
        networkLabel = "BrandMeister United Kingdom";
        address = "bm.uk.network:62031";
      },
      {
        identifier = "brandmeister_germany";
        networkLabel = "BrandMeister Germany";
        address = "bm.germany.network:62031";
      },
      {
        identifier = "brandmeister_france";
        networkLabel = "BrandMeister France";
        address = "bm.france.network:62031";
      },
      {
        identifier = "bm_canada";
        networkLabel = "BM Canada";
        address = "bm.canada.network:62031";
      },
      {
        identifier = "brandmeister_stateside";
        networkLabel = "BrandMeister Stateside";
        address = "bm.stateside.network:62031";
      },
      {
        identifier = "brandmeister_west_coast";
        networkLabel = "BrandMeister West Coast";
        address = "bm.westcoast.network:62031";
      },
      {
        identifier = "brandmeister_east_coast";
        networkLabel = "BrandMeister East Coast";
        address = "bm.eastcoast.network:62031";
      },
      {
        identifier = "brandmeister_federal";
        networkLabel = "BrandMeister Federal";
        address = "bm.federal.network:62031";
      },
      {
        identifier = "brandmeister_central";
        networkLabel = "BrandMeister Central";
        address = "bm.central.network:62031";
      },
      {
        identifier = "bm_uk";
        networkLabel = "BM UK";
        address = "bm.uk.network:62031";
      },
      {
        identifier = "brandmeister_scotland";
        networkLabel = "BrandMeister Scotland";
        address = "bm.scotland.network:62031";
      },
      {
        identifier = "brandmeister_wales";
        networkLabel = "BrandMeister Wales";
        address = "bm.wales.network:62031";
      },
      {
        identifier = "brandmeister_cymru";
        networkLabel = "BrandMeister Cymru";
        address = "bm.cymru.network:62031";
      },
      {
        identifier = "brandmeister_irish_sea";
        networkLabel = "BrandMeister Irish Sea";
        address = "bm.irishsea.network:62031";
      },
    ];

    let builtinNetworksArray = dmrNetworks.map<{
      identifier : Text;
      networkLabel : Text;
      address : Text;
    }, PersistentNetwork>(
      func(dmr) {
        {
          networkType = #dmr;
          networkLabel = dmr.networkLabel;
          address = dmr.address;
          talkgroups = [];
        };
      }
    );

    builtinNetworksArray;
  };

  // Now Hearing (With DMR Extended Info)
  public query ({ caller }) func getNowHearing() : async [PersistentTransmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view activity");
    };
    nowHearingList.toArray();
  };

  public shared ({ caller }) func updateNowHearing(
    fromCallsign : Text,
    network : Text,
    talkgroup : Text,
    dmrId : ?Nat,
    dmrOperatorName : ?Text,
    dmrOperatorLocation : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update activity");
    };

    let transmission : PersistentTransmission = {
      fromCallsign;
      timestamp = Time.now();
      network;
      talkgroup;
      dmrId;
      dmrOperatorName;
      dmrOperatorLocation;
    };

    nowHearingList.add(transmission);
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
          dmrId = null;
          ssid = null;
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
          dmrId = null;
          ssid = null;
        };
      };
      case (?profile) { profile };
    };

    persistentProfile.favoriteNetworks.toArray();
  };

  // Signaling Functions (room-based, timestamped)
  public shared ({ caller }) func sendSignal(content : Text, roomKey : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send signals");
    };

    let message : SignalMessage = {
      sender = caller;
      content;
      timestamp = Time.now();
      roomKey;
    };

    signalMessages.add(message);
  };

  public query ({ caller }) func getSignalsAfterTimestampForRoom(callerTimestamp : Time.Time, roomKey : Text) : async [SignalMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve signals");
    };

    let filteredMessages : List.List<SignalMessage> = List.empty<SignalMessage>();

    for (msg in signalMessages.values()) {
      if (msg.roomKey == roomKey and msg.timestamp > callerTimestamp) {
        filteredMessages.add(msg);
      };
    };

    filteredMessages.toArray();
  };
});
