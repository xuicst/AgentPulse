import { AgentEventType } from "../../core/events";
import { CodexHookPayload } from "./codexHookTypes";

export function mapCodexHookToAgentEventType(
    payload: CodexHookPayload
): AgentEventType | undefined {

    switch (payload.hook_event_name) {
        case "SessionStart":
            return AgentEventType.Started;

        case "PermissionRequest":
            return AgentEventType.WaitingPermission;

        case "Stop":
            return AgentEventType.Finished;

        default:
            return undefined;
    }
}