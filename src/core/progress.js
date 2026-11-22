/*
 * 進度、掌握度與計分（ESM）：練習/測驗結果、星星、難度、progress schema 清洗。
 * 不含 DOM／隨機；由 src/core/index.js 匯入並保持 window.MathCore 的同一 API。
 */

/* 進度 key：同一個 type 的不同 mode/form 分開追蹤（word 用 math.op 區分應用題型）。 */
function typeAccKey(problem) {
  var m = (problem && problem.math) || {};
  var mode = problem && problem.type === 'word' ? (m.op || '') : (m.mode || m.form || '');
  return problem.type + (mode && mode !== problem.type ? ':' + mode : '');
}

function defaultSkillProgress() {
  return {
    attempts: 0, correct: 0,
    consecCorrect: 0, consecWrong: 0,
    difficultyStep: 0, lastSeen: 0,
    typeAcc: {}, stars: 0, mastered: false,
    quizStars: 0, quizBest: 0,
    lastProblems: []
  };
}

function newProgress() {
  return { version: 2, lang: 'zh', sound: true, theme: 'light', stars: 0, streak: { lastDay: null, count: 0 }, badges: [], skills: {}, stageExams: {} };
}

/* ---------------- 進度資料的清洗與升級 ----------------
 * 所有外部來源（localStorage、家長匯入）都先經過這裡：
 * 只保留已知欄位、把數值夾到合法範圍、補上缺少的預設值。
 * v1 → v2：新增 stageExams / theme，缺少時補預設。 */
function sanitizeProgress(input) {
  var base = newProgress();
  if (!input || typeof input !== 'object' || Array.isArray(input)) return base;
  var num = function (v, d) { return (typeof v === 'number' && isFinite(v)) ? v : d; };
  var int = function (v, d, min, max) {
    var n = Math.floor(num(v, d));
    if (n < min) n = min;
    if (max != null && n > max) n = max;
    return n;
  };
  var bool = function (v, d) { return typeof v === 'boolean' ? v : d; };
  base.lang = (input.lang === 'en' || input.lang === 'zh') ? input.lang : 'zh';
  base.sound = bool(input.sound, true);
  base.theme = (input.theme === 'dark' || input.theme === 'light' || input.theme === 'auto') ? input.theme : 'light';
  base.stars = int(input.stars, 0, 0, 1000000);
  if (input.streak && typeof input.streak === 'object') {
    base.streak.lastDay = (typeof input.streak.lastDay === 'string' || input.streak.lastDay === null) ? input.streak.lastDay : null;
    base.streak.count = int(input.streak.count, 0, 0, 100000);
  }
  if (Array.isArray(input.badges)) {
    base.badges = input.badges.filter(function (b) { return typeof b === 'string'; }).slice(0, 100);
  }
  if (input.skills && typeof input.skills === 'object' && !Array.isArray(input.skills)) {
    Object.keys(input.skills).slice(0, 500).forEach(function (id) {
      var s = input.skills[id];
      if (!s || typeof s !== 'object') return;
      var sp = {
        attempts: int(s.attempts, 0, 0, 1000000),
        correct: int(s.correct, 0, 0, 1000000),
        consecCorrect: int(s.consecCorrect, 0, 0, 100),
        consecWrong: int(s.consecWrong, 0, 0, 100),
        difficultyStep: int(s.difficultyStep, 0, 0, 20),
        lastSeen: num(s.lastSeen, 0),
        typeAcc: {},
        stars: int(s.stars, 0, 0, 3),
        mastered: bool(s.mastered, false),
        quizStars: int(s.quizStars, 0, 0, 3),
        quizBest: int(s.quizBest, 0, 0, 100),
        lastProblems: Array.isArray(s.lastProblems) ? s.lastProblems.slice(-20) : []
      };
      if (s.typeAcc && typeof s.typeAcc === 'object') {
        Object.keys(s.typeAcc).slice(0, 60).forEach(function (t) {
          var a = s.typeAcc[t];
          if (a && typeof a === 'object') sp.typeAcc[t] = { a: int(a.a, 0, 0, 1000000), c: int(a.c, 0, 0, 1000000) };
        });
      }
      base.skills[id] = sp;
    });
  }
  if (input.stageExams && typeof input.stageExams === 'object' && !Array.isArray(input.stageExams)) {
    Object.keys(input.stageExams).slice(0, 100).forEach(function (id) {
      var e = input.stageExams[id];
      if (!e || typeof e !== 'object') return;
      base.stageExams[id] = {
        passed: bool(e.passed, false) || bool(e.perfect, false),
        perfect: bool(e.perfect, false),
        best: int(e.best, 0, 0, 100)
      };
    });
  }
  base.version = 2;
  return base;
}

function practiceStars(correct, practice) {
  if (correct >= practice) return 3;
  if (correct >= Math.ceil(practice * 0.66)) return 2;
  if (correct >= Math.ceil(practice * 0.33)) return 1;
  return 0;
}

/* pass 預設 0.8（舊行為）：2 星 = 及格、3 星 = ≥95%、1 星 = ≥75% 及格線。
 * 每個技能可用 mastery.quizPass 覆寫及格線（以前是死設定）。 */
function quizStars(percent, pass) {
  var threshold = (typeof pass === 'number' && pass > 0 && pass <= 1) ? pass : 0.8;
  if (percent >= Math.min(0.95, threshold + 0.15)) return 3;
  if (percent >= threshold) return 2;
  if (percent >= threshold * 0.75) return 1;
  return 0;
}

function masteryStatus(progress, skill) {
  var sp = progress.skills[skill.id] || defaultSkillProgress();
  var practice = (skill.mastery && skill.mastery.practice) || 10;
  var pStars = practiceStars(sp.correct, practice);
  var qStars = sp.quizStars || 0;
  var stars = Math.max(pStars, qStars);
  var mastered = qStars >= 2; // 通過測驗（≧80%）才算掌握，用於解鎖下一關
  return { practiceStars: pStars, quizStars: qStars, stars: stars, mastered: mastered, practice: practice };
}

function applyResult(progress, skill, problem, correct, opts) {
  opts = opts || {};
  if (!progress.skills[skill.id]) progress.skills[skill.id] = defaultSkillProgress();
  var sp = progress.skills[skill.id];
  sp.attempts += 1;
  sp.lastSeen = Date.now();
  var accKey = typeAccKey(problem);
  var acc = sp.typeAcc[accKey] || { a: 0, c: 0 };
  acc.a += 1;
  var credit = opts.credit !== false;
  if (correct && credit) {
    acc.c += 1;
    sp.correct += 1;
    sp.consecCorrect += 1;
    sp.consecWrong = 0;
    if (sp.consecCorrect >= 3) {
      sp.difficultyStep += 1;
      sp.consecCorrect = 0;
    }
  } else if (correct) {
    /* 重試後答對：只記一次嘗試，不計掌握度、不推高難度（first-attempt-only 練習計分） */
    sp.consecCorrect = 0;
  } else {
    sp.consecWrong += 1;
    sp.consecCorrect = 0;
    if (sp.consecWrong >= 2) {
      sp.difficultyStep = Math.max(0, sp.difficultyStep - 1);
      sp.consecWrong = 0;
    }
  }
  var levels = skill.levels || [{ min: skill.min, max: skill.max }];
  sp.difficultyStep = Math.max(0, Math.min(sp.difficultyStep, levels.length - 1));
  sp.typeAcc[accKey] = acc;
  sp.lastProblems.push({ type: problem.type, sig: problem.sig });
  if (sp.lastProblems.length > 3) sp.lastProblems.shift();
  var st = masteryStatus(progress, skill);
  sp.stars = st.stars;
  sp.mastered = st.mastered;
  return progress;
}

function applyQuizResult(progress, skill, percent) {
  if (!progress.skills[skill.id]) progress.skills[skill.id] = defaultSkillProgress();
  var sp = progress.skills[skill.id];
  var pass = (skill.mastery && skill.mastery.quizPass) || 0.8;
  var qs = quizStars(percent, pass);
  sp.quizStars = Math.max(sp.quizStars || 0, qs);
  sp.quizBest = Math.max(sp.quizBest || 0, Math.round(percent * 100));
  var st = masteryStatus(progress, skill);
  sp.stars = st.stars;
  sp.mastered = st.mastered;
  return progress;
}

function gradeQuiz(results, pass) {
  var correct = 0, total = results.length;
  results.forEach(function (r) { if (r.correct) correct++; });
  var percent = total ? correct / total : 0;
  return { correct: correct, total: total, percent: percent, stars: quizStars(percent, pass) };
}

export {
  defaultSkillProgress,
  typeAccKey,
  newProgress,
  sanitizeProgress,
  practiceStars,
  quizStars,
  masteryStatus,
  applyResult,
  applyQuizResult,
  gradeQuiz
};
