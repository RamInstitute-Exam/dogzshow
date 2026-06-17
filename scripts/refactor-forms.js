const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('page.tsx') || fullPath.endsWith('Client.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // 1. Remove the 3-column split if it exists
            content = content.replace(/<div className="grid grid-cols-1 lg:grid-cols-3 gap-[0-9]+">\s*\{\/\* Main Info Blocks \*\/\}\s*<div className="lg:col-span-2 space-y-[0-9]+">/, '{/* Main Info Blocks */}');
            content = content.replace(/<div className="grid grid-cols-1 lg:grid-cols-3 gap-[0-9]+">\s*<div className="lg:col-span-2 space-y-[0-9]+">/, '');
            
            // Note: The closing divs for these will be tricky via simple regex.
            // A simpler regex for the starting tags:
            // Let's manually replace the common wrapper blocks.
            content = content.replace(/<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">\s*\{\/\* Main Info Blocks \*\/\}\s*<div className="lg:col-span-2 space-y-8">/g, '{/* Main Info Blocks */}');
            content = content.replace(/<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">\s*<div className="lg:col-span-2 space-y-6">/g, '');
            
            // Remove the start of Sidebar Config Blocks
            content = content.replace(/<\/div>\s*\{\/\* Sidebar Config Blocks \*\/\}\s*<div className="space-y-[0-9]+">/g, '{/* Sidebar Config Blocks */}');
            
            // The form grid closing tags: at the end of the form, there's usually </div></div></form>
            // We just need to remove two </div> tags before </form> if we removed the wrappers.
            // This is safer to do per file, but let's try a heuristic:
            content = content.replace(/<\/div>\s*<\/div>\s*<\/form>/g, '</form>');

            // 2. Reduce card padding from p-8 to p-6 (24px)
            content = content.replace(/bg-card p-8 rounded-2xl/g, 'bg-card p-6 rounded-2xl');
            content = content.replace(/bg-card p-6 rounded-2xl/g, 'bg-card p-6 rounded-2xl');
            
            // 3. Action table fixes in case they're scattered
            content = content.replace(/opacity-0 group-hover:opacity-100/g, '');
            content = content.replace(/opacity-0 group-hover:opacity-100 transition-opacity/g, '');

            // 4. Update the Save Header to match the enterprise design:
            // "Height around 80px. No excessive padding."
            content = content.replace(/className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl"/g, 'className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card px-6 py-4 rounded-2xl border border-border shadow-md"');

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated Form Layout:', fullPath);
            }
        }
    }
}

processDir(path.join(process.cwd(), 'src/app/(admin)/admin'));
