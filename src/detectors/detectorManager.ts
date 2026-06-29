import { Logger } from "../core/logger";
import { IDetector } from "../types";

export class DetectorManager {
    private readonly logger = Logger.getInstance();
    private readonly detectors = new Map<string, IDetector>();

    /**
     * 注册 Detector
     */
    public register(detector: IDetector): void {
        if (this.detectors.has(detector.id)) {
            throw new Error(
                `Detector '${detector.id}' has already been registered.`
            );
        }
        this.detectors.set(detector.id, detector);
        this.logger.info(
            `Detector registered: ${detector.displayName}`
        );
    }

    /**
     * 启动全部 Detector
     */
    public async activateAll(): Promise<void> {
        for (const detector of this.detectors.values()) {
            this.logger.info(
                `Activating detector: ${detector.displayName}`
            );
            await detector.activate();
        }
    }

    /**
     * 停止全部 Detector
     */
    public async deactivateAll(): Promise<void> {
        for (const detector of this.detectors.values()) {
            this.logger.info(
                `Deactivating detector: ${detector.displayName}`
            );
            await detector.deactivate();
        }
    }

    /**
     * 获取指定 Detector
     */
    public get(id: string): IDetector | undefined {
        return this.detectors.get(id);
    }

    /**
     * 获取所有 Detector
     */
    public getAll(): readonly IDetector[] {
        return [...this.detectors.values()];
    }

    /**
     * 是否存在 Detector
     */
    public has(id: string): boolean {
        return this.detectors.has(id);
    }

    /**
     * Detector 数量
     */
    public count(): number {
        return this.detectors.size;
    }
}