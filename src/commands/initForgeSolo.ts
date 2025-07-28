import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs-extra';
import { FileManager } from '../utils/fileManager';
import { ForgeConfig, DEFAULT_FORGE_CONFIG } from '../models/forgeConfig';

export class InitForgeSoloCommand {
    constructor(
        private fileManager: FileManager
    ) {}

    async execute(): Promise<boolean> {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('Nenhum workspace aberto.');
                return false;
            }

            const forgeDir = path.join(workspaceFolder.uri.fsPath, '.forge');
            const githubDir = path.join(workspaceFolder.uri.fsPath, '.github');

            // Verificar se já existe
            if (await fs.pathExists(forgeDir)) {
                const overwrite = await vscode.window.showWarningMessage(
                    'FORGE já foi inicializado. Sobrescrever configurações?',
                    'Sim', 'Não'
                );
                if (overwrite !== 'Sim') {
                    return false;
                }
            }

            // Criar estrutura básica
            await fs.ensureDir(forgeDir);
            await fs.ensureDir(githubDir);
            await fs.ensureDir(path.join(forgeDir, 'history'));

            // Coletar informações do projeto
            const projectInfo = await this.collectProjectInfo();
            if (!projectInfo) {
                return false;
            }

            // Criar configuração otimizada para solo dev
            const config: ForgeConfig = {
                ...DEFAULT_FORGE_CONFIG,
                project: projectInfo,
                createdAt: new Date(),
                lastUpdated: new Date()
            } as ForgeConfig;

            // Salvar arquivos
            await this.createConfigFile(forgeDir, config);
            await this.createPrivateCopilotInstructions(githubDir, config);
            await this.createPreventionRulesFile(forgeDir);
            await this.createEmptyCurrentActivity(forgeDir);
            await this.updateGitignore(workspaceFolder.uri.fsPath);

            vscode.window.showInformationMessage(
                '🔨 FORGE Solo inicializado! Instruções privadas criadas em .github/ (adicionado ao .gitignore)'
            );

            // Abrir arquivo de instruções para o usuário revisar
            const instructionsPath = path.join(githubDir, 'copilot-instructions.md');
            const doc = await vscode.workspace.openTextDocument(instructionsPath);
            await vscode.window.showTextDocument(doc);

            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Erro ao inicializar FORGE Solo: ${error}`);
            return false;
        }
    }

    private async collectProjectInfo(): Promise<any> {
        const name = await vscode.window.showInputBox({
            prompt: 'Nome do projeto:',
            placeHolder: 'meu-projeto-awesome'
        });

        if (!name) return null;

        const language = await vscode.window.showQuickPick([
            'typescript', 'javascript', 'python', 'java', 'rust', 'go', 'csharp'
        ], {
            title: 'Linguagem principal:',
            canPickMany: false
        });

        if (!language) return null;

        const framework = await vscode.window.showInputBox({
            prompt: 'Framework/biblioteca principal (opcional):',
            placeHolder: 'react, express, fastapi, spring...'
        });

        const currentPhase = await vscode.window.showQuickPick([
            'setup', 'mvp', 'feature-development', 'optimization', 'maintenance'
        ], {
            title: 'Fase atual do projeto:',
            canPickMany: false
        });

        const architectureNotes = await vscode.window.showInputBox({
            prompt: 'Notas de arquitetura (1 linha - visão macro):',
            placeHolder: 'API REST com auth JWT + banco PostgreSQL'
        });

        return {
            name,
            language: [language],
            framework: framework ? framework.split(',').map(f => f.trim()) : [],
            currentPhase: currentPhase || 'setup',
            architectureNotes: architectureNotes || 'Arquitetura em definição'
        };
    }

    private async createConfigFile(forgeDir: string, config: ForgeConfig): Promise<void> {
        const configPath = path.join(forgeDir, 'config.json');
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    }

    private async createPrivateCopilotInstructions(githubDir: string, config: ForgeConfig): Promise<void> {
        const instructionsPath = path.join(githubDir, 'copilot-instructions.md');
        
        const template = `# GitHub Copilot Instructions - ${config.project.name}

## 🎯 **Projeto Overview**
**Linguagem**: ${config.project.language.join(', ')}
**Framework**: ${config.project.framework.join(', ')}
**Fase Atual**: ${config.project.currentPhase}
**Arquitetura**: ${config.project.architectureNotes}

## 🔨 **Workflow de Atividade Única**

### **Quando criar nova atividade:**
1. **Analisar contexto**: Verificar estrutura do projeto e dependências
2. **Perguntas de clarificação**: 3-5 perguntas específicas antes de implementar
3. **Atividade única**: Apenas uma atividade ativa por vez em \`current-activity.md\`
4. **Prevention rules**: Aplicar lições do arquivo \`prevention-rules.md\`

### **Durante desenvolvimento:**
- **Foco total**: Uma atividade por vez, escopo ≤2 horas
- **Documentar problemas**: Apenas em \`## ⚠️ Dificuldades Encontradas\`
- **Conectar ao macro**: Cada atividade liga aos objetivos gerais

### **Ao completar:**
- **Extrair lições**: Converter dificuldades em prevention rules
- **Mover para histórico**: \`current-activity.md\` → \`history/TIMESTAMP-slug.md\`
- **Limpar contexto**: Preparar para próxima atividade

## 🚨 **Prevention Rules Ativas**
{PREVENTION_RULES_PLACEHOLDER}

## 📊 **Estado Atual**
- **Atividade Atual**: {CURRENT_ACTIVITY}
- **Próximos objetivos**: {NEXT_OBJECTIVES}

## 🎯 **Comandos Reconhecidos**
- \`"FORGE: Start Activity [nome]"\` → Inicia nova atividade com perguntas
- \`"FORGE: Complete Activity"\` → Finaliza atividade atual
- \`"FORGE: View History"\` → Lista atividades anteriores

---
**Princípio**: Uma atividade de cada vez, com clarificação prévia e aprendizado contínuo.`;

        await fs.writeFile(instructionsPath, template);
    }

    private async createPreventionRulesFile(forgeDir: string): Promise<void> {
        const rulesPath = path.join(forgeDir, 'prevention-rules.md');
        const content = `# Prevention Rules - ${new Date().toLocaleDateString()}

## 📚 **Como usar**
Este arquivo acumula lições aprendidas. Máximo 15 regras para manter foco.

## 🚨 **Regras Ativas**

### **[TEMPLATE] Título da Regra**
**Contexto**: Quando/onde o problema ocorre
**Problema**: O que deu errado
**Solução**: Como fazer corretamente
**Tag**: #typescript #vscode (para filtrar relevância)

---

*Adicione suas primeiras regras conforme encontrar problemas reais.*`;

        await fs.writeFile(rulesPath, content);
    }

    private async updateGitignore(workspacePath: string): Promise<void> {
        const gitignorePath = path.join(workspacePath, '.gitignore');
        
        let content = '';
        if (await fs.pathExists(gitignorePath)) {
            content = await fs.readFile(gitignorePath, 'utf8');
        }

        const forgeIgnores = `
# FORGE Framework (Solo Development - Private)
.forge/
.github/copilot-instructions.md
.github/stack-instructions.md
*.forge.lock
.forge-context/`;

        if (!content.includes('.forge/')) {
            content += forgeIgnores;
            await fs.writeFile(gitignorePath, content);
        }
    }

    private async createEmptyCurrentActivity(forgeDir: string): Promise<void> {
        const currentActivityPath = path.join(forgeDir, 'current-activity.md');
        const emptyContent = `# Atividade: [Vazio]

> Nenhuma atividade em andamento.
> Use **FORGE: Start Activity** para iniciar uma nova atividade.

---
*Aguardando nova atividade...*
`;

        await fs.writeFile(currentActivityPath, emptyContent);
    }
}
