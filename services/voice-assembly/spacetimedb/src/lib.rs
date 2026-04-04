use spacetimedb::{spacetimedb, Identity, ReducerContext};

#[spacetimedb(table)]
pub struct User {
    #[primarykey]
    pub identity: Identity,
    pub role: String, // "Admin", "Citizen"
}

#[spacetimedb(table)]
pub struct TownHallSession {
    #[primarykey]
    #[autoinc]
    pub id: u64,
    pub admin_identity: Identity,
    pub is_active: bool,
    pub resolution: String, // Details about the final resolution
}

#[spacetimedb(table)]
pub struct Issue {
    #[primarykey]
    #[autoinc]
    pub id: u64,
    pub session_id: u64,
    pub summary: String,
    pub original_text: String,
    pub vote_count: u32,
}

#[spacetimedb(table)]
pub struct VoteRecord {
    pub issue_id: u64,
    pub citizen_identity: Identity,
}

#[spacetimedb(reducer)]
pub fn set_admin(ctx: ReducerContext) -> Result<(), String> {
    if User::filter_by_identity(&ctx.sender).is_none() {
        User::insert(User {
            identity: ctx.sender,
            role: "Admin".to_string(),
        });
    }
    Ok(())
}

#[spacetimedb(reducer)]
pub fn create_session(ctx: ReducerContext) -> Result<(), String> {
    let user = User::filter_by_identity(&ctx.sender)
        .ok_or_else(|| "User not found. You must be registered as an Admin.".to_string())?;
        
    if user.role != "Admin" {
        return Err("Only admins can create sessions".to_string());
    }

    TownHallSession::insert(TownHallSession {
        id: 0,
        admin_identity: ctx.sender,
        is_active: true,
        resolution: "".to_string(),
    });
    
    Ok(())
}

#[spacetimedb(reducer)]
pub fn join_session(ctx: ReducerContext, _session_id: u64) -> Result<(), String> {
    // Register the user as a citizen if not already in the system
    if User::filter_by_identity(&ctx.sender).is_none() {
        User::insert(User {
            identity: ctx.sender,
            role: "Citizen".to_string(),
        });
    }
    Ok(())
}

#[spacetimedb(reducer)]
pub fn add_issue(ctx: ReducerContext, session_id: u64, summary: String, original_text: String) -> Result<(), String> {
    // Typically an admin or backend system proxy (like Gemini handling the text) calls this
    let session = TownHallSession::filter_by_id(&session_id)
        .ok_or_else(|| "Session not found".to_string())?;
        
    if !session.is_active {
        return Err("Session is closed".to_string());
    }
    
    Issue::insert(Issue {
        id: 0,
        session_id,
        summary,
        original_text,
        vote_count: 0,
    });
    
    Ok(())
}

#[spacetimedb(reducer)]
pub fn cast_vote(ctx: ReducerContext, issue_id: u64) -> Result<(), String> {
    // Check if user has already voted for this issue
    for record in VoteRecord::iter() {
        if record.issue_id == issue_id && record.citizen_identity == ctx.sender {
            return Err("You have already voted for this issue".to_string());
        }
    }
    
    let mut issue = Issue::filter_by_id(&issue_id)
        .ok_or_else(|| "Issue not found".to_string())?;
        
    let session = TownHallSession::filter_by_id(&issue.session_id)
        .ok_or_else(|| "Session associated with issue not found".to_string())?;
        
    if !session.is_active {
        return Err("Cannot vote in a closed session".to_string());
    }
    
    // Record the vote
    VoteRecord::insert(VoteRecord {
        issue_id,
        citizen_identity: ctx.sender,
    });
    
    // Sync vote count
    issue.vote_count += 1;
    Issue::update_by_id(&issue_id, issue);
    
    Ok(())
}

#[spacetimedb(reducer)]
pub fn close_session(ctx: ReducerContext, session_id: u64, resolution: String) -> Result<(), String> {
    let mut session = TownHallSession::filter_by_id(&session_id)
        .ok_or_else(|| "Session not found".to_string())?;
    
    if session.admin_identity != ctx.sender {
        return Err("Only the admin who created the session can close it".to_string());
    }
    if !session.is_active {
        return Err("Session is already closed".to_string());
    }
    
    session.is_active = false;
    session.resolution = resolution;
    
    TownHallSession::update_by_id(&session_id, session);
    
    Ok(())
}
