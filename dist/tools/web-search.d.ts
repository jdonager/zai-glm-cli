/**
 * Z.ai Web Search Tool
 * Provides web search capabilities using Z.ai's Web Search API
 */
import { ToolResult } from "../types/index.js";
export interface WebSearchResult {
    title: string;
    content: string;
    link: string;
    media: string;
    publish_date?: string;
    icon?: string;
    refer?: string;
}
export interface WebSearchResponse {
    created: number;
    id: string;
    request_id: string;
    search_result: WebSearchResult[];
}
export interface WebSearchOptions {
    search_engine?: "search-prime" | "search-std";
    count?: number;
    search_domain_filter?: string;
    search_recency_filter?: "day" | "week" | "month" | "year" | "noLimit";
    content_size?: "low" | "medium" | "high";
}
export declare class WebSearchTool {
    private apiKey;
    private baseURL;
    constructor(apiKey?: string, baseURL?: string);
    /**
     * Perform a web search using Z.ai's Web Search API
     */
    search(query: string, options?: WebSearchOptions): Promise<ToolResult>;
    /**
     * Format search results for display
     */
    private formatSearchResults;
}
/**
 * Get the web search tool definition for the agent
 */
export declare function getWebSearchToolDefinition(): {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: "object";
            properties: {
                query: {
                    type: string;
                    description: string;
                };
                count: {
                    type: string;
                    description: string;
                };
                search_domain_filter: {
                    type: string;
                    description: string;
                };
                search_recency_filter: {
                    type: string;
                    enum: string[];
                    description: string;
                };
            };
            required: string[];
        };
    };
};
