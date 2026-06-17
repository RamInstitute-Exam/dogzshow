const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // Remove max-w limits and centering that restricts layout
            content = content.replace(/max-w-\[1600px\]/g, 'w-full');
            content = content.replace(/max-w-\[1400px\]/g, 'w-full');
            content = content.replace(/max-w-7xl/g, 'w-full');
            content = content.replace(/max-w-screen-2xl/g, 'w-full');
            content = content.replace(/mx-auto/g, ''); // we don't need mx-auto since width is 100%

            // Simplify inner wrapper spacings: The wrapper in layout.tsx gives 20px uniform.
            content = content.replace(/ className="p-4 md:p-8 space-y-6"/g, ' className="w-full space-y-6"');
            content = content.replace(/ className="p-4 md:p-8"/g, ' className="w-full"');
            content = content.replace(/<div className="p-4 md:p-8 space-y-6">/g, '<div className="w-full space-y-6">');
            content = content.replace(/<div className="p-4 md:p-8">/g, '<div className="w-full">');
            content = content.replace(/className="p-8"/g, 'className="w-full"'); // e.g. admin/page.tsx

            // Clean up redundant class names like "w-full w-full"
            content = content.replace(/w-full w-full/g, 'w-full');
            content = content.replace(/w-full  space-y-6/g, 'w-full space-y-6');

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated:', fullPath);
            }
        }
    }
}

// Paths are relative to frontend root when run
processDir(path.join(process.cwd(), 'src/app/(admin)/admin'));
processDir(path.join(process.cwd(), 'src/components/shared'));
