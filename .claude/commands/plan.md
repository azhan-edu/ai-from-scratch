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
