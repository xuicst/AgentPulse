import * as vscode from "vscode";

export class ConfigManager {
    private static readonly SECTION = "agentPulse";

    public isEnabled(): boolean {
        return this.get<boolean>("enabled", true);
    }

    public isDebugEnabled(): boolean {
        return this.get<boolean>("debug", false);
    }

    public isStatusBarEnabled(): boolean {
        return this.get<boolean>("statusBar.enabled", true);
    }

    public isCodexEnabled(): boolean {
        return this.get<boolean>(
            "detectors.codex",
            true
        );
    }
    
    public isClaudeEnabled(): boolean {
        return this.get<boolean>(
            "detectors.claude",
            true
        );
    }

    public get<T>(key: string, defaultValue: T): T {
        return vscode.workspace
            .getConfiguration(ConfigManager.SECTION)
            .get<T>(key, defaultValue);
    }
}