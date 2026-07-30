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
      {
        name: 'user dropdown toggle -> data-testid on the <span>',
        anchor: '{ class: "oxd-userdropdown-tab" }',
        replacement:
          '{ class: "oxd-userdropdown-tab", "data-testid": "user-dropdown-toggle" }',
      },
      {
        name: 'topbar breadcrumb module title -> data-testid on the <h6>',
        anchor:
          'class: "oxd-topbar-header-breadcrumb-module"\n          }, {',
        replacement:
          'class: "oxd-topbar-header-breadcrumb-module",\n            "data-testid": "page-title"\n          }, {',
      },
      {
        name: 'topbar breadcrumb level subtitle -> data-testid on the <h6>',
        anchor:
          'class: "oxd-topbar-header-breadcrumb-level"\n          }, {',
        replacement:
          'class: "oxd-topbar-header-breadcrumb-level",\n            "data-testid": "page-subtitle"\n          }, {',
      },
      {
        name: 'toast title -> data-testid on the <p>',
        anchor: 'type: "toast-title",\n            class: "oxd-toast-content-text"',
        replacement:
          'type: "toast-title",\n            class: "oxd-toast-content-text",\n            "data-testid": "toast-title"',
      },
      {
        name: 'toast message -> data-testid on the <p>',
        anchor:
          'type: "toast-message",\n            class: "oxd-toast-content-text"',
        replacement:
          'type: "toast-message",\n            class: "oxd-toast-content-text",\n            "data-testid": "toast-message"',
      },
      {
        name: 'date input -> data-testid forwarded from $attrs onto the actual <input>',
        anchor:
          'h(n, {\n        ref: "oxdInput",\n        "has-error": e.hasError,\n        disabled: e.disabled,\n        readonly: e.readonly,\n        value: e.displayDate,\n        placeholder: e.placeholder,\n        onBlur: e.onBlur,\n        onClick: e.toggleDropdown,\n        "onUpdate:modelValue": e.onDateTyped\n      }, null, 8, ["has-error", "disabled", "readonly", "value", "placeholder", "onBlur", "onClick", "onUpdate:modelValue"])',
        replacement:
          'h(n, {\n        ref: "oxdInput",\n        "has-error": e.hasError,\n        disabled: e.disabled,\n        readonly: e.readonly,\n        value: e.displayDate,\n        placeholder: e.placeholder,\n        onBlur: e.onBlur,\n        onClick: e.toggleDropdown,\n        "onUpdate:modelValue": e.onDateTyped,\n        "data-testid": e.$attrs["data-testid"]\n      }, null, 8, ["has-error", "disabled", "readonly", "value", "placeholder", "onBlur", "onClick", "onUpdate:modelValue"])',
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
      {
        name: 'user dropdown toggle -> data-testid on the <span>',
        anchor: 'Dn={class:"oxd-userdropdown-tab"}',
        replacement: 'Dn={class:"oxd-userdropdown-tab","data-testid":"user-dropdown-toggle"}',
      },
      {
        name: 'topbar breadcrumb module title -> data-testid on the <h6>',
        anchor: '{tag:"h6",class:"oxd-topbar-header-breadcrumb-module"}',
        replacement:
          '{tag:"h6",class:"oxd-topbar-header-breadcrumb-module","data-testid":"page-title"}',
      },
      {
        name: 'topbar breadcrumb level subtitle -> data-testid on the <h6>',
        anchor: '{key:0,tag:"h6",class:"oxd-topbar-header-breadcrumb-level"}',
        replacement:
          '{key:0,tag:"h6",class:"oxd-topbar-header-breadcrumb-level","data-testid":"page-subtitle"}',
      },
      {
        name: 'toast title -> data-testid on the <p>',
        anchor: 'type:"toast-title",class:"oxd-toast-content-text"',
        replacement:
          'type:"toast-title",class:"oxd-toast-content-text","data-testid":"toast-title"',
      },
      {
        name: 'toast message -> data-testid on the <p>',
        anchor: 'type:"toast-message",class:"oxd-toast-content-text"',
        replacement:
          'type:"toast-message",class:"oxd-toast-content-text","data-testid":"toast-message"',
      },
      {
        name: 'date input -> data-testid forwarded from $attrs onto the actual <input>',
        anchor:
          'e.createVNode(a,{ref:"oxdInput","has-error":t.hasError,disabled:t.disabled,readonly:t.readonly,value:t.displayDate,placeholder:t.placeholder,onBlur:t.onBlur,onClick:t.toggleDropdown,"onUpdate:modelValue":t.onDateTyped},null,8,["has-error","disabled","readonly","value","placeholder","onBlur","onClick","onUpdate:modelValue"])',
        replacement:
          'e.createVNode(a,{ref:"oxdInput","has-error":t.hasError,disabled:t.disabled,readonly:t.readonly,value:t.displayDate,placeholder:t.placeholder,onBlur:t.onBlur,onClick:t.toggleDropdown,"onUpdate:modelValue":t.onDateTyped,"data-testid":t.$attrs["data-testid"]},null,8,["has-error","disabled","readonly","value","placeholder","onBlur","onClick","onUpdate:modelValue"])',
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
