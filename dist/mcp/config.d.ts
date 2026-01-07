import { MCPServerConfig } from "./client.js";
export interface MCPConfig {
    servers: MCPServerConfig[];
}
/**
 * Load MCP configuration from project settings
 * Automatically includes Z.ai MCP servers (Zread, Web Search) when ZAI_API_KEY is set
 */
export declare function loadMCPConfig(): MCPConfig;
export declare function saveMCPConfig(config: MCPConfig): void;
export declare function addMCPServer(config: MCPServerConfig): void;
export declare function removeMCPServer(serverName: string): void;
export declare function getMCPServer(serverName: string): MCPServerConfig | undefined;
export declare const PREDEFINED_SERVERS: Record<string, MCPServerConfig>;
/**
 * Get list of Z.ai built-in MCP server names
 */
export declare function getZaiBuiltInServerNames(): string[];
/**
 * Check if Z.ai MCP servers are available (ZAI_API_KEY is set)
 */
export declare function isZaiMCPAvailable(): boolean;
