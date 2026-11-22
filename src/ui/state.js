/*
 * UI 狀態與進度儲存（ESM）：常數、state、progress、localStorage 讀寫。
 * progress 以 live binding 匯出；重設時用 setProgress。
 */
import { MathCore } from './globals.js';

export const STORE_KEY = 'mathpath.progress';
export const LEGACY_STORE_KEY = 'mathpath.progress.v1';
export const SESSION_KEY = 'mathpath.session.v1'; // 未完成的練習/測驗/考試，只存在 sessionStorage
export const SESSION_VERSION = 1;
export const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 小時後不再自動恢復
export const QUIZ_LENGTH = 10;
export const EXAM_LENGTH = 20;
export const EXAM_PASS = 0.9; // 綜合考試達 90% 即可解鎖下一階段
export const HOME_ROUTE = { screen: 'home' };

  /* ---------------- 狀態 ---------------- */
export const state = {
    lang: 'zh',
    sound: true,
    theme: 'light',
    screen: 'home',
    stageId: null,
    skillId: null,
    examStage: null,
    mode: 'practice', // 'practice' | 'quiz' | 'exam'
    problems: [],
    index: 0,
    correct: 0,
    results: [],
    locked: false,
    hintShown: false,
    quizStart: 0,
    attemptWrong: false,
    /* 進行中題組：{ mode, key }；只在真正開始/恢復題組時設定，離開作答畫面即清除。
     * 不能只用 state.mode/state.skillId 判斷，因為 renderLesson 會更新 skillId。 */
    run: null
  };

export let progress = loadProgress();
  state.lang = progress.lang || 'zh';
  state.sound = progress.sound !== false;
  state.theme = progress.theme || 'light';

export function loadProgress() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      var legacy = raw ? null : localStorage.getItem(LEGACY_STORE_KEY);
      if (!raw && !legacy) return MathCore.newProgress();
      var parsed = JSON.parse(raw || legacy);
      var clean = MathCore.sanitizeProgress(parsed);
      if (!raw && legacy) {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(clean)); } catch (e) { /* 忽略 */ }
      }
      return clean;
    } catch (e) { return MathCore.newProgress(); }
  }
export function saveProgress() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (e) { /* 忽略 */ }
  }

export function setProgress(p) { progress = p; }
