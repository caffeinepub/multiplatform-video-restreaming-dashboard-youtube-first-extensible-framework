import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Migration "migration";

(with migration = Migration.run)
actor {
  type SessionId = Text;
  type StreamTargetId = Nat;
  type IngestCategoryId = Text;
  type LayerId = Nat;

  type Session = {
    id : SessionId;
    title : Text;
    outputs : [StreamTargetId];
    isActive : Bool;
    videoSourceUrl : ?Text;
    layers : [LayerId];
  };

  type Output = {
    id : StreamTargetId;
    name : Text;
    protocol : Text;
    url : Text;
    stream_key : Text;
    max_bitrate : Nat;
    ingest_categories : [IngestCategoryId];
  };

  type Layer = {
    id : LayerId;
    name : Text;
    sourceUrl : Text;
    position : { x : Nat; y : Nat };
    size : { width : Nat; height : Nat };
  };

  let sessions = Map.empty<SessionId, Session>();
  let outputs = Map.empty<StreamTargetId, Output>();
  let layers = Map.empty<LayerId, Layer>();
  var nextStreamTargetId = 1 : StreamTargetId;
  var nextLayerId = 1 : LayerId;

  public shared ({ caller }) func createSession(sessionId : SessionId, title : Text) : async () {
    if (sessions.containsKey(sessionId)) {
      Runtime.trap("Session already exists");
    };

    let newSession : Session = {
      id = sessionId;
      title;
      outputs = [];
      isActive = false;
      videoSourceUrl = null;
      layers = [];
    };

    sessions.add(sessionId, newSession);
  };

  public shared ({ caller }) func addOutput(sessionId : SessionId, name : Text, protocol : Text, url : Text, stream_key : Text, max_bitrate : Nat, ingest_categories : [IngestCategoryId]) : async StreamTargetId {
    let output : Output = {
      id = nextStreamTargetId;
      name;
      protocol;
      url;
      stream_key;
      max_bitrate;
      ingest_categories;
    };

    switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session does not exist") };
      case (?session) {
        let updatedSession = {
          session with
          outputs = session.outputs.concat([output.id]);
        };
        sessions.add(sessionId, updatedSession);
      };
    };

    outputs.add(nextStreamTargetId, output);
    nextStreamTargetId += 1;
    output.id;
  };

  public query ({ caller }) func getSession(id : SessionId) : async Session {
    switch (sessions.get(id)) {
      case (null) { Runtime.trap("Session does not exist") };
      case (?session) { session };
    };
  };

  public query ({ caller }) func getOutput(id : StreamTargetId) : async Output {
    switch (outputs.get(id)) {
      case (null) { Runtime.trap("Output does not exist") };
      case (?output) { output };
    };
  };

  public shared ({ caller }) func startSession(id : SessionId) : async () {
    switch (sessions.get(id)) {
      case (?session) {
        if (session.isActive) {
          Runtime.trap("Session already live");
        };
        let updatedSession = { session with isActive = true };
        sessions.add(id, updatedSession);
      };
      case (null) { Runtime.trap("Session does not exist") };
    };
  };

  public shared ({ caller }) func stopSession(id : SessionId) : async () {
    switch (sessions.get(id)) {
      case (?session) {
        if (not session.isActive) {
          Runtime.trap("Session is not live");
        };
        let updatedSession = { session with isActive = false };
        sessions.add(id, updatedSession);
      };
      case (null) { Runtime.trap("Session does not exist") };
    };
  };

  public shared ({ caller }) func setVideoSource(sessionId : SessionId, videoSourceUrl : Text) : async () {
    switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session does not exist") };
      case (?session) {
        let updatedSession = { session with videoSourceUrl = ?videoSourceUrl };
        sessions.add(sessionId, updatedSession);
      };
    };
  };

  public shared ({ caller }) func addLayer(sessionId : SessionId, name : Text, sourceUrl : Text, x : Nat, y : Nat, width : Nat, height : Nat) : async LayerId {
    if (not sessions.containsKey(sessionId)) {
      Runtime.trap("Session does not exist");
    };

    let layer : Layer = {
      id = nextLayerId;
      name;
      sourceUrl;
      position = { x; y };
      size = { width; height };
    };

    layers.add(nextLayerId, layer);

    switch (sessions.get(sessionId)) {
      case (null) {};
      case (?session) {
        let updatedSession = {
          session with
          layers = session.layers.concat([layer.id]);
        };
        sessions.add(sessionId, updatedSession);
      };
    };

    nextLayerId += 1;
    layer.id;
  };

  public query ({ caller }) func getLayer(id : LayerId) : async Layer {
    switch (layers.get(id)) {
      case (null) { Runtime.trap("Layer does not exist") };
      case (?layer) { layer };
    };
  };

  public query ({ caller }) func listOutputsByCategory(categoryId : IngestCategoryId) : async [Output] {
    outputs.values().toArray().filter(
      func(output) {
        output.ingest_categories.find(func(catId) { Text.equal(catId, categoryId) }) != null;
      }
    );
  };

  public query ({ caller }) func listActiveSessions() : async [Session] {
    sessions.values().toArray().filter(
      func(session) { session.isActive }
    );
  };
};
