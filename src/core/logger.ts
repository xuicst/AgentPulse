import * as vscode from "vscode";

export enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}

export class Logger {
    private static instance: Logger;
    private readonly output: vscode.OutputChannel;
    private constructor() {
        this.output = vscode.window.createOutputChannel(
            "AgentPulse",
            {
                log: true
            }
        );
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private write(
        level: LogLevel,
        message: string
    ): void {
        const now = new Date();
        const time =
            now.toLocaleTimeString("en-US", {
                hour12: false
            });
        this.output.appendLine(
            `[${time}] [${level}] ${message}`
        );
    }

    public debug(message: string): void {
        this.write(LogLevel.DEBUG, message);
    }

    public info(message: string): void {
        this.write(LogLevel.INFO, message);
    }

    public warn(message: string): void {
        this.write(LogLevel.WARN, message);
    }

    public error(message: string): void {
        this.write(LogLevel.ERROR, message);
    }

    public show(): void {
        this.output.show(true);
    }

    public clear(): void {
        this.output.clear();
    }

    public dispose(): void {
        this.output.dispose();
    }
}