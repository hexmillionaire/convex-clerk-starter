/**
 * Reading preferences that live in the reader's own browser — the parts that
 * both the server and the client need.
 *
 * The values are read three ways and all three must agree: the blocking inline
 * script below (before first paint), the React hooks in `use-reading-prefs.ts`,
 * and the setters there. This module stays free of React so the root layout,
 * a server component, can import the script without pulling in a hook.
 */

export const FONT_SIZES = [14, 16, 18, 20, 22, 24] as const;
export const DEFAULT_FONT_INDEX = 2; // 18px
export const FONT_SIZE_STORAGE_KEY = "dw-font-size-index";

export const TRANSLATION_STORAGE_KEY = "dw-translation";

/**
 * Applies the stored reading size to the document before the page paints, so
 * scripture never renders at the default size and then resizes.
 *
 * Runs inline and synchronously in <head>; keep it small and dependency-free.
 */
export const readingPrefsScript = `
(function(){try{
var i=parseInt(localStorage.getItem(${JSON.stringify(FONT_SIZE_STORAGE_KEY)}),10);
var s=${JSON.stringify(FONT_SIZES)};
if(i>=0&&i<s.length){document.documentElement.style.setProperty("--reading-font-size",s[i]+"px")}
}catch(e){}})();
`.trim();
