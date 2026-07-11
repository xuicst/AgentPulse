import { AgentState } from "./agentState";

export interface AgentSession {
    /**
     * Agent 类型
     * 例如：
     *  - claude
     *  - codex
     */
    agent: string;

    /**
     * 当前 Session ID
     */
    sessionId?: string;

    /**
     * 当前工作目录
     */
    cwd?: string;

    /**
     * 使用模型
     */
    model?: string;

    /**
     * 当前状态
     */
    state: AgentState;

    /**
     * 当前工具
     */
    toolName?: string;

    /**
     * 当前事件时间
     */
    updatedAt: number;

    /**
     * Session 开始时间
     */
    startedAt?: number;

    /**
     * Session 结束时间
     */
    finishedAt?: number;

    /**
     * Detector 原始数据
     */
    payload?: unknown;
}