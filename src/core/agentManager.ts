import { AgentEvent, AgentEventType } from "./events";

export interface AgentState {
    agent: string;
    sessionId?: string;

    status: AgentEventType;

    toolName?: string;

    updatedAt: number;

    payload?: unknown;
}

export class AgentManager {
    private readonly agents = new Map<string, AgentState>();

    /**
     * 根据事件更新 Agent 状态
     */
    public update(event: AgentEvent): void {
        const id = event.agent ?? event.source;

        this.agents.set(id, {
            agent: id,
            sessionId: event.sessionId,
            status: event.type,
            toolName: event.toolName,
            updatedAt: event.timestamp,
            payload: event.payload
        });
    }

    /**
     * 获取指定 Agent
     */
    public get(agent: string): AgentState | undefined {
        return this.agents.get(agent);
    }

    /**
     * 获取所有 Agent
     */
    public getAll(): readonly AgentState[] {
        return [...this.agents.values()];
    }

    /**
     * Agent 是否存在
     */
    public has(agent: string): boolean {
        return this.agents.has(agent);
    }

    /**
     * 当前运行中的 Agent
     */
    public getRunning(): readonly AgentState[] {
        return [...this.agents.values()].filter(
            x =>
                x.status === AgentEventType.Started ||
                x.status === AgentEventType.ToolStarted ||
                x.status === AgentEventType.WaitingPermission
        );
    }

    /**
     * 清空状态
     */
    public clear(): void {
        this.agents.clear();
    }
}