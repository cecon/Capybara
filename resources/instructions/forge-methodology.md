# FORGE Methodology - Complete Workflow

## 🎯 **FORGE Core Rules**

### **Two Distinct Workflows:**

#### 🔨 **"Create New STEP" Workflow** 
When user says: *"vamos desenvolver uma nova atividade"*
1. **Interactive Questionnaire** to gather requirements
2. **Atomicity Analysis** with LLM confidence check
3. **Auto-create structure** only when confident
4. **Inherit errors** from previous STEP (respecting maxRules config)

#### 🚀 **"Start Development" Workflow**
When user says: *"vamos iniciar o desenvolvimento da STEP_XXXX"*
1. **Follow step-by-step execution**
2. **Read existing DESCRIPTION.md**
3. **Execute implementation workflow**

## 📁 **Standard Structure (4-digit format):**
```
steps/STEP_0001_[TASK_NAME]/
├── STEP_0001_DESCRIPTION.md
├── STEP_0001_DONE.md  
├── STEP_0001_DIFFICULTIES_FACED.md
└── artifacts/
```

## 🤖 **Smart STEP Creation Process**

### **Phase 1: Interactive Requirements Gathering**
When user requests new activity → Start questionnaire:
1. **Task Objective**: What exactly needs to be accomplished?
2. **Context Analysis**: What's the current state? Dependencies?
3. **Success Criteria**: How will we know it's complete?
4. **Technical Scope**: Specific technologies/approaches involved?
5. **Time Estimation**: Initial complexity assessment

### **Phase 2: LLM Confidence & Atomicity Analysis**
```
LLM Self-Assessment:
- Confidence Level: [1-10] (create only if ≥8)
- Atomicity Score: [ATOMIC/NEEDS_DECOMPOSITION] 
- Missing Information: [List gaps if confidence <8]
```

**If Confidence ≥8 → Proceed to Phase 3**
**If Confidence <8 → Request clarification on missing points**

### **Phase 3: Auto-Creation with Error Inheritance**
1. **Find latest STEP**: `STEP_XXXX_DIFFICULTIES_FACED.md`
2. **Extract rules** respecting `context.maxRules` from config
3. **Prioritize errors** by relevance to new task context
4. **Create new STEP_YYYY** with inherited prevention rules
5. **Populate templates** with questionnaire data

### **Error Volume Control**
- **Config location**: `src/models/forgeConfig.ts` → `context.maxRules` (default: 50)
- **Smart prioritization**: Task-relevant errors first
- **Summarization**: Group similar patterns
- **Example**: Instead of 5 separate SQLx rules → 1 "SQLx Configuration" rule

## ⚛️ **Atomicity Analysis - ALWAYS First**

Before implementing ANY task:
- **Atomic Task**: Can be completed in 1-3 hours with single, clear objective
- **Non-Atomic**: Needs decomposition into smaller sub-tasks

```
❌ BAD: "Implement complete authentication system"
✅ GOOD: "Create JWT middleware for token validation"
```

**If task is NOT atomic → STOP and decompose first**

## 🔄 **Task Decomposition Patterns**

**Authentication**: middleware → endpoints → database_integration → testing
**API Development**: schema_design → endpoints → validation → testing  
**Database**: schema → migrations → repositories → testing
**Setup**: dependencies → configuration → environment → validation

## 🤖 **Agent Response Patterns**

#### **Pattern A: Create New STEP** 
User: *"vamos desenvolver uma nova atividade"*

```
🎯 Iniciando criação de nova STEP...

📋 **Questionário de Requisitos:**
1. **Objetivo da tarefa**: [Aguardando resposta...]
2. **Estado atual**: [Aguardando resposta...]  
3. **Critérios de sucesso**: [Aguardando resposta...]
4. **Escopo técnico**: [Aguardando resposta...]
5. **Estimativa inicial**: [Aguardando resposta...]

⏳ Após suas respostas, farei análise de atomicidade e criarei a STEP automaticamente.
```

#### **Pattern B: Start Development**
User: *"vamos iniciar o desenvolvimento da STEP_0042"*

```
🚀 Iniciando desenvolvimento da STEP_0042...

📖 Lendo STEP_0041_DIFFICULTIES_FACED.md → Regras acumuladas...
🚨 Encontrados 15 regras (limitado a 50 por config):
  - DON'T use open SQLx versions
  - DON'T forget Windows .exe suffix
  - [...]

📊 Análise de Atomicidade da STEP_0042:
- Tarefa: "Setup database connection and migrations"  
- Estimativa: 2.5 horas (+30min para problemas conhecidos)
- Complexidade: 3/5
- Status: ✅ ATOMIC (prosseguindo)

🎯 Iniciando implementação...
```

## 🔄 **STEP Execution Flow**

```
1. Read previous STEP_XX_DIFFICULTIES_FACED.md → "Accumulated DON'Ts" section
2. Copy accumulated rules to new DESCRIPTION.md 
3. Read task description
4. ⚛️ Analyze atomicity (≤3h?)
5. If non-atomic → Decompose into sub-tasks
6. Check pre-flight checklist + accumulated prevention rules
7. Implement incrementally
8. Test after each change
9. Document completion in DONE.md
10. 🔄 CRITICAL: Update DIFFICULTIES_FACED.md with:
    - Copy all accumulated rules from DESCRIPTION.md
    - Add any NEW problems from this STEP
    - Create final "Accumulated DON'Ts for Next STEP" section
```

## 🚨 **Progressive Error Accumulation**

**STEP_01**: No previous errors → 1 new error → 1 total rule for STEP_02  
**STEP_02**: 1 inherited + 2 new = 3 total rules for STEP_03  
**STEP_03**: 3 inherited + 1 new = 4 total rules for STEP_04  

**Each STEP gets progressively smarter with minimal manual work**

## 🔄 **STEP Completion Propagation (CRITICAL)**

**When finishing ANY STEP, you MUST:**

1. **Copy** accumulated rules from `STEP_XX_DESCRIPTION.md` 
2. **Add** any NEW "DON'T DO" rules from current STEP problems
3. **Update** `STEP_XX_DIFFICULTIES_FACED.md` → "Accumulated DON'Ts for Next STEP" section
4. **Result**: Next STEP will inherit ALL previous lessons in one place

## 🚨 **CRITICAL: If You Encounter Problems**

1. **STOP** - Don't push through errors
2. **DOCUMENT** - Record the exact problem in DIFFICULTIES_FACED.md
3. **PATTERN** - Identify if it's a known issue type
4. **SOLVE** - Fix methodically, not randomly
5. **PREVENT** - Create simple "DON'T DO" rule
6. **🔄 PROPAGATE** - At STEP completion: inherit + add new rules

**🎯 Key Benefit**: Next STEP inherits complete knowledge with zero manual effort!
