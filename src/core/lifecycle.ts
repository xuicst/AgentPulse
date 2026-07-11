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
import { WindowsNotifier } from "../notifications/windowsNotifier";
import { registerWindowsAumid } from "../notifications/windowsAumid";
import { EventDeduplicator } from "./eventDeduplicator";
import { StatusBarManager } from "../ui/statusBar";
import { AgentManager } from "./agentManager";

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

        await registerWindowsAumid();

        if (this.config.isStatusBarEnabled()) {
            this.statusBar = new StatusBarManager();
        }

        this.registerCommands();

        this.registerNotificationServices(context);

        this.registerEventBus();

        this.registerDetectors();

        this.registerConfigurationListener();

        await this.detectorManager.activateAll();

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
                    "AgentPulse v1.0"
                )
            ),

            vscode.commands.registerCommand(
                "agentPulse.restart",
                () => vscode.window.showInformationMessage(
                    "Restart is not implemented yet."
                )
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
            )
        );
    }

    private registerNotificationServices(
        context: vscode.ExtensionContext
    ): void {
    
        this.notifierManager.register(
            new MockNotifier()
        );
    
        if (this.config.isDesktopNotificationEnabled()) {
            this.notifierManager.register(
                new WindowsNotifier(
                    context.extensionPath
                )
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
    
                await this.reloadDetectors();

                if (this.context) {
                    this.reloadNotifiers(this.context);
                }

                this.reloadStatusBar();
            });
    
        this.disposables.push(disposable);
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