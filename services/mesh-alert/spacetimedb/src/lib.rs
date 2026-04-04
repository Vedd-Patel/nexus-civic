use spacetimedb::{spacetimedb, Identity, ReducerContext};

#[spacetimedb(table)]
pub struct Node {
    #[primarykey]
    pub identity: Identity,
    pub role: String, // "Victim", "Rescuer", "Drone"
    pub lat: f64,
    pub lon: f64,
    pub last_updated: u64, // Timestamp
}

#[spacetimedb(table)]
pub struct SosMessage {
    #[primarykey]
    #[autoinc]
    pub id: u64,
    pub sender_identity: Identity,
    pub lat: f64,
    pub lon: f64,
    pub details: String,
    pub status: String, // "Active", "Resolved"
    pub timestamp: u64,
}

#[spacetimedb(table)]
pub struct GlobalSyncState {
    #[primarykey]
    pub id: u32, // Just a static id 0
    pub last_internet_sync: u64, // Timestamp when full state was synced to Vultr
}

#[spacetimedb(reducer)]
pub fn register_node(ctx: ReducerContext, role: String, lat: f64, lon: f64, timestamp: u64) -> Result<(), String> {
    if role != "Victim" && role != "Rescuer" && role != "Drone" {
        return Err("Invalid role. Must be 'Victim', 'Rescuer', or 'Drone'.".to_string());
    }

    // Insert or replace the node directly
    Node::insert(Node {
        identity: ctx.sender,
        role,
        lat,
        lon,
        last_updated: timestamp,
    });
    
    Ok(())
}

#[spacetimedb(reducer)]
pub fn update_location(ctx: ReducerContext, lat: f64, lon: f64, timestamp: u64) -> Result<(), String> {
    let mut node = Node::filter_by_identity(&ctx.sender)
        .ok_or_else(|| "Node not found. You must register first.".to_string())?;

    node.lat = lat;
    node.lon = lon;
    node.last_updated = timestamp;
    
    Node::update_by_identity(&ctx.sender, node);
    
    Ok(())
}

#[spacetimedb(reducer)]
pub fn send_sos(ctx: ReducerContext, lat: f64, lon: f64, details: String, timestamp: u64) -> Result<(), String> {
    // Only registered users can send SOS just to attach it to an identity, even if it's auto-registered
    let node = Node::filter_by_identity(&ctx.sender)
        .ok_or_else(|| "Node not found. You must register as a Victim first.".to_string())?;
        
    SosMessage::insert(SosMessage {
        id: 0,
        sender_identity: ctx.sender,
        lat,
        lon,
        details,
        status: "Active".to_string(),
        timestamp,
    });
    
    Ok(())
}

#[spacetimedb(reducer)]
pub fn resolve_sos(ctx: ReducerContext, message_id: u64) -> Result<(), String> {
    let rescuer = Node::filter_by_identity(&ctx.sender)
        .ok_or_else(|| "Node not found".to_string())?;
        
    if rescuer.role != "Rescuer" && rescuer.role != "Drone" {
        return Err("Only Rescuers or Drones can mark an SOS as resolved.".to_string());
    }
    
    let mut sos = SosMessage::filter_by_id(&message_id)
        .ok_or_else(|| "SOS Message not found".to_string())?;
        
    if sos.status == "Resolved" {
        return Err("SOS is already resolved".to_string());
    }
    
    sos.status = "Resolved".to_string();
    SosMessage::update_by_id(&message_id, sos);
    
    Ok(())
}

#[spacetimedb(reducer)]
pub fn mark_synced_to_internet(ctx: ReducerContext, timestamp: u64) -> Result<(), String> {
    // We allow any connected node that re-establishes internet to record the sync time.
    GlobalSyncState::insert(GlobalSyncState {
        id: 0,
        last_internet_sync: timestamp,
    });
    
    Ok(())
}
