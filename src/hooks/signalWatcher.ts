import * as fs from "fs";
import * as path from "path";
import { Logger } from "../core/logger";

export class SignalWatcher {
    private readonly logger = Logger.getInstance();
    private watcher?: fs.FSWatcher;

    constructor(
        private readonly filePath: string,
        private readonly onChanged: () => void
    ) {}

public start(): void {
    if (this.watcher) {
        return;
    }

    if (!fs.existsSync(this.filePath)) {
        this.logger.warn(
            `Signal file does not exist: ${this.filePath}`
        );
        return;
    }

    this.logger.info(`Watching signal: ${this.filePath}`);

    const dir = path.dirname(this.filePath);
    const filename = path.basename(this.filePath);

    this.watcher = fs.watch(dir, (eventType, changedFile) => {
        if (changedFile === filename) {
            this.onChanged();
        }
    });
}

    public stop(): void {
        this.watcher?.close();
        this.watcher = undefined;
        this.logger.info("Signal watcher stopped.");
    }
}