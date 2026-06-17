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

            // Strip out ANY remaining width restrictions or inner wrapper paddings
            content = content.replace(/max-w-\[1200px\]/g, '');
            content = content.replace(/max-w-\[1000px\]/g, '');
            content = content.replace(/max-w-4xl/g, '');
            content = content.replace(/max-w-3xl/g, '');
            content = content.replace(/max-w-5xl/g, '');
            content = content.replace(/p-4 md:p-8/g, '');
            content = content.replace(/p-8/g, '');
            content = content.replace(/className="w-full\s+space-y-8\s+"/g, 'className="w-full space-y-6"');
            
            // Clean up empty classes
            content = content.replace(/className="\s+"/g, 'className=""');
            content = content.replace(/className="w-full\s+"/g, 'className="w-full"');
            content = content.replace(/className="w-full\s+space-y-8"/g, 'className="w-full space-y-6"');

            // Force 2-column Desktop grid inside form blocks as requested
            content = content.replace(/grid-cols-1 md:grid-cols-2/g, 'grid-cols-1 lg:grid-cols-2');

            // Set Textareas to span both columns if they are not already
            // If they are in a form field div, the div needs lg:col-span-2.
            // This is harder with regex, but we can do a broad stroke for "Bio" or "Description" textareas if needed.

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Final Polish:', fullPath);
            }
        }
    }
}

processDir(path.join(process.cwd(), 'src/app/(admin)/admin'));
