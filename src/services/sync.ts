import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Simple logger implementation until we create the full logger utility
const logger = {
  error: (message: string, error?: unknown) => {
    if (__DEV__) {
      console.error(message, error);
    }
  },
};

export type SyncAction = {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
};

export type SyncState = {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingActions: number;
};

type SyncSubscriber = (state: SyncState) => void;

interface DatabaseRecord {
  id: string;
  updated_at?: string;
  [key: string]: unknown;
}

export class SyncService {
  private static instance: SyncService;
  private actionQueue: SyncAction[] = [];
  private state: SyncState = {
    isOnline: true,
    isSyncing: false,
    lastSyncTime: null,
    pendingActions: 0,
  };
  private subscribers: Set<SyncSubscriber> = new Set();

  private constructor() {
    this.initialize();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private async initialize(): Promise<void> {
    // Load queued actions from storage
    await this.loadQueue();

    // Setup network monitoring
    NetInfo.addEventListener((state: NetInfoState) => {
      const isOnline = state.isConnected ?? false;
      if (isOnline !== this.state.isOnline) {
        this.updateState({ isOnline });
        if (isOnline) {
          void this.processPendingActions();
        }
      }
    });
  }

  private async loadQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem('@sync_queue');
      if (queueData) {
        this.actionQueue = JSON.parse(queueData);
        this.updateState({ pendingActions: this.actionQueue.length });
      }
    } catch (error) {
      logger.error('Failed to load sync queue', error);
    }
  }

  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('@sync_queue', JSON.stringify(this.actionQueue));
      this.updateState({ pendingActions: this.actionQueue.length });
    } catch (error) {
      logger.error('Failed to save sync queue', error);
    }
  }

  private updateState(newState: Partial<SyncState>): void {
    this.state = { ...this.state, ...newState };
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(subscriber => subscriber(this.state));
  }

  async queueAction(action: Omit<SyncAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const syncAction: SyncAction = {
      ...action,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.actionQueue.push(syncAction);
    await this.saveQueue();

    if (this.state.isOnline) {
      await this.processPendingActions();
    }
  }

  private async processPendingActions(): Promise<void> {
    if (this.state.isSyncing || !this.state.isOnline) return;

    this.updateState({ isSyncing: true });

    try {
      const actions = [...this.actionQueue];
      for (const action of actions) {
        try {
          await this.processAction(action);
          this.actionQueue = this.actionQueue.filter(a => a.id !== action.id);
          await this.saveQueue();
        } catch (error) {
          logger.error(`Failed to process action ${action.id}`, error);
          if (action.retryCount < 3) {
            action.retryCount++;
          } else {
            // Move to failed actions or handle differently
            this.actionQueue = this.actionQueue.filter(a => a.id !== action.id);
            await AsyncStorage.setItem(
              `@sync_failed_${action.id}`,
              JSON.stringify({ action, error })
            );
          }
        }
      }
    } finally {
      this.updateState({
        isSyncing: false,
        lastSyncTime: Date.now(),
      });
    }
  }

  private async processAction(action: SyncAction): Promise<void> {
    const { table, type, data } = action;

    switch (type) {
      case 'CREATE':
        await this.handleCreate(table, data);
        break;
      case 'UPDATE':
        if (this.isRecordWithId(data)) {
          await this.handleUpdate(table, data);
        } else {
          throw new Error('Invalid data format for update operation');
        }
        break;
      case 'DELETE':
        if (this.isRecordWithId(data)) {
          await this.handleDelete(table, data);
        } else {
          throw new Error('Invalid data format for delete operation');
        }
        break;
    }
  }

  private isRecordWithId(data: unknown): data is DatabaseRecord {
    return (
      typeof data === 'object' &&
      data !== null &&
      'id' in data &&
      typeof (data as DatabaseRecord).id === 'string'
    );
  }

  private async handleCreate(table: string, data: Record<string, unknown>): Promise<void> {
    const { error } = await supabase.from(table).insert(data);
    if (error) throw error;
  }

  private async handleUpdate(table: string, data: DatabaseRecord): Promise<void> {
    // Check for conflicts
    const { data: current } = await supabase.from(table).select('*').eq('id', data.id).single();

    if (current && this.isRecordWithId(current)) {
      // Simple conflict resolution: server wins if data is newer
      const serverTimestamp = current.updated_at ? new Date(current.updated_at).getTime() : 0;
      const localTimestamp = data.updated_at ? new Date(data.updated_at).getTime() : 0;

      if (localTimestamp < serverTimestamp) {
        throw new Error('Conflict: Server has newer data');
      }
    }

    const { error } = await supabase.from(table).update(data).eq('id', data.id);

    if (error) throw error;
  }

  private async handleDelete(table: string, data: DatabaseRecord): Promise<void> {
    const { error } = await supabase.from(table).delete().eq('id', data.id);

    if (error) throw error;
  }

  subscribe(callback: SyncSubscriber): () => void {
    this.subscribers.add(callback);
    callback(this.state);
    return () => this.subscribers.delete(callback);
  }

  getState(): SyncState {
    return { ...this.state };
  }

  async sync(): Promise<void> {
    if (this.state.isOnline && !this.state.isSyncing) {
      await this.processPendingActions();
    }
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance();
