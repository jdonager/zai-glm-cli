/**
 * Z.ai Web Search Tool
 * Provides web search capabilities using Z.ai's Web Search API
 */
export class WebSearchTool {
    apiKey;
    baseURL;
    constructor(apiKey, baseURL) {
        this.apiKey = apiKey || process.env.ZAI_API_KEY || "";
        this.baseURL = baseURL || process.env.ZAI_BASE_URL || "https://api.z.ai";
        if (!this.apiKey) {
            console.warn("ZAI_API_KEY not found. Web search functionality will be limited.");
        }
    }
    /**
     * Perform a web search using Z.ai's Web Search API
     */
    async search(query, options = {}) {
        if (!this.apiKey) {
            return {
                success: false,
                error: "ZAI_API_KEY is required for web search. Set it in your environment.",
            };
        }
        try {
            const { search_engine = "search-prime", count = 10, search_domain_filter, search_recency_filter = "noLimit", content_size = "medium", } = options;
            // Build request body
            const requestBody = {
                search_engine,
                search_query: query,
                count: Math.min(Math.max(count, 1), 50), // Clamp to 1-50
                search_recency_filter,
                content_size,
            };
            if (search_domain_filter) {
                requestBody.search_domain_filter = search_domain_filter;
            }
            // Call Z.ai Web Search API
            const response = await fetch(`${this.baseURL}/api/tools/web_search`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                const errorText = await response.text();
                return {
                    success: false,
                    error: `Web search failed (${response.status}): ${errorText}`,
                };
            }
            const data = (await response.json());
            if (!data.search_result || data.search_result.length === 0) {
                return {
                    success: true,
                    output: `No results found for "${query}"`,
                };
            }
            // Format results for the agent
            const formattedResults = this.formatSearchResults(data.search_result, query);
            return {
                success: true,
                output: formattedResults,
                data: {
                    results: data.search_result,
                    count: data.search_result.length,
                    request_id: data.request_id,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Web search error: ${error.message}`,
            };
        }
    }
    /**
     * Format search results for display
     */
    formatSearchResults(results, query) {
        let output = `Web search results for "${query}":\n\n`;
        results.forEach((result, index) => {
            output += `[${index + 1}] ${result.title}\n`;
            output += `    Source: ${result.media}${result.publish_date ? ` (${result.publish_date})` : ""}\n`;
            output += `    URL: ${result.link}\n`;
            // Truncate content for display
            const maxContentLength = 300;
            const content = result.content.length > maxContentLength
                ? result.content.substring(0, maxContentLength) + "..."
                : result.content;
            output += `    Summary: ${content}\n\n`;
        });
        return output.trim();
    }
}
/**
 * Get the web search tool definition for the agent
 */
export function getWebSearchToolDefinition() {
    return {
        type: "function",
        function: {
            name: "web_search",
            description: `Search the web for real-time information using Z.ai's Web Search API.

USE WHEN:
- You need current/real-time information not in your training data
- User asks about recent events, news, or updates
- You need to verify facts or find sources
- Research is needed on topics that may have changed

PARAMETERS:
- query: The search query (required)
- count: Number of results (1-50, default 10)
- search_domain_filter: Limit search to specific domain (optional)
- search_recency_filter: Time range - "day", "week", "month", "year", "noLimit" (default)

RETURNS:
- List of search results with title, source, URL, publish date, and summary
- Each result includes a reference number for citation`,
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The search query to find information on the web",
                    },
                    count: {
                        type: "number",
                        description: "Number of results to return (1-50, default 10)",
                    },
                    search_domain_filter: {
                        type: "string",
                        description: "Limit search to a specific domain (e.g., 'github.com')",
                    },
                    search_recency_filter: {
                        type: "string",
                        enum: ["day", "week", "month", "year", "noLimit"],
                        description: "Filter results by time range",
                    },
                },
                required: ["query"],
            },
        },
    };
}
//# sourceMappingURL=web-search.js.map