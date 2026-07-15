import * as fs from "fs";
import * as os from "os";
import * as path from "path";

type JsonObject = Record<string, unknown>;

const HOOK_EVENTS = [
    "PermissionRequest",
    "Stop",
    "StopFailure",
    "PermissionDenied"
] as const;

export class ClaudeHookInstaller {
    public constructor(
        private readonly extensionPath: string
    ) {}

    public async isInstalled(): Promise<boolean> {
        try {
            const settings = await this.readSettings();
            return HOOK_EVENTS.every(event =>
                this.hasAgentPulseHook(settings, event)
            );
        } catch {
            return false;
        }
    }

    public async install(): Promise<void> {
        const settingsPath = this.getSettingsPath();
        const hookPath = this.getHookPath();
        const sourceHookPath = path.join(
            this.extensionPath,
            "scripts",
            "claude-hook.cjs"
        );

        await fs.promises.access(settingsPath);
        await fs.promises.mkdir(path.dirname(hookPath), {
            recursive: true
        });
        await fs.promises.copyFile(sourceHookPath, hookPath);

        const settings = await this.readSettings();
        const hooks = this.getHooks(settings);
        const command = `node "${hookPath}"`;

        for (const event of HOOK_EVENTS) {
            if (!this.hasAgentPulseHook(settings, event)) {
                const groups = this.getMatcherGroups(hooks[event]);
                groups.push({
                    matcher: "",
                    hooks: [{
                        type: "command",
                        command,
                        timeout: 10
                    }]
                });
                hooks[event] = groups;
            }
        }

        const temporaryPath = `${settingsPath}.agentpulse.tmp`;
        await fs.promises.writeFile(
            temporaryPath,
            `${JSON.stringify(settings, null, 2)}\n`,
            "utf8"
        );
        await fs.promises.rename(temporaryPath, settingsPath);
    }

    private async readSettings(): Promise<JsonObject> {
        const content = await fs.promises.readFile(
            this.getSettingsPath(),
            "utf8"
        );
        const settings = JSON.parse(content) as unknown;

        if (!this.isJsonObject(settings)) {
            throw new Error("Claude settings must be a JSON object.");
        }

        return settings;
    }

    private getSettingsPath(): string {
        return path.join(os.homedir(), ".claude", "settings.json");
    }

    private getHookPath(): string {
        return path.join(
            os.homedir(),
            ".agentpulse",
            "hooks",
            "claude-hook.cjs"
        );
    }

    private getHooks(settings: JsonObject): JsonObject {
        if (!this.isJsonObject(settings.hooks)) {
            settings.hooks = {};
        }

        return settings.hooks as JsonObject;
    }

    private hasAgentPulseHook(
        settings: JsonObject,
        event: string
    ): boolean {
        const hooks = this.getHooks(settings);

        return this.getMatcherGroups(hooks[event]).some(group =>
            this.getHookHandlers(group.hooks).some(handler =>
                typeof handler.command === "string" &&
                handler.command.includes("claude-hook.cjs")
            )
        );
    }

    private getMatcherGroups(value: unknown): JsonObject[] {
        if (!Array.isArray(value)) {
            return [];
        }

        return value.filter(this.isJsonObject);
    }

    private getHookHandlers(value: unknown): JsonObject[] {
        if (!Array.isArray(value)) {
            return [];
        }

        return value.filter(this.isJsonObject);
    }

    private isJsonObject(value: unknown): value is JsonObject {
        return typeof value === "object" && value !== null && !Array.isArray(value);
    }
}
