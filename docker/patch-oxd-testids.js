#!/usr/bin/env node
/**
 * Patches compiled render functions inside node_modules/@ohrm/oxd's bundle(s) to add
 * data-testid attributes to elements @ohrm/oxd renders internally (menu items, table
 * rows, pagination buttons) that the app's own .vue source never gets a template handle
 * on. @ohrm/oxd only publishes pre-built bundles (no .vue source), so this patches the
 * built, minified JS directly via exact-string anchors.
 *
 * @ohrm/oxd's package.json exposes both an ESM build (index.es.js, "module" field) and
 * a UMD build (index.umd.js, "main"/"browser" fields) - Vue CLI's webpack config
 * resolves "browser" first, so index.umd.js is the one that actually ends up in
 * chunk-vendors.js. Both are patched anyway: harmless if a build only uses one, and
 * safe if that resolution ever changes.
 *
 * Each anchor must match exactly once per file; the build fails loudly if @ohrm/oxd
 * changes its output instead of silently shipping an unpatched image.
 */
const fs = require('fs');
const path = require('path');

const oxdDir = path.resolve(process.argv[2] || 'node_modules/@ohrm/oxd');

const targets = [
  {
    file: 'index.es.js',
    patches: [
      {
        name: 'main menu item -> data-testid on the <a> anchor',
        anchor:
          'l("a", {\n      class: $(e.menuClasses),\n      href: e.url\n    }, [',
        replacement:
          'l("a", {\n      class: $(e.menuClasses),\n      href: e.url,\n      "data-testid": "menu-item-" + String(e.name).toLowerCase().replace(/\\s+/g, "-")\n    }, [',
      },
      {
        name: 'card table row -> data-testid with row index',
        anchor:
          'key: JSON.stringify(u),\n        class: $(e.classes),\n        onClick: (b) => e.onClick(u)(b)',
        replacement:
          'key: JSON.stringify(u),\n        class: $(e.classes),\n        "data-testid": "table-row-" + _,\n        onClick: (b) => e.onClick(u)(b)',
      },
      {
        name: 'pagination page item -> data-testid on the <button>',
        anchor:
          'l("button", {\n      type: "button",\n      class: $(e.classes)\n    }, [',
        replacement:
          'l("button", {\n      type: "button",\n      class: $(e.classes),\n      "data-testid": e.previous ? "pagination-previous" : e.next ? "pagination-next" : "pagination-page-" + e.page\n    }, [',
      },
    ],
  },
  {
    file: 'index.umd.js',
    patches: [
      {
        name: 'main menu item -> data-testid on the <a> anchor',
        anchor:
          'e.createElementVNode("a",{class:e.normalizeClass(t.menuClasses),href:t.url},[',
        replacement:
          'e.createElementVNode("a",{class:e.normalizeClass(t.menuClasses),href:t.url,"data-testid":"menu-item-"+String(t.name).toLowerCase().replace(/\\s+/g,"-")},[',
      },
      {
        name: 'card table row -> data-testid with row index',
        anchor:
          'key:JSON.stringify(i),class:e.normalizeClass(t.classes),onClick:_=>t.onClick(i)(_)',
        replacement:
          'key:JSON.stringify(i),class:e.normalizeClass(t.classes),"data-testid":"table-row-"+p,onClick:_=>t.onClick(i)(_)',
      },
      {
        name: 'pagination page item -> data-testid on the <button>',
        anchor:
          'e.createElementVNode("button",{type:"button",class:e.normalizeClass(t.classes)},[',
        replacement:
          'e.createElementVNode("button",{type:"button",class:e.normalizeClass(t.classes),"data-testid":t.previous?"pagination-previous":t.next?"pagination-next":"pagination-page-"+t.page},[',
      },
    ],
  },
];

let failed = false;
for (const {file, patches} of targets) {
  const filePath = path.join(oxdDir, file);
  let src = fs.readFileSync(filePath, 'utf8');

  for (const {name, anchor, replacement} of patches) {
    const count = src.split(anchor).length - 1;
    if (count !== 1) {
      console.error(
        `[patch-oxd-testids] FAILED (${file}): "${name}" anchor found ${count} times (expected 1). ` +
          `@ohrm/oxd's bundle output has likely changed - update the anchor in docker/patch-oxd-testids.js.`
      );
      failed = true;
      continue;
    }
    src = src.replace(anchor, replacement);
    console.log(`[patch-oxd-testids] OK (${file}): ${name}`);
  }

  fs.writeFileSync(filePath, src, 'utf8');
}

if (failed) {
  process.exit(1);
}

console.log('[patch-oxd-testids] @ohrm/oxd bundles patched successfully.');
