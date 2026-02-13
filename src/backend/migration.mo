import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

module {
  type OldSession = {
    id : Text;
    title : Text;
    outputs : [Nat];
    isActive : Bool;
  };

  type OldActor = {
    sessions : Map.Map<Text, OldSession>;
    outputs : Map.Map<Nat, {
      id : Nat;
      name : Text;
      protocol : Text;
      url : Text;
      stream_key : Text;
      max_bitrate : Nat;
      ingest_categories : [Text];
    }>;
    nextStreamTargetId : Nat;
  };

  type NewSession = {
    id : Text;
    title : Text;
    outputs : [Nat];
    isActive : Bool;
    videoSourceUrl : ?Text;
    layers : [Nat];
  };

  type NewActor = {
    sessions : Map.Map<Text, NewSession>;
    outputs : Map.Map<Nat, {
      id : Nat;
      name : Text;
      protocol : Text;
      url : Text;
      stream_key : Text;
      max_bitrate : Nat;
      ingest_categories : [Text];
    }>;
    layers : Map.Map<Nat, {
      id : Nat;
      name : Text;
      sourceUrl : Text;
      position : { x : Nat; y : Nat };
      size : { width : Nat; height : Nat };
    }>;
    nextStreamTargetId : Nat;
    nextLayerId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newSessions = old.sessions.map<Text, OldSession, NewSession>(
      func(_id, oldSession) {
        {
          oldSession with
          videoSourceUrl = null;
          layers = [];
        };
      }
    );
    {
      old with
      sessions = newSessions;
      layers = Map.empty<Nat, {
        id : Nat;
        name : Text;
        sourceUrl : Text;
        position : { x : Nat; y : Nat };
        size : { width : Nat; height : Nat };
      }>();
      nextLayerId = 1;
    };
  };
};
