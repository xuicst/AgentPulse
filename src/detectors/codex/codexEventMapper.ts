import { AgentEvent, AgentEventType } from "../../core/events";
import {
    CodexHookEventName,
    CodexHookPayload
} from "./codexHookTypes";

export function mapCodexHookToAgentEvent(
    payload: CodexHookPayload
): AgentEvent {
    let type: AgentEventType;

    switch (payload.hook_event_name) {
        case CodexHookEventName.SessionStart:
            type = AgentEventType.Started;
            break;

        case CodexHookEventName.PermissionRequest:
            type = AgentEventType.WaitingPermission;
            break;

        case CodexHookEventName.Stop:
            type = AgentEventType.Finished;
            break;

        default:
            type = AgentEventType.WaitingInput;
            break;
    }

    return {
        source: "codex",
        type,
        timestamp: Date.now(),
        payload
    };
}