import { AgentEventType } from "../../core/events";
import { ClaudeHookPayload } from "./claudeHookTypes";

export function mapClaudeHookToAgentEventType(
    payload: ClaudeHookPayload
): AgentEventType | undefined {
    console.log("Claude mapper called", payload.hook_event_name);
    switch (payload.hook_event_name) {
        case "PreToolUse":
            return AgentEventType.Started;

        case "PostToolUse":
            return AgentEventType.Finished;

        case "PostToolUseFailure":
            return AgentEventType.Error;

        case "PermissionDenied":
            return AgentEventType.WaitingPermission;

        default:
            return undefined;
    }
}