/*
 * 界面文案字典（中英雙語）。
 * window.I18N.zh / window.I18N.en；token 用 {name} 佔位，由 t() 函數替換。
 */
(function (root) {
  'use strict';

  var zh = {
    appName: '數學樂園',
    tagline: '陪孩子一步步學數學',
    langName: '繁體中文',

    home: { title: '選擇年級', subtitle: '從學前到大學，一步一步來', stars: '⭐ {n} 顆星', streak: '🔥 連續 {n} 天', continue: '繼續', parent: '家長中心', settings: '設置', unlocked: '已解鎖 {u} / {t} 個階段', stageCount: '解鎖 {u}/{t}', nextHint: '通過當前階段的測驗後，會解鎖下一階段' },

    stage: { back: '返回', goal: '目標', unlockedCount: '{u}/{t} 已解鎖' },

    skill: {
      learn: '開始', practice: '練習', quiz: '測驗',
      mastered: '已掌握', passed: '已通過', review: '複習', locked: '未解鎖', coming: '即將上線',
      unlockHint: '先通過上一個技能的測驗，才能解鎖這一個',
      comingText: '這個階段的內容正在准備中，敬請期待！'
    },

    lesson: {
      title: '小課堂', intro: '講解', example: '舉例', tip: '小技巧',
      start: '開始練習', skip: '直接去測驗', later: '先練習'
    },

    practice: {
      title: '練習', progress: '進度', question: '第 {i} / {n} 題',
      hint: '提示', next: '下一題', done: '完成練習',
      correct: ['太棒了！', '真厲害！', '答對啦！', '好樣的！', '真聰明！'],
      wrong: ['再試一次', '差一點', '再想一想'],
      chooseAnswer: '選一個答案', typeAnswer: '輸入答案'
    },

    quiz: {
      title: '測驗', questions: '共 {n} 道題', time: '用時', result: '完成啦！',
      score: '答對 {c} / {t}', stars: '獲得 {n} 顆星',
      retry: '再測一次', back: '返回課程', certificate: '證書', scoreCard: '成績單'
    },

    parent: {
      title: '家長中心', overview: '學習概覽', totalStars: '總星星', streak: '連續天數',
      masteredSkills: '已掌握技能', skills: '技能掌握情況', mastery: '掌握度',
      export: '導出進度', import: '導入進度', reset: '重置進度',
      unlockAll: '解鎖所有階段', unlockAllConfirm: '確定解鎖所有階段嗎？解鎖後孩子可自由進入任何階段。', unlockAllDone: '已解鎖所有階段',
      resetConfirm: '確定要清空所有學習進度嗎？此操作無法撤銷。',
      imported: '進度已導入', exported: '已復制到剪貼板', empty: '還沒有練習記錄，快開始吧！'
    },

    settings: {
      title: '設置', language: '語言 / Language', sound: '音效',
      theme: '主題', themeLight: '淺色', themeDark: '深色', themeAuto: '跟隨系統',
      soundOn: '已開啟', soundOff: '已關閉', reset: '重置所有進度'
    },

    colors: { green: '綠色', orange: '橙色' },

    common: {
      cancel: '取消', confirm: '確定', close: '關閉', of: '共', masteredShort: '已掌握'
    }
  };

  var en = {
    appName: 'Math Garden',
    tagline: 'Step-by-step math for your child',
    langName: 'English',

    home: { title: 'Choose a Grade', subtitle: 'From Pre-K to College, one step at a time', stars: '⭐ {n} stars', streak: '🔥 {n}-day streak', continue: 'Continue', parent: 'Parent', settings: 'Settings', unlocked: '{u} / {t} stages unlocked', stageCount: '{u}/{t} unlocked', nextHint: 'Pass the current stage to unlock the next one' },

    stage: { back: 'Back', goal: 'Goal', unlockedCount: '{u}/{t} unlocked' },

    skill: {
      learn: 'Start', practice: 'Practice', quiz: 'Quiz',
      mastered: 'Mastered', passed: 'Passed', review: 'Review', locked: 'Locked', coming: 'Coming soon',
      unlockHint: 'Pass the previous skill\'s quiz first',
      comingText: 'This stage is coming soon. Stay tuned!'
    },

    lesson: {
      title: 'Lesson', intro: 'Learn', example: 'Example', tip: 'Tip',
      start: 'Start Practice', skip: 'Skip to Quiz', later: 'Practice first'
    },

    practice: {
      title: 'Practice', progress: 'Progress', question: 'Question {i} / {n}',
      hint: 'Hint', next: 'Next', done: 'Finish Practice',
      correct: ['Great job!', 'Awesome!', 'Correct!', 'Well done!', 'Smart!'],
      wrong: ['Try again', 'Almost', 'Think again'],
      chooseAnswer: 'Choose an answer', typeAnswer: 'Type the answer'
    },

    quiz: {
      title: 'Quiz', questions: '{n} questions', time: 'Time', result: 'Finished!',
      score: '{c} / {t} correct', stars: 'Earned {n} stars',
      retry: 'Retry', back: 'Back to Course', certificate: 'Certificate', scoreCard: 'Score Card'
    },

    parent: {
      title: 'Parent Dashboard', overview: 'Overview', totalStars: 'Total stars', streak: 'Day streak',
      masteredSkills: 'Skills mastered', skills: 'Skill mastery', mastery: 'Mastery',
      export: 'Export', import: 'Import', reset: 'Reset progress',
      unlockAll: 'Unlock all stages', unlockAllConfirm: 'Unlock all stages? Your child can then enter any stage freely.', unlockAllDone: 'All stages unlocked',
      resetConfirm: 'Clear all learning progress? This cannot be undone.',
      imported: 'Progress imported', exported: 'Copied to clipboard', empty: 'No practice yet. Let\'s get started!'
    },

    settings: {
      title: 'Settings', language: 'Language / 語言', sound: 'Sound',
      theme: 'Theme', themeLight: 'Light', themeDark: 'Dark', themeAuto: 'Auto',
      soundOn: 'On', soundOff: 'Off', reset: 'Reset all progress'
    },

    colors: { green: 'Green', orange: 'Orange' },

    common: {
      cancel: 'Cancel', confirm: 'OK', close: 'Close', of: 'of', masteredShort: 'Mastered'
    }
  };

  root.I18N = { zh: zh, en: en };
})(typeof window !== 'undefined' ? window : globalThis);
