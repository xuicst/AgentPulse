import { AgentEvent, AgentEventType } from "../core/events";
import { AgentSession } from "./agentSession";
import { AgentState } from "./agentState";

export class AgentManager {
    private readonly sessions = new Map<string, AgentSession>();

    public update(event: AgentEvent): AgentSession {
        const agent = event.agent ?? event.source;

        let session = this.sessions.get(agent);

        if (!session) {
            session = {
                agent,
                state: AgentState.Idle,
                updatedAt: event.timestamp
            };

            this.sessions.set(agent, session);
        }

        session.updatedAt = event.timestamp;

        session.payload = event.payload;

        if (event.sessionId) {
            session.sessionId = event.sessionId;
        }

        if (event.toolName) {
            session.toolName = event.toolName;
        }

        switch (event.type) {
            case AgentEventType.Started:
                session.state = AgentState.Running;
                session.startedAt = session.startedAt ?? event.timestamp;
                break;

            case AgentEventType.ToolStarted:
                session.state = AgentState.Running;
                break;

            case AgentEventType.ToolFinished:
                session.state = AgentState.Running;
                break;

            case AgentEventType.WaitingPermission:
                session.state = AgentState.WaitingPermission;
                break;

            case AgentEventType.WaitingInput:
                session.state = AgentState.WaitingInput;
                break;

            case AgentEventType.Finished:
                session.state = AgentState.Finished;
                session.finishedAt = event.timestamp;
                break;

            case AgentEventType.Error:
                session.state = AgentState.Error;
                session.finishedAt = event.timestamp;
                break;

            case AgentEventType.Cancelled:
                session.state = AgentState.Cancelled;
                session.finishedAt = event.timestamp;
                break;
        }

        return session;
    }

    public get(agent: string): AgentSession | undefined {
        return this.sessions.get(agent);
    }

    public current(): readonly AgentSession[] {
        return [...this.sessions.values()];
    }

    public has(agent: string): boolean {
        return this.sessions.has(agent);
    }

    public remove(agent: string): boolean {
        return this.sessions.delete(agent);
    }

    public clear(): void {
        this.sessions.clear();
    }

    public count(): number {
        return this.sessions.size;
    }
}