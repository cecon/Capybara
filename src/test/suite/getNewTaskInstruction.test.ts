import * as assert from 'assert';
import * as vscode from 'vscode';

suite('🧩 GetNewTaskInstruction Command Tests', () => {
    test('Returns processed instruction from canonical command', async () => {
        const result = await vscode.commands.executeCommand<string>('cappy.getNewTaskInstruction');
        assert.strictEqual(typeof result, 'string');
        assert.ok(result.length > 0, 'Result should not be empty');
        assert.ok(result.includes('Cappy'), 'Result should include Cappy branding');
    });

    test('Alias cappy.getNewTaskInstruction works', async () => {
        const result = await vscode.commands.executeCommand<string>('cappy.getNewTaskInstruction', { projectName: 'AliasTest' });
        assert.strictEqual(typeof result, 'string');
        assert.ok(result.includes('AliasTest') || result.length > 0, 'Result should include overrides or not be empty');
    });

    test('Alias cappy-get-new-task-istruction works', async () => {
        const result = await vscode.commands.executeCommand<string>('cappy-get-new-task-istruction', { frameworks: 'react' });
        assert.strictEqual(typeof result, 'string');
        assert.ok(result.includes('react') || result.length > 0, 'Result should include overrides or not be empty');
    });
});
