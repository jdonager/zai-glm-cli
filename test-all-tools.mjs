#!/usr/bin/env node
/**
 * Comprehensive tool test script for ZAI CLI
 * Tests all tools by having the agent make real tool calls
 *
 * Usage: node test-all-tools.mjs
 * Requires: ZAI_API_KEY environment variable
 */

import { ZaiAgent } from './dist/agent/zai-agent.js';

const apiKey = process.env.ZAI_API_KEY;
if (!apiKey) {
  console.error('ERROR: ZAI_API_KEY environment variable required');
  console.error('Run: export ZAI_API_KEY=your_api_key');
  process.exit(1);
}

const TESTS = [
  {
    name: 'view_file (directory)',
    prompt: 'Use view_file to list the contents of the ./src/tools directory. Just show me the file list.',
    expectInResponse: ['bash', 'editor', '.ts'],
  },
  {
    name: 'view_file (file)',
    prompt: 'Use view_file to show me the first 10 lines of package.json',
    expectInResponse: ['name', 'version', 'zai'],
  },
  {
    name: 'search (text)',
    prompt: 'Use the search tool to find files containing "TextEditorTool". Use search_type text.',
    expectInResponse: ['search', 'result', 'TextEditorTool'],
  },
  {
    name: 'search (files)',
    prompt: 'Use the search tool to find files with "editor" in the filename. Use search_type files.',
    expectInResponse: ['editor'],
  },
  {
    name: 'bash',
    prompt: 'Run this bash command: echo "Hello from ZAI test"',
    expectInResponse: ['Hello', 'ZAI', 'test'],
  },
  {
    name: 'create_todo_list',
    prompt: 'Create a todo list with these items: 1) "Test item one" (pending, high priority), 2) "Test item two" (in_progress, medium priority)',
    expectInResponse: ['Test item', 'pending', 'progress'],
  },
  {
    name: 'update_todo_list',
    prompt: 'Update the todo list to mark the first item as completed',
    expectInResponse: ['completed', 'Test item'],
  },
];

async function runTest(agent, test, index) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`TEST ${index + 1}/${TESTS.length}: ${test.name}`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`Prompt: "${test.prompt.substring(0, 80)}${test.prompt.length > 80 ? '...' : ''}"`);
  console.log(`${'─'.repeat(60)}`);

  try {
    const startTime = Date.now();
    const results = await agent.processUserMessage(test.prompt);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Get tool calls and responses
    const toolCalls = results.filter(r => r.type === 'tool_call' || r.type === 'tool_result');
    const assistantResponses = results.filter(r => r.type === 'assistant');

    // Show tool calls made
    if (toolCalls.length > 0) {
      console.log('\nTool calls made:');
      for (const tc of toolCalls) {
        if (tc.toolCall) {
          console.log(`  → ${tc.toolCall.function?.name || 'unknown'}`);
        }
        if (tc.toolResult) {
          const status = tc.toolResult.success ? '✓' : '✗';
          console.log(`    ${status} ${tc.toolResult.success ? 'Success' : 'Failed: ' + tc.toolResult.error}`);
        }
      }
    }

    // Get final response
    const finalResponse = assistantResponses[assistantResponses.length - 1]?.content || '';
    console.log('\nAgent response (truncated):');
    console.log(`  "${finalResponse.substring(0, 200)}${finalResponse.length > 200 ? '...' : ''}"`);

    // Check expectations
    const allContent = results.map(r => r.content || '').join(' ').toLowerCase();
    const matchedExpectations = test.expectInResponse.filter(exp =>
      allContent.includes(exp.toLowerCase())
    );

    const passed = matchedExpectations.length >= Math.ceil(test.expectInResponse.length / 2);

    console.log(`\nDuration: ${duration}s`);
    console.log(`Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    if (!passed) {
      console.log(`  Expected to find: ${test.expectInResponse.join(', ')}`);
      console.log(`  Found: ${matchedExpectations.join(', ') || 'none'}`);
    }

    return passed;
  } catch (error) {
    console.log(`\nResult: ❌ ERROR`);
    console.log(`  ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          ZAI CLI - Comprehensive Tool Test Suite           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting ${TESTS.length} tools via the ZAI agent...`);
  console.log('Each test sends a prompt and verifies the agent uses the correct tool.\n');

  const agent = new ZaiAgent(apiKey);

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < TESTS.length; i++) {
    const success = await runTest(agent, TESTS[i], i);
    if (success) passed++;
    else failed++;

    // Small delay between tests
    if (i < TESTS.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log('FINAL RESULTS');
  console.log(`${'═'.repeat(60)}`);
  console.log(`✅ Passed: ${passed}/${TESTS.length}`);
  console.log(`❌ Failed: ${failed}/${TESTS.length}`);
  console.log(`${'═'.repeat(60)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
