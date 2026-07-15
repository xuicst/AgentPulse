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

    public isDesktopNotificationEnabled(): boolean {
        return this.get<boolean>(
            "notifications.desktop",
            true
        );
    }

    public getNotificationLevel(): string {
        return this.get<string>(
            "notifications.level",
            "important"
        );
    }

    public isClaudeEnabled(): boolean {
        return this.get<boolean>(
            "detectors.claude",
            true
        );
    }

    public isCodexEnabled(): boolean {
        return this.get<boolean>(
            "detectors.codex",
            true
        );
    }

    public isCompletedNotificationEnabled(): boolean {
        return this.get(
            "notifications.completed",
            true
        );
    }
    
    public isPermissionNotificationEnabled(): boolean {
        return this.get(
            "notifications.permission",
            true
        );
    }
    
    public isErrorNotificationEnabled(): boolean {
        return this.get(
            "notifications.failed",
            true
        );
    }
    
    public isCancelledNotificationEnabled(): boolean {
        return this.get(
            "notifications.cancelled",
            true
        );
    }

    public get<T>(key: string, defaultValue: T): T {
        return vscode.workspace
            .getConfiguration(ConfigManager.SECTION)
            .get<T>(key, defaultValue);
    }
}
