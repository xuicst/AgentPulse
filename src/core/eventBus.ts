import { AgentEvent } from "./events";

export type EventListener = (event: AgentEvent) => void;

export class EventBus {
    private static instance: EventBus;
    private readonly listeners = new Set<EventListener>();
    private constructor() {}
    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    /**
     * 发布事件
     */
    public publish(event: AgentEvent): void {
        for (const listener of this.listeners) {
            try {
                listener(event);
            } catch (error) {
                console.error("Event listener error:", error);
            }
        }
    }

    /**
     * 订阅事件
     */
    public subscribe(listener: EventListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * 清空所有监听器（插件退出时调用）
     */
    public dispose(): void {
        this.listeners.clear();
    }

    /**
     * 当前监听器数量（调试用）
     */
    public getListenerCount(): number {
        return this.listeners.size;
    }
}