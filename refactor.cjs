const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const dir = path.join(__dirname, 'src/app/admin');
const pagePath = path.join(dir, 'page.tsx');
let code = fs.readFileSync(pagePath, 'utf8');

const sourceFile = ts.createSourceFile('page.tsx', code, ts.ScriptTarget.Latest, true);

const components = [
  'DashboardTab', 'RidesTab', 'CreateStoryModal', 'StoriesTab', 
  'PublishedTab', 'FeaturedTab', 'RoutesTab', 'UsersTab'
];

let extracted = {};
let toRemove = [];

// Find the functions
ts.forEachChild(sourceFile, node => {
  if (ts.isFunctionDeclaration(node) && node.name) {
    const name = node.name.text;
    if (components.includes(name)) {
      // Need to add export to the function
      let funcCode = code.substring(node.pos, node.end).trim();
      if (!funcCode.startsWith('export')) {
        funcCode = funcCode.replace(/^function/, 'export function');
      }
      extracted[name] = funcCode;
      toRemove.push({ pos: node.pos, end: node.end });
    }
  }
});

// Sort backwards for safe deletion
toRemove.sort((a, b) => b.pos - a.pos);

let newCode = code;
for (const {pos, end} of toRemove) {
  newCode = newCode.substring(0, pos) + newCode.substring(end);
}

// Get imports block
const importsMatch = newCode.match(/^[\s\S]*?\/\/ ─── Types ────────────────────────────────────────────────────────────────────/);
const commonImports = importsMatch ? importsMatch[0].replace(/\/\/ ─── Types.*/, '').trim() : '';

// Get Types block
const typesMatch = newCode.match(/\/\/ ─── Types ───[\s\S]*?(?=\/\/ ─── Mock Data)/);
if (typesMatch) {
  let typesCode = typesMatch[0].replace(/\/\/ ─── Types.*?\n/, '').trim();
  // Export types
  typesCode = typesCode.replace(/^(interface|type)\s/gm, 'export $1 ');
  fs.writeFileSync(path.join(dir, 'types.ts'), typesCode);
  console.log('Created types.ts');
  
  // Replace types in page.tsx with import
  newCode = newCode.replace(typesMatch[0], `// ─── Types ────────────────────────────────────────────────────────────────────\nimport { SkillLevel, RideStatus, StoryStatus, UserRole, FeaturedSlot, Organizer, Ride, Story, AppUser, Metrics, Activity, TabId } from "./types";\n`);
} else {
  console.log('Types block not found');
}

// Prepare file template
const baseImports = commonImports + '\nimport { SkillLevel, RideStatus, StoryStatus, UserRole, FeaturedSlot, Organizer, Ride, Story, AppUser, Metrics, Activity, TabId } from "./types";\nimport { SkillBadge, SubTabs } from "./page";\n';

const writeComp = (name, compCode) => {
  if (!compCode) return;
  const filePath = path.join(dir, `${name}.tsx`);
  fs.writeFileSync(filePath, baseImports + '\n' + compCode + '\n');
  console.log(`Created ${name}.tsx`);
};

writeComp('DashboardTab', extracted.DashboardTab);
writeComp('RidesTab', extracted.RidesTab);
writeComp('StoriesTab', (extracted.CreateStoryModal ? extracted.CreateStoryModal + '\n\n' : '') + (extracted.StoriesTab || ''));
writeComp('PublishedTab', extracted.PublishedTab);
writeComp('FeaturedTab', extracted.FeaturedTab);
writeComp('RoutesTab', extracted.RoutesTab);
writeComp('UsersTab', extracted.UsersTab);

// Export SkillBadge and SubTabs
newCode = newCode.replace(/^function SkillBadge/m, 'export function SkillBadge');
newCode = newCode.replace(/^function SubTabs/m, 'export function SubTabs');

// Add imports for components to page.tsx
const compImports = `
import { DashboardTab } from "./DashboardTab";
import { RidesTab } from "./RidesTab";
import { StoriesTab } from "./StoriesTab";
import { PublishedTab } from "./PublishedTab";
import { FeaturedTab } from "./FeaturedTab";
import { RoutesTab } from "./RoutesTab";
import { UsersTab } from "./UsersTab";
`;
newCode = newCode.replace(/^import \{ cn \} from "@\/lib\/utils";/m, 'import { cn } from "@/lib/utils";\n' + compImports);

// Clean up any remaining multiple empty lines left by removal
newCode = newCode.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(pagePath, newCode);
console.log('Updated page.tsx');
