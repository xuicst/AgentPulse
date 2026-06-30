import * as os from "os";
import * as path from "path";

export function getAgentPulseSignalDir(): string {
    return path.join(os.homedir(), ".agentpulse", "signals");
}

export function getClaudeSignalFilePath(): string {
    return path.join(getAgentPulseSignalDir(), "claude.signal.json");
}