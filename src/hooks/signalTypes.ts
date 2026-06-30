export interface SignalFileEvent {
    id: string;
    agent: string;
    event: string;
    createdAt: number;
    payload?: unknown;
}