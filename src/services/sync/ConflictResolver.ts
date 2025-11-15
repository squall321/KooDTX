/**
 * Conflict Resolver
 * Phase 117: Synchronization conflict resolution
 */

export enum ConflictStrategy {
  LAST_WRITE_WINS = 'last_write_wins',
  SERVER_WINS = 'server_wins',
  LOCAL_WINS = 'local_wins',
  MANUAL = 'manual',
}

export interface ConflictItem {
  id: string;
  localVersion: any;
  serverVersion: any;
  localTimestamp: number;
  serverTimestamp: number;
  resolved: boolean;
  resolution?: ConflictStrategy;
}

export class ConflictResolver {
  private static instance: ConflictResolver;
  private conflicts: ConflictItem[] = [];
  private strategy: ConflictStrategy = ConflictStrategy.LAST_WRITE_WINS;

  private constructor() {}

  public static getInstance(): ConflictResolver {
    if (!ConflictResolver.instance) {
      ConflictResolver.instance = new ConflictResolver();
    }
    return ConflictResolver.instance;
  }

  /**
   * Phase 117: Resolve conflict using configured strategy
   */
  public resolve(conflict: ConflictItem): any {
    switch (this.strategy) {
      case ConflictStrategy.LAST_WRITE_WINS:
        return this.lastWriteWins(conflict);
      case ConflictStrategy.SERVER_WINS:
        return conflict.serverVersion;
      case ConflictStrategy.LOCAL_WINS:
        return conflict.localVersion;
      case ConflictStrategy.MANUAL:
        this.conflicts.push(conflict);
        return null;
      default:
        return this.lastWriteWins(conflict);
    }
  }

  private lastWriteWins(conflict: ConflictItem): any {
    return conflict.serverTimestamp > conflict.localTimestamp
      ? conflict.serverVersion
      : conflict.localVersion;
  }

  public setStrategy(strategy: ConflictStrategy): void {
    this.strategy = strategy;
  }

  public getConflicts(): ConflictItem[] {
    return [...this.conflicts];
  }

  public resolveManually(id: string, resolution: 'server' | 'local'): void {
    const conflict = this.conflicts.find(c => c.id === id);
    if (conflict) {
      conflict.resolved = true;
      conflict.resolution = resolution === 'server' 
        ? ConflictStrategy.SERVER_WINS 
        : ConflictStrategy.LOCAL_WINS;
    }
  }
}

export const conflictResolver = ConflictResolver.getInstance();
export default conflictResolver;
