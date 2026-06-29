import { Logger } from "../core/logger";
import { IDetector } from "../types";

export class MockDetector implements IDetector {
    public readonly id = "mock";
    public readonly displayName = "Mock Detector";
    private readonly logger = Logger.getInstance();

    public async activate(): Promise<void> {
        this.logger.info("MockDetector activated.");
    }

    public async deactivate(): Promise<void> {
        this.logger.info("MockDetector deactivated.");
    }
}