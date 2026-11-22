/* 瀏覽器全局橋接（ESM）：UI 模組在 classic build 中執行時，引擎/內容仍在 window 上。 */
var root = typeof window !== 'undefined' ? window : globalThis;
export var MathCore = root.MathCore;
export var I18N = root.I18N;
export var Curriculum = root.Curriculum;
export var CurriculumOutline = root.CurriculumOutline;
export var Formulas = root.Formulas;

/* 課堂內容是 lazy chunk：root/file:// 模式在 app.js 前已同步載入，
 * dist 模式要進小課堂時才由 lessons-loader 注入。因此這裡用 getter 晚綁定。 */
export function getLessons() { return root.Lessons; }
