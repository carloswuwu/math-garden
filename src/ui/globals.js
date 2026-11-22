/* 瀏覽器全局橋接（ESM）：UI 模組在 classic build 中執行時，引擎/內容仍在 window 上。 */
var root = typeof window !== 'undefined' ? window : globalThis;
export var MathCore = root.MathCore;
export var I18N = root.I18N;
export var Curriculum = root.Curriculum;
export var CurriculumOutline = root.CurriculumOutline;
export var Formulas = root.Formulas;
export var Lessons = root.Lessons;
