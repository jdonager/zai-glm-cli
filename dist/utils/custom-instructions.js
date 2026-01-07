import * as fs from 'fs';
import * as path from 'path';
/**
 * Files to check for custom instructions, in order of priority.
 * All found files will be concatenated together.
 */
const INSTRUCTION_FILES = [
    'AGENTS.md', // Root-level agents file (like Claude Code's CLAUDE.md)
    'ZAI.md', // Root-level ZAI file
    '.zai/ZAI.md', // Hidden directory ZAI file
    '.zai/AGENTS.md', // Hidden directory agents file
];
/**
 * Load custom instructions from project files.
 * Checks for AGENTS.md and ZAI.md in both root and .zai directory.
 * All found files are concatenated to provide full context.
 */
export function loadCustomInstructions(workingDirectory = process.cwd()) {
    const instructions = [];
    for (const file of INSTRUCTION_FILES) {
        try {
            const filePath = path.join(workingDirectory, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8').trim();
                if (content) {
                    instructions.push(`<!-- From ${file} -->\n${content}`);
                }
            }
        }
        catch (error) {
            // Silently skip files that can't be read
        }
    }
    if (instructions.length === 0) {
        return null;
    }
    return instructions.join('\n\n');
}
//# sourceMappingURL=custom-instructions.js.map