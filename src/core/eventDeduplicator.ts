import { AgentEvent } from "./events";

export class EventDeduplicator {
    private readonly cache = new Map<string, number>();

    public shouldPublish(event: AgentEvent): boolean {
        const key = [
            event.agent,
            event.sessionId ?? "",
            event.type,
            event.toolName ?? ""
        ].join("|");

        const now = Date.now();
        const last = this.cache.get(key);

        if (last && now - last < 3000) {
            return false;
        }

        this.cache.set(key, now);

        // 清理过期
        for (const [k, t] of this.cache) {
            if (now - t > 10000) {
                this.cache.delete(k);
            }
        }

        return true;
    }

    public clear(): void {
        this.cache.clear();
    }
}