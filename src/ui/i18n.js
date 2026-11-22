/* 介面翻譯與顯示名稱（ESM）。 */
import { I18N } from './globals.js';
import { state } from './state.js';

export function t(path, tokens) {
    var d = I18N[state.lang] || I18N.zh;
    var v = d;
    path.split('.').forEach(function (p) { v = v && v[p]; });
    if (v == null) return path;
    if (typeof v === 'string' && tokens) {
      return v.replace(/\{(\w+)\}/g, function (_, k) { return tokens[k] != null ? tokens[k] : '{' + k + '}'; });
    }
    return v;
  }
export function L(obj) { return state.lang === 'zh' ? obj.zh : obj.en; }
export function nameOf(skill) { return state.lang === 'zh' ? skill.zh.name : skill.en.name; }
export function goalOf(skill) { return state.lang === 'zh' ? skill.zh.goal : skill.en.goal; }
