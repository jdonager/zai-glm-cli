/**
 * Load custom instructions from project files.
 * Checks for AGENTS.md and ZAI.md in both root and .zai directory.
 * All found files are concatenated to provide full context.
 */
export declare function loadCustomInstructions(workingDirectory?: string): string | null;
