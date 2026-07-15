import { AgentEventType } from "../../core/events";
import {
    CodexHookEventName,
    CodexHookPayload
} from "./codexHookTypes";

export function mapCodexHookToAgentEventType(
    payload: CodexHookPayload
): AgentEventType | undefined {

    switch (payload.hook_event_name) {

        case CodexHookEventName.SessionStart:
            return AgentEventType.Started;

        case CodexHookEventName.PermissionRequest:
            return AgentEventType.WaitingPermission;

        case CodexHookEventName.Stop:
            return AgentEventType.Finished;

        default:
            return undefined;
    }
}