import * as vscode from "vscode";

import { ConfigManager } from "./config";
import { EventBus } from "./eventBus";
import { AgentEventType } from "./events";
import { Logger } from "./logger";
import { NotificationRouter } from "./notificationRouter";
import { DetectorFactory } from "../detectors/detectorFactory";
import { DetectorManager } from "../detectors/detectorManager";
import { EventFormatter } from "./eventFormatter";
import { MockNotifier } from "../notifications/mockNotifier";
import { NotifierManager } from "../notifications/notifierManager";
import { createPlatformNotifier } from "../notifications/platformNotifierFactory";
import { FallbackNotifier } from "../notifications/fallbackNotifier";
import { VsCodeNotifier } from "../notifications/vscodeNotifier";
import { EventDeduplicator } from "./eventDeduplicator";
import { StatusBarManager } from "../ui/statusBar";
import { AgentManager } from "./agentManager";
import { CodexHookInstaller } from "../hooks/codexHookInstaller";
import { ClaudeHookInstaller } from "../hooks/claudeHookInstaller";

export class Lifecycle {
    private readonly logger = Logger.getInstance();
    private readonly config = new ConfigManager();
    private readonly eventBus = EventBus.getInstance();
    private readonly detectorManager = new DetectorManager();
    private readonly notifierManager = new NotifierManager();
    private readonly agentManager = new AgentManager();
    private readonly disposables: vscode.Disposable[] = [];
    private statusBar?: StatusBarManager;
    private readonly notificationRouter =
        new NotificationRouter(this.config);
    private context?: vscode.ExtensionContext;
    private readonly deduplicator =
        new EventDeduplicator();

    public async initialize(
        context: vscode.ExtensionContext
    ): Promise<void> {
        if (!this.config.isEnabled()) {
            this.logger.info("AgentPulse disabled.");
            return;
        }

        this.logger.info("AgentPulse initializing...");
        this.context = context;

        if (this.config.isStatusBarEnabled()) {
            this.statusBar = new StatusBarManager();
        }

        this.registerCommands();

        this.registerNotificationServices(context);

        this.registerEventBus();

        this.registerDetectors();

        this.registerConfigurationListener();

        await this.detectorManager.activateAll();

        void this.promptForHookInstallations();

        context.subscriptions.push(...this.disposables);

        this.logger.info("AgentPulse initialized.");

        this.eventBus.publish({
            source: "system",
            type: AgentEventType.Started,
            timestamp: Date.now()
        });
    }

    private registerCommands(): void {
        this.disposables.push(
            vscode.commands.registerCommand(
                "agentPulse.showOutput",
                () => this.logger.show()
            ),

            vscode.commands.registerCommand(
                "agentPulse.about",
                () => vscode.window.showInformationMessage(
                    "AgentPulse v1.0.0"
                )
            ),

            vscode.commands.registerCommand(
                "agentPulse.restart",
                async () => {
                    await this.reloadDetectors();

                    if (this.context) {
                        this.reloadNotifiers(this.context);
                    }

                    this.reloadStatusBar();
                    void vscode.window.showInformationMessage(
                        "AgentPulse restarted."
                    );
                }
            ),

            vscode.commands.registerCommand(
                "agentPulse.testNotification",
                () => {
                    this.logger.info("Test notification requested.");

                    this.eventBus.publish({
                        source: "test",
                        type: AgentEventType.WaitingPermission,
                        timestamp: Date.now()
                    });
                }
            ),

            vscode.commands.registerCommand(
                "agentPulse.installCodexHook",
                () => this.installCodexHook()
            ),

            vscode.commands.registerCommand(
                "agentPulse.installClaudeHook",
                () => this.installClaudeHook()
            )
        );
    }

    private registerNotificationServices(
        context: vscode.ExtensionContext
    ): void {
    
        this.notifierManager.register(
            new MockNotifier()
        );
    
        if (!this.config.isDesktopNotificationEnabled()) {
            return;
        }

        const notifier = createPlatformNotifier(
            context.extensionPath
        );

        if (notifier) {
            this.notifierManager.register(
                new FallbackNotifier(
                    notifier,
                    new VsCodeNotifier()
                )
            );
        } else {
            this.logger.warn(
                `Desktop notifications are not supported on ${process.platform}.`
            );
            this.notifierManager.register(
                new VsCodeNotifier()
            );
        }
    }

    private registerEventBus(): void {
        this.eventBus.subscribe(async event => {
            if (!this.deduplicator.shouldPublish(event)) {
                return;
            }
            this.agentManager.update(event);
            this.logger.info(
                `[${event.source}] ${event.type}`
            );

            this.statusBar?.updateByEvent(event);
            if (this.notificationRouter.shouldNotify(event)) {
                await this.notifierManager.notifyAll(event);
            }
        });
    }

    private registerDetectors(): void {
        for (const detector of DetectorFactory.create(this.config)) {
            this.detectorManager.register(detector);
        }
    }

    private registerConfigurationListener(): void {
        const disposable =
            vscode.workspace.onDidChangeConfiguration(async event => {
    
                if (!event.affectsConfiguration("agentPulse")) {
                    return;
                }
    
                this.logger.info(
                    "AgentPulse configuration changed."
                );

                if (!this.config.isEnabled()) {
                    await this.detectorManager.deactivateAll();
                    this.notifierManager.dispose();
                    this.statusBar?.dispose();
                    this.statusBar = undefined;
                    this.logger.info("AgentPulse disabled.");
                    return;
                }
    
                await this.reloadDetectors();

                if (this.context) {
                    this.reloadNotifiers(this.context);
                }

                this.reloadStatusBar();
            });
    
        this.disposables.push(disposable);
    }

    private async promptForHookInstallations(): Promise<void> {
        await this.promptForCodexHookInstallation();
        await this.promptForClaudeHookInstallation();
    }

    private async promptForCodexHookInstallation(): Promise<void> {
        if (!this.config.isCodexEnabled() || !this.isDesktopPlatform()) {
            return;
        }

        if (!this.context) {
            return;
        }

        const installer = new CodexHookInstaller(
            this.context.extensionPath
        );

        if (await installer.isInstalled()) {
            return;
        }

        const action = await vscode.window.showInformationMessage(
            "Enable Codex notifications by installing AgentPulse hooks?",
            "Enable Codex notifications",
            "Not now"
        );

        if (action === "Enable Codex notifications") {
            await this.installCodexHook();
        }
    }

    private async promptForClaudeHookInstallation(): Promise<void> {
        if (!this.config.isClaudeEnabled() || !this.isDesktopPlatform()) {
            return;
        }

        if (!this.context) {
            return;
        }

        const installer = new ClaudeHookInstaller(
            this.context.extensionPath
        );

        if (await installer.isInstalled()) {
            return;
        }

        const action = await vscode.window.showInformationMessage(
            "Enable Claude notifications by installing AgentPulse hooks?",
            "Enable Claude notifications",
            "Not now"
        );

        if (action === "Enable Claude notifications") {
            await this.installClaudeHook();
        }
    }

    private async installCodexHook(): Promise<void> {
        if (!this.context) {
            return;
        }

        try {
            const installer = new CodexHookInstaller(
                this.context.extensionPath
            );
            await installer.install();

            void vscode.window.showInformationMessage(
                "AgentPulse installed Codex hooks. Restart Codex to approve and load them."
            );
        } catch (error) {
            this.logger.error(
                `Failed to install Codex hooks: ${String(error)}`
            );
            void vscode.window.showErrorMessage(
                "AgentPulse could not install Codex hooks. See the AgentPulse output for details."
            );
        }
    }

    private async installClaudeHook(): Promise<void> {
        if (!this.context) {
            return;
        }

        try {
            const installer = new ClaudeHookInstaller(
                this.context.extensionPath
            );
            await installer.install();

            void vscode.window.showInformationMessage(
                "AgentPulse installed Claude hooks. Claude will detect them automatically."
            );
        } catch (error) {
            this.logger.error(
                `Failed to install Claude hooks: ${String(error)}`
            );
            void vscode.window.showErrorMessage(
                "AgentPulse could not install Claude hooks. See the AgentPulse output for details."
            );
        }
    }

    private isDesktopPlatform(): boolean {
        return ["win32", "darwin", "linux"].includes(
            process.platform
        );
    }

    private async reloadDetectors(): Promise<void> {
        this.logger.info(
            "Reloading detectors..."
        );
    
        await this.detectorManager.deactivateAll();
    
        this.detectorManager.clear();
    
        this.registerDetectors();
    
        await this.detectorManager.activateAll();
    
        this.logger.info(
            `Detectors reloaded (${this.detectorManager.count()}).`
        );
    }

    private reloadNotifiers(
        context: vscode.ExtensionContext
    ): void {
    
        this.notifierManager.dispose();
    
        this.registerNotificationServices(context);
    
        this.logger.info(
            `Notification services reloaded (${this.notifierManager.count()}).`
        );
    }

    private reloadStatusBar(): void {
        this.statusBar?.dispose();
        this.statusBar = undefined;
    
        if (this.config.isStatusBarEnabled()) {
            this.statusBar = new StatusBarManager();
        }
    
        this.logger.info("Status bar reloaded.");
    }

    public async dispose(): Promise<void> {
        this.logger.info("AgentPulse disposing...");
        await this.detectorManager.deactivateAll();

        this.notifierManager.dispose();
        this.statusBar?.dispose();
    
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
    
        this.agentManager.clear();
        this.eventBus.dispose();
        this.logger.dispose();
    }
}
