/**
 * Team Collaboration Service
 *
 * Enables team collaboration features
 *
 * Features:
 * - Team creation and management
 * - Session sharing
 * - Role-based permissions
 * - Comments and annotations
 * - Activity feed
 */

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum Permission {
  VIEW = 'view',
  EDIT = 'edit',
  DELETE = 'delete',
  SHARE = 'share',
  MANAGE_MEMBERS = 'manage_members',
}

export interface TeamMember {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  joinedAt: number;
  lastActive?: number;
}

export interface Team {
  teamId: string;
  teamName: string;
  description?: string;
  createdBy: string;
  createdAt: number;
  members: TeamMember[];
  settings: TeamSettings;
}

export interface TeamSettings {
  allowMemberInvite: boolean;
  requireApproval: boolean;
  defaultRole: UserRole;
  maxMembers: number;
}

export interface SharedSession {
  shareId: string;
  sessionId: string;
  sharedBy: string;
  sharedWith: string[]; // User IDs or team IDs
  permissions: Permission[];
  expiresAt?: number;
  createdAt: number;
}

export interface SessionComment {
  commentId: string;
  sessionId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  replyTo?: string; // Reply to another comment
  edited?: boolean;
  editedAt?: number;
}

export interface ActivityEvent {
  eventId: string;
  type: 'share' | 'comment' | 'edit' | 'join' | 'leave';
  userId: string;
  userName: string;
  sessionId?: string;
  teamId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class TeamCollaboration {
  private static instance: TeamCollaboration;
  private currentUserId: string | null = null;
  private teams: Team[] = [];
  private sharedSessions: SharedSession[] = [];

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): TeamCollaboration {
    if (!TeamCollaboration.instance) {
      TeamCollaboration.instance = new TeamCollaboration();
    }
    return TeamCollaboration.instance;
  }

  /**
   * Initialize collaboration service
   */
  async initialize(userId: string): Promise<void> {
    this.currentUserId = userId;

    // Load user's teams
    await this.loadTeams();

    // Load shared sessions
    await this.loadSharedSessions();
  }

  /**
   * Create a new team
   */
  async createTeam(teamName: string, description?: string): Promise<Team> {
    if (!this.currentUserId) {
      throw new Error('User not initialized');
    }

    const team: Team = {
      teamId: this.generateId('team'),
      teamName,
      description,
      createdBy: this.currentUserId,
      createdAt: Date.now(),
      members: [
        {
          userId: this.currentUserId,
          email: '', // TODO: Get from user profile
          displayName: '', // TODO: Get from user profile
          role: UserRole.OWNER,
          joinedAt: Date.now(),
        },
      ],
      settings: {
        allowMemberInvite: true,
        requireApproval: false,
        defaultRole: UserRole.MEMBER,
        maxMembers: 10,
      },
    };

    // TODO: API call to create team
    /*
    await fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(team),
    });
    */

    this.teams.push(team);
    return team;
  }

  /**
   * Invite user to team
   */
  async inviteMember(teamId: string, email: string, role: UserRole = UserRole.MEMBER): Promise<void> {
    const team = this.teams.find(t => t.teamId === teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Check permissions
    if (!this.hasPermission(teamId, Permission.MANAGE_MEMBERS)) {
      throw new Error('No permission to manage members');
    }

    // TODO: API call to send invitation
    /*
    await fetch(`${API_URL}/teams/${teamId}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ email, role }),
    });
    */

    console.log(`[TeamCollaboration] Invitation sent to ${email}`);
  }

  /**
   * Remove member from team
   */
  async removeMember(teamId: string, userId: string): Promise<void> {
    const team = this.teams.find(t => t.teamId === teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    if (!this.hasPermission(teamId, Permission.MANAGE_MEMBERS)) {
      throw new Error('No permission to manage members');
    }

    team.members = team.members.filter(m => m.userId !== userId);

    // TODO: API call to remove member
  }

  /**
   * Share session with users or team
   */
  async shareSession(
    sessionId: string,
    shareWith: string[],
    permissions: Permission[] = [Permission.VIEW],
    expiresIn?: number
  ): Promise<SharedSession> {
    if (!this.currentUserId) {
      throw new Error('User not initialized');
    }

    const sharedSession: SharedSession = {
      shareId: this.generateId('share'),
      sessionId,
      sharedBy: this.currentUserId,
      sharedWith: shareWith,
      permissions,
      expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
      createdAt: Date.now(),
    };

    // TODO: API call to share session
    /*
    await fetch(`${API_URL}/sessions/${sessionId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(sharedSession),
    });
    */

    this.sharedSessions.push(sharedSession);
    return sharedSession;
  }

  /**
   * Revoke session sharing
   */
  async revokeSharing(shareId: string): Promise<void> {
    // TODO: API call to revoke sharing

    this.sharedSessions = this.sharedSessions.filter(s => s.shareId !== shareId);
  }

  /**
   * Add comment to session
   */
  async addComment(sessionId: string, content: string, replyTo?: string): Promise<SessionComment> {
    if (!this.currentUserId) {
      throw new Error('User not initialized');
    }

    const comment: SessionComment = {
      commentId: this.generateId('comment'),
      sessionId,
      userId: this.currentUserId,
      userName: '', // TODO: Get from user profile
      content,
      timestamp: Date.now(),
      replyTo,
    };

    // TODO: API call to add comment
    /*
    await fetch(`${API_URL}/sessions/${sessionId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(comment),
    });
    */

    return comment;
  }

  /**
   * Get comments for session
   */
  async getComments(sessionId: string): Promise<SessionComment[]> {
    // TODO: API call to get comments
    /*
    const response = await fetch(`${API_URL}/sessions/${sessionId}/comments`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return await response.json();
    */

    return [];
  }

  /**
   * Edit comment
   */
  async editComment(commentId: string, newContent: string): Promise<void> {
    // TODO: API call to edit comment
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId: string): Promise<void> {
    // TODO: API call to delete comment
  }

  /**
   * Get activity feed for team
   */
  async getActivityFeed(teamId: string, limit: number = 50): Promise<ActivityEvent[]> {
    // TODO: API call to get activity feed
    /*
    const response = await fetch(
      `${API_URL}/teams/${teamId}/activity?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return await response.json();
    */

    return [];
  }

  /**
   * Check if user has permission
   */
  hasPermission(teamId: string, permission: Permission): boolean {
    if (!this.currentUserId) {
      return false;
    }

    const team = this.teams.find(t => t.teamId === teamId);
    if (!team) {
      return false;
    }

    const member = team.members.find(m => m.userId === this.currentUserId);
    if (!member) {
      return false;
    }

    // Permission matrix
    const rolePermissions: Record<UserRole, Permission[]> = {
      [UserRole.OWNER]: [
        Permission.VIEW,
        Permission.EDIT,
        Permission.DELETE,
        Permission.SHARE,
        Permission.MANAGE_MEMBERS,
      ],
      [UserRole.ADMIN]: [
        Permission.VIEW,
        Permission.EDIT,
        Permission.DELETE,
        Permission.SHARE,
        Permission.MANAGE_MEMBERS,
      ],
      [UserRole.MEMBER]: [Permission.VIEW, Permission.EDIT, Permission.SHARE],
      [UserRole.VIEWER]: [Permission.VIEW],
    };

    return rolePermissions[member.role]?.includes(permission) || false;
  }

  /**
   * Get user's teams
   */
  getTeams(): Team[] {
    return this.teams;
  }

  /**
   * Get shared sessions
   */
  getSharedSessions(): SharedSession[] {
    return this.sharedSessions;
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Load teams from server
   */
  private async loadTeams(): Promise<void> {
    // TODO: API call to load teams
  }

  /**
   * Load shared sessions from server
   */
  private async loadSharedSessions(): Promise<void> {
    // TODO: API call to load shared sessions
  }
}
