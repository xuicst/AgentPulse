import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const BEGIN_MARKER = "# BEGIN AgentPulse Codex hooks";
const END_MARKER = "# END AgentPulse Codex hooks";

export class CodexHookInstaller {
    public constructor(
        private readonly extensionPath: string
    ) {}

    public async isInstalled(): Promise<boolean> {
        try {
            const config = await fs.promises.readFile(
                this.getConfigPath(),
                "utf8"
            );

            return config.includes(BEGIN_MARKER);
        } catch {
            return false;
        }
    }

    public async install(): Promise<void> {
        const configPath = this.getConfigPath();
        const hookPath = this.getHookPath();
        const sourceHookPath = path.join(
            this.extensionPath,
            "scripts",
            "codex-hook.cjs"
        );

        await fs.promises.access(configPath);
        await fs.promises.mkdir(path.dirname(hookPath), {
            recursive: true
        });
        await fs.promises.copyFile(sourceHookPath, hookPath);

        const config = await fs.promises.readFile(
            configPath,
            "utf8"
        );
        const updatedConfig = this.addAgentPulseHooks(config, hookPath);

        if (updatedConfig === config) {
            return;
        }

        const temporaryPath = `${configPath}.agentpulse.tmp`;
        await fs.promises.writeFile(
            temporaryPath,
            updatedConfig,
            "utf8"
        );
        await fs.promises.rename(temporaryPath, configPath);
    }

    private getConfigPath(): string {
        return path.join(os.homedir(), ".codex", "config.toml");
    }

    private getHookPath(): string {
        return path.join(
            os.homedir(),
            ".agentpulse",
            "hooks",
            "codex-hook.cjs"
        );
    }

    private addAgentPulseHooks(
        config: string,
        hookPath: string
    ): string {
        if (config.includes(BEGIN_MARKER)) {
            return config;
        }

        const lines = this.enableHooksFeature(
            config.split(/\r?\n/)
        );
        const stateIndex = lines.findIndex(
            line => line.trim() === "[hooks.state]"
        );
        const insertionIndex =
            stateIndex === -1 ? lines.length : stateIndex;

        lines.splice(
            insertionIndex,
            0,
            "",
            ...this.createHookBlock(hookPath)
        );

        return `${lines.join("\n").replace(/\n+$/, "")}\n`;
    }

    private enableHooksFeature(lines: string[]): string[] {
        const featuresIndex = lines.findIndex(
            line => line.trim() === "[features]"
        );

        if (featuresIndex === -1) {
            return [
                ...lines,
                "",
                "[features]",
                "hooks = true"
            ];
        }

        let endIndex = lines.length;
        for (let index = featuresIndex + 1; index < lines.length; index++) {
            if (lines[index].trim().startsWith("[")) {
                endIndex = index;
                break;
            }
        }

        for (let index = featuresIndex + 1; index < endIndex; index++) {
            if (/^\s*hooks\s*=/.test(lines[index])) {
                lines[index] = "hooks = true";
                return lines;
            }
        }

        lines.splice(featuresIndex + 1, 0, "hooks = true");
        return lines;
    }

    private createHookBlock(hookPath: string): string[] {
        const command = `node "${hookPath}"`;
        const commandValue = JSON.stringify(command);
        const windowsCommand =
            process.platform === "win32"
                ? `command_windows = ${commandValue}`
                : undefined;

        return [
            BEGIN_MARKER,
            "[[hooks.SessionStart]]",
            "matcher = \"startup|resume|clear|compact\"",
            "",
            "[[hooks.SessionStart.hooks]]",
            "type = \"command\"",
            `command = ${commandValue}`,
            ...(windowsCommand ? [windowsCommand] : []),
            "timeout = 10",
            "statusMessage = \"AgentPulse: recording session start\"",
            "",
            "[[hooks.PermissionRequest]]",
            "matcher = \".*\"",
            "",
            "[[hooks.PermissionRequest.hooks]]",
            "type = \"command\"",
            `command = ${commandValue}`,
            ...(windowsCommand ? [windowsCommand] : []),
            "timeout = 10",
            "statusMessage = \"AgentPulse: recording permission request\"",
            "",
            "[[hooks.Stop]]",
            "",
            "[[hooks.Stop.hooks]]",
            "type = \"command\"",
            `command = ${commandValue}`,
            ...(windowsCommand ? [windowsCommand] : []),
            "timeout = 10",
            "statusMessage = \"AgentPulse: recording turn completion\"",
            END_MARKER
        ];
    }
}
