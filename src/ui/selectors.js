/* 課程/進度選擇器（ESM）：解鎖、掌握度、階段統計。 */
import { MathCore, Curriculum } from './globals.js';
import { progress } from './state.js';

export function getSkill(id) { return Curriculum.skills[id]; }
export function getStage(id) {
    for (var i = 0; i < Curriculum.stages.length; i++) if (Curriculum.stages[i].id === id) return Curriculum.stages[i];
    return null;
  }
export function stageSkills(stage) {
    var out = [];
    stage.topics.forEach(function (topic) {
      topic.skills.forEach(function (id) {
        var s = getSkill(id);
        if (s) out.push(s);
      });
    });
    return out;
  }
export function skillProgress(id) { return progress.skills[id] || MathCore.defaultSkillProgress(); }
export function masteryOf(skill) { return MathCore.masteryStatus(progress, skill); }
export function totalStars() {
    var sum = 0;
    for (var id in progress.skills) {
      if (Curriculum.skills[id]) sum += progress.skills[id].stars || 0;
    }
    return sum;
  }

  /* 通過測驗（≧2 星）才算過關，用於逐步解鎖 */
export function isPassed(skill) { return (skillProgress(skill.id).quizStars || 0) >= 2; }
export function realStageList() {
    /* 挑戰區是額外難題區，不屬於年級解鎖鏈；由首頁的挑戰卡直接進入。 */
    return Curriculum.stages.filter(function (st) {
      if (st.id === 'challenge') return false;
      return stageSkills(st).some(function (s) { return !s.scaffold; });
    });
  }
export function stageComplete(stage) {
    var hasReal = stageSkills(stage).some(function (s) { return !s.scaffold; });
    if (!hasReal) return false;
    var ex = (progress.stageExams || {})[stage.id];
    return !!(ex && (ex.passed || ex.perfect)); // 綜合考試達 90% 即完成此階段（舊存檔的 perfect 仍相容）
  }
export function stageUnlocked(stageId) {
    if (stageId === 'challenge') return true; // 挑戰區永遠開放
    var real = realStageList();
    for (var i = 0; i < real.length; i++) {
      if (real[i].id === stageId) return i === 0 || stageComplete(real[i - 1]);
    }
    return false; // 腳手架階段暫不解鎖
  }

  /* 計算一個階段內「已解鎖 / 已通過 / 總數」的技能數（與解鎖邏輯一致） */
export function stageSkillStats(stage) {
    var total = 0, unlocked = 0, passed = 0;
    var prevMastered = true;
    var idx = 0;
    stage.topics.forEach(function (topic) {
      topic.skills.forEach(function (id) {
        var skill = getSkill(id);
        if (!skill) return;
        if (skill.scaffold) { idx++; return; }
        var locked = !prevMastered && idx > 0;
        var ms = masteryOf(skill);
        prevMastered = ms.mastered;
        total++;
        if (!locked) unlocked++;
        if (ms.mastered) passed++;
        idx++;
      });
    });
    return { total: total, unlocked: unlocked, passed: passed };
  }
