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
    private readonly notificationRouter = new NotificationRouter();

    public async initialize(
        context: vscode.ExtensionContext
    ): Promise<void> {
        if (!this.config.isEnabled()) {
            this.logger.info("AgentPulse disabled.");
            return;
        }

        this.logger.info("AgentPulse initializing...");

        await registerWindowsAumid();

        if (this.config.isStatusBarEnabled()) {
            this.statusBar = new StatusBarManager();
            this.disposables.push(this.statusBar);
        }

        this.registerCommands();

        this.registerNotificationServices(context);

        this.registerEventBus();

        this.registerDetectors();

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
                    "AgentPulse v1.0.0"
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

        this.notifierManager.register(
            new WindowsNotifier(
                context.extensionPath
            )
        );
    }

    private registerEventBus(): void {
        this.eventBus.subscribe(async event => {
            this.agentManager.update(event);
            const formatted =
                EventFormatter.format(event);
            this.logger.info(
                `[${event.source}] ${event.type}`
            );

            this.statusBar?.updateByEvent(event);
            if (
                this.notificationRouter.shouldNotify(event)
            ) {
                await this.notifierManager.notifyAll(event);
            }
        });
    }

    private registerDetectors(): void {
        for (const detector of DetectorFactory.create(this.config)) {
            this.detectorManager.register(detector);
        }
    }

    public async dispose(): Promise<void> {
        this.logger.info("AgentPulse disposing...");

        await this.detectorManager.deactivateAll();

        this.notifierManager.dispose();

        for (const disposable of this.disposables) {
            disposable.dispose();
        }

        this.agentManager.clear();
        this.eventBus.dispose();
        this.logger.dispose();
    }
}