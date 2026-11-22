/* 組卷（ESM）：composeSet（10 題測驗）與 composeExam（20 題考試）。
 * 依賴 problem.generateProblem 與 signatures 的去重/模板工具。
 */
import { seedRandom, randInt, pick, shuffle } from './rng.js';
import { generateProblem, typeList } from './problem.js';
import { mathSig, templateSig, contextSig } from './signatures.js';

  function composeSet(skill, count, opts) {
    opts = opts || {};
    var rng = opts.rng || seedRandom(opts.seed != null ? opts.seed : 1);
    var step = opts.difficultyStep != null ? opts.difficultyStep : 0;
    var types = typeList(skill);
    if (!types.length) return [];
    var out = [];
    var seenSig = {};
    var tCount = {}, cCount = {};
    var avoid = {};
    (opts.avoid || []).forEach(function (s) { avoid[s] = true; });
    function draw() {
      var ti = types.length > 1 ? Math.floor(rng() * types.length) : 0;
      return generateProblem(skill, { rng: rng, difficultyStep: step, typeIndex: ti });
    }
    function pass(maxTpl, uniqueSig) {
      var guard = 0;
      while (out.length < count && guard++ < count * 300) {
        var p = draw();
        var t = templateSig(p), c = contextSig(p);
        if (uniqueSig && (avoid[p.sig] || seenSig[p.sig])) continue;
        if (seenSig[p.sig]) continue; // 任何情況都不容許完全相同的題目
        if ((tCount[t] || 0) >= maxTpl || (cCount[c] || 0) >= maxTpl) continue;
        seenSig[p.sig] = true;
        tCount[t] = (tCount[t] || 0) + 1;
        cCount[c] = (cCount[c] || 0) + 1;
        out.push(p);
      }
    }
    pass(1, true);
    pass(2, true);
    /* 同一模板最多 4 題，但仍要求整題不同：讓「同結構不同問法」也有空間 */
    pass(4, true);
    /* 題庫太小：只保證不重複，允許模板重複 */
    var guard = 0;
    while (out.length < count && guard++ < count * 400) {
      var p = draw();
      if (seenSig[p.sig]) continue;
      seenSig[p.sig] = true;
      out.push(p);
    }
    /* 真·超小題庫（< count 個不同題目）：寧可重複也要補滿 count 題 */
    guard = 0;
    while (out.length < count && guard++ < count * 200) out.push(draw());
    return out;
  }

  /* 綜合考試組卷：跨技能抽題，每技能最多 maxPerSkill 題、同一模板最多 2 次；
   * stepFor(skill, rng) 決定每題難度級別（預設隨機 0..max）。 */
  function composeExam(skills, count, opts) {
    opts = opts || {};
    var rng = opts.rng || seedRandom(opts.seed != null ? opts.seed : 1);
    var maxPerSkill = opts.maxPerSkill != null ? opts.maxPerSkill : 3;
    var stepFor = opts.stepFor;
    var out = [], seenSig = {}, tCount = {}, cCount = {}, sCount = {};
    var cursor = 0;
    function stepOf(skill) {
      var levels = Math.max(1, (skill.levels || []).length);
      if (stepFor) return stepFor(skill, rng);
      return randInt(rng, 0, levels - 1);
    }
    function draw(relax) {
      for (var tries = 0; tries < skills.length * 10; tries++) {
        var skill = skills[cursor++ % skills.length];
        var types = typeList(skill);
        if (!types.length) continue;
        var p = generateProblem(skill, {
          rng: rng,
          difficultyStep: stepOf(skill),
          typeIndex: Math.floor(rng() * types.length)
        });
        if (seenSig[p.sig]) continue;
        var t = templateSig(p), c = contextSig(p);
        if (!relax && ((tCount[t] || 0) >= 2 || (cCount[c] || 0) >= 2 || (sCount[skill.id] || 0) >= maxPerSkill)) continue;
        seenSig[p.sig] = true;
        tCount[t] = (tCount[t] || 0) + 1;
        cCount[c] = (cCount[c] || 0) + 1;
        sCount[skill.id] = (sCount[skill.id] || 0) + 1;
        p.skillId = skill.id;
        return p;
      }
      return null;
    }
    var guard = 0;
    while (out.length < count && guard++ < count * 40) { var p = draw(false); if (p) out.push(p); }
    guard = 0;
    while (out.length < count && guard++ < count * 40) { p = draw(true); if (p) out.push(p); }
    /* 仍不足：跨技能抽不重複的題（放寬每技能題數），最後才容許重複 */
    guard = 0;
    while (out.length < count && guard++ < count * 400) {
      var skill = skills[cursor++ % skills.length];
      var types = typeList(skill);
      if (!types.length) continue;
      p = generateProblem(skill, { rng: rng, difficultyStep: stepOf(skill), typeIndex: Math.floor(rng() * types.length) });
      if (seenSig[p.sig]) continue;
      seenSig[p.sig] = true;
      p.skillId = skill.id;
      out.push(p);
    }
    guard = 0;
    while (out.length < count && guard++ < count * 200) {
      var fallbackSkill = skills[cursor++ % skills.length];
      var fallbackTypes = typeList(fallbackSkill);
      if (!fallbackTypes.length) continue;
      p = generateProblem(fallbackSkill, { rng: rng, difficultyStep: stepOf(fallbackSkill), typeIndex: Math.floor(rng() * fallbackTypes.length) });
      p.skillId = fallbackSkill.id;
      out.push(p);
    }
    return opts.shuffle === false ? out : shuffle(rng, out);
  }

export { composeSet, composeExam };
