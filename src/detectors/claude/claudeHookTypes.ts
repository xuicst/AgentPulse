// export enum ClaudeHookEventName {
//     PreToolUse = "PreToolUse",
//     PostToolUse = "PostToolUse",
//     PostToolUseFailure = "PostToolUseFailure",
//     PermissionDenied = "PermissionDenied",
//     Notification = "Notification"
// }
export type ClaudeHookEventName =
    | "PreToolUse"
    | "PostToolUse"
    | "PostToolUseFailure"
    | "PostToolBatch"
    | "PermissionDenied"
    | "Notification"
    | "UserPromptSubmit"
    | "UserPromptExpansion"
    | "SessionStart"
    | "Stop"
    | "StopFailure"
    | "SubagentStart"
    | "SubagentStop"
    | "PreCompact"
    | "PostCompact"
    | "SessionEnd"
    | "PermissionRequest"
    | "Setup"
    | "TeammateIdle"
    | "TaskCreated"
    | "TaskCompleted"
    | "Elicitation"
    | "ElicitationResult"
    | "ConfigChange"
    | "InstructionsLoaded"
    | "WorktreeCreate"
    | "WorktreeRemove"
    | "CwdChanged"
    | "FileChanged"
    | "MessageDisplay";

export interface ClaudeHookPayload {
    hook_event_name: ClaudeHookEventName;
    session_id?: string;
    cwd?: string;
    transcript_path?: string;
    tool_name?: string;
    tool_input?: {
        command?: string;
        description?: string | null;
        [key: string]: unknown;
    };
    message?: string;
    error?: string;
    [key: string]: unknown;
}