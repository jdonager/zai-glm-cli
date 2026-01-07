import { getSettingsManager } from "../utils/settings-manager.js";
/**
 * Get Z.ai built-in MCP servers that are auto-configured when ZAI_API_KEY is set
 */
function getZaiBuiltInServers() {
    const apiKey = process.env.ZAI_API_KEY;
    if (!apiKey) {
        return [];
    }
    return [
        {
            name: "zai-zread",
            transport: {
                type: "sse",
                url: `https://api.z.ai/api/mcp/zread/sse?Authorization=${apiKey}`,
            },
        },
        {
            name: "zai-web-search",
            transport: {
                type: "sse",
                url: `https://api.z.ai/api/mcp/web_search/sse?Authorization=${apiKey}`,
            },
        },
    ];
}
/**
 * Load MCP configuration from project settings
 * Automatically includes Z.ai MCP servers (Zread, Web Search) when ZAI_API_KEY is set
 */
export function loadMCPConfig() {
    const manager = getSettingsManager();
    const projectSettings = manager.loadProjectSettings();
    const userServers = projectSettings.mcpServers ? Object.values(projectSettings.mcpServers) : [];
    // Get Z.ai built-in servers
    const zaiServers = getZaiBuiltInServers();
    // Filter out Z.ai servers if user has manually configured them (to avoid duplicates)
    const userServerNames = new Set(userServers.map(s => s.name));
    const filteredZaiServers = zaiServers.filter(s => !userServerNames.has(s.name));
    // Combine: user servers first, then Z.ai built-in servers
    const servers = [...userServers, ...filteredZaiServers];
    return { servers };
}
export function saveMCPConfig(config) {
    const manager = getSettingsManager();
    const mcpServers = {};
    // Convert servers array to object keyed by name
    for (const server of config.servers) {
        mcpServers[server.name] = server;
    }
    manager.updateProjectSetting('mcpServers', mcpServers);
}
export function addMCPServer(config) {
    const manager = getSettingsManager();
    const projectSettings = manager.loadProjectSettings();
    const mcpServers = projectSettings.mcpServers || {};
    mcpServers[config.name] = config;
    manager.updateProjectSetting('mcpServers', mcpServers);
}
export function removeMCPServer(serverName) {
    const manager = getSettingsManager();
    const projectSettings = manager.loadProjectSettings();
    const mcpServers = projectSettings.mcpServers;
    if (mcpServers) {
        delete mcpServers[serverName];
        manager.updateProjectSetting('mcpServers', mcpServers);
    }
}
export function getMCPServer(serverName) {
    const manager = getSettingsManager();
    const projectSettings = manager.loadProjectSettings();
    return projectSettings.mcpServers?.[serverName];
}
// Predefined server configurations
export const PREDEFINED_SERVERS = {};
/**
 * Get list of Z.ai built-in MCP server names
 */
export function getZaiBuiltInServerNames() {
    return ["zai-zread", "zai-web-search"];
}
/**
 * Check if Z.ai MCP servers are available (ZAI_API_KEY is set)
 */
export function isZaiMCPAvailable() {
    return !!process.env.ZAI_API_KEY;
}
//# sourceMappingURL=config.js.map