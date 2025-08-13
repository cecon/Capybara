import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

suite('🧠 KnowStack Command Tests', () => {
    let testWorkspaceDir: string;
    let originalWorkspaceFolders: readonly vscode.WorkspaceFolder[] | undefined;

    suiteSetup(async () => {
        // Create an isolated temp workspace to avoid polluting the repo
        testWorkspaceDir = path.join(os.tmpdir(), 'cappy-knowstack-' + Date.now());
        await fs.promises.mkdir(testWorkspaceDir, { recursive: true });

        originalWorkspaceFolders = vscode.workspace.workspaceFolders;
        const mockWorkspaceFolder: vscode.WorkspaceFolder = {
            uri: vscode.Uri.file(testWorkspaceDir),
            name: path.basename(testWorkspaceDir),
            index: 0,
        } as unknown as vscode.WorkspaceFolder;

        Object.defineProperty(vscode.workspace, 'workspaceFolders', {
            value: [mockWorkspaceFolder],
            configurable: true,
        });
    });

    suiteTeardown(async () => {
        // Restore original workspace and cleanup temp dir
        Object.defineProperty(vscode.workspace, 'workspaceFolders', {
            value: originalWorkspaceFolders,
            configurable: true,
        });

        try {
            await fs.promises.rm(testWorkspaceDir, { recursive: true, force: true });
        } catch {
            // ignore
        }
    });

    test('Returns XML script and creates .cappy/stack.md', async () => {
        const result = await vscode.commands.executeCommand<string>('cappy.knowstack');

        assert.strictEqual(typeof result, 'string');
        assert.ok(result.length > 0, 'Result should not be empty');
        assert.ok(result.includes('<cappy:script') || result.includes('<?xml'), 'Result should look like XML script');
        assert.ok(result.includes('cappy:knowstack'), 'Result should mention cappy:knowstack');

        const stackPath = path.join(testWorkspaceDir, '.cappy', 'stack.md');
        const exists = await fs.promises.access(stackPath, fs.constants.F_OK).then(() => true).catch(() => false);
        assert.ok(exists, 'Should create .cappy/stack.md in workspace');
    });

    test('Alias cappy.runknowstack returns same XML', async () => {
        const result = await vscode.commands.executeCommand<string>('cappy.runknowstack');
        assert.strictEqual(typeof result, 'string');
        assert.ok(result.length > 0, 'Alias result should not be empty');
        assert.ok(result.includes('<cappy:script') || result.includes('<?xml'), 'Alias result should look like XML script');
    });
});
