import { AgentEventType } from "../../core/events";
import { ClaudeHookPayload } from "./claudeHookTypes";

export function mapClaudeHookToAgentEventType(
    payload: ClaudeHookPayload
): AgentEventType | undefined {

    switch (payload.hook_event_name) {

        case "PreToolUse":
            return AgentEventType.Started;
    
        case "PermissionRequest":
            return AgentEventType.WaitingPermission;
    
        case "Stop":
            return AgentEventType.Finished;
    
        case "StopFailure":
            return AgentEventType.Error;
    
        case "PermissionDenied":
            return AgentEventType.Cancelled;
    
        default:
            return undefined;
    }
}