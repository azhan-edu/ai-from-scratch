Prepare general data
1) make genaral Agents: 
    .claude/commands/getAgents.md
2) skills for general agents
    .claude/commands/getSkillsForAgents.md

Project related data
3) prepare arch vision
 - .claude/commands/getArchVision.md (getArchVision-draft.md)
    --> .claude/results/getArchVision-resp.md
4) tech stack
  - .claude/commands/getShortTechStack-draft.md
    --> .claude/results/getShortTechStack-resp.md  
5) install agents and skills
    .claude/commands/installAgentsSkills.md
6) CLAUDE.md
 .claude/commands/addMainInstructions.md

<--
--
 i want you use Option D — A dedicated orchestrator agent
system should use him to manage each developmemt request
correct?
-->

<-- init-app
according to the descriptions: 
- @.claude/results/getArchVision-resp.md 
- @.claude/results/getShortTechStack-resp.md
 make a blank (hello world) application in the folder 'app'
 -->

 <-- very 1st feature
 here is the 1st feature definition: 
change the text on the main page to "Hello, this is a new text" and change its color to green
the feature should be implemented by @.claude/agents/orchestrator.md according to its ruls and instructions
 -->

N+1) update UI Agents Aaccording TO Design
.claude/commands/updateAgentsAaccordingDesign.md
<-- /runFeature 
There is a design handoff in the folder docs/design.
Update @CLAUDE.md and ui/ux related agents (ui-architect, style-reviever, component-builder, component-spec-writer) in the folder ./claude/agents use this folder as a source of rules, styles etc related to design
-->

<--
 /runFeature 
update app's current colorising according to this info
 -->

 <--
/runFeature
add e2e test for Home page
 -->

 <-- IMPROVE CI
 I want to improve my ci
I would want to add 
- linting before commit
- github actions CI
- Pre-push unit test hook
- bundle size + Lighthouse
- some quality and other gates
provide a list of ideas what we can do in this area on this project

push these ideas to docs/ideas folder
 
------------------------

i would also want to make a code review gate before commit
how to implement that?
push these ideas to docs/ideas folder

=================
base on the ideas in
@docs/ideas/ci-improvements.md 
implement 
- 1. Husky + lint-staged for pre-commit
- 2. Pre-commit TypeScript check (scoped)
- 3. Pre-push unit tests
- 4. Commit message linting with commitlint
==>
app/.husky/pre-commit	Runs lint-staged (biome on staged .ts/.tsx) + tsc --noEmit
app/.husky/pre-push	    Runs vitest run before every push
app/.husky/commit-msg	Runs commitlint against the commit message
app/commitlint.config.cjs	Conventional commits + scopes from CLAUDE.md
app/package.json	    Added prepare script + lint-staged config

 -->