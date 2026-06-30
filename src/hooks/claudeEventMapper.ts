import { AgentEvent, AgentEventType } from "../core/events";
import { ClaudeHookEventName, ClaudeHookPayload } from "./claudeHookTypes";

export function mapClaudeHookToAgentEvent(
    payload: ClaudeHookPayload
): AgentEvent {
    switch (payload.event) {
        case ClaudeHookEventName.PermissionRequest:
            return {
                source: "claude",
                type: AgentEventType.WaitingPermission,
                timestamp: payload.timestamp ?? Date.now(),
                payload
            };

        case ClaudeHookEventName.Stop:
            return {
                source: "claude",
                type: AgentEventType.Finished,
                timestamp: payload.timestamp ?? Date.now(),
                payload
            };

        case ClaudeHookEventName.Notification:
        default:
            return {
                source: "claude",
                type: AgentEventType.WaitingInput,
                timestamp: payload.timestamp ?? Date.now(),
                payload
            };
    }
}