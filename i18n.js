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

    home: { title: '選擇年級', subtitle: '從學前到大學，一步一步來', stars: '⭐ {n} 顆星', streak: '🔥 連續 {n} 天', continue: '繼續', parent: '家長中心', settings: '設置', unlocked: '已解鎖 {u} / {t} 個階段', stageCount: '解鎖 {u}/{t}', nextHint: '完成本階段的綜合考試並取得 90% 或以上，即可解鎖下一階段' },

    stage: { back: '返回', goal: '目標', unlockedCount: '{u}/{t} 已解鎖' },

    skill: {
      learn: '開始', practice: '練習', quiz: '測驗',
      mastered: '已掌握', passed: '已通過', review: '複習', locked: '未解鎖', coming: '即將上線',
      unlockHint: '先通過上一個技能的測驗，才能解鎖這一個',
      comingText: '這個階段的內容正在准備中，敬請期待！'
    },

    lesson: {
      title: '小課堂', intro: '講解', example: '舉例', tip: '小技巧',
      showExample: '看一步步示範', nextExample: '換一題',
      start: '開始練習', skip: '直接去測驗', later: '先練習'
    },

    practice: {
      title: '練習', progress: '進度', question: '第 {i} / {n} 題',
      hint: '提示', next: '下一題', done: '完成練習',
      submit: '提交答案', enterAnswer: '請先輸入答案', answerWas: '正確答案是 {answer}。',
      answerHint: '輸入數字或分數（例如 12、3/4），按 Enter 提交。',
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
      imported: '進度已導入', importedTooLarge: '存檔太大（上限 1 MB）', importBadFormat: '存檔格式不正確', exported: '已復制到剪貼板', empty: '還沒有練習記錄，快開始吧！'
    },

    settings: {
      title: '設置', language: '語言 / Language', sound: '音效',
      theme: '主題', themeLight: '淺色', themeDark: '深色', themeAuto: '跟隨系統',
      soundOn: '已開啟', soundOff: '已關閉', refreshApp: '強制更新到最新版本', reset: '重置所有進度'
    },

    colors: { green: '綠色', orange: '橙色' },

    a11y: {
      skipLink: '跳至主要內容',
      back: '返回',
      settings: '設置',
      stars: '總星星',
      languageZh: '切換語言（英文）',
      languageEn: 'Switch language (Traditional Chinese)',
      choice: '選項 {i}：{text}',
      visual: {
        count: '共 {n} 個圓點',
        compare: '兩組圓點：{a} 個和 {b} 個',
        counters: '用圓點表示 {a} {op} {b}',
        grid: '每行 {b} 個、共 {a} 行的點陣',
        fraction: '圓形分成 {d} 等份，其中 {n} 份塗色',
        triangle: '底 {b} cm、高 {h} cm 的三角形',
        circle: '半徑 {r} cm 的圓形',
        cuboid: '長 {l} cm、闊 {w} cm、高 {h} cm 的長方體',
        plane: '坐標平面上的線段',
        rect: '長 {l} cm、闊 {w} cm 的長方形',
        compass: '指南針',
        cone: '圓錐',
        sphere: '球體',
        pie: '圓形圖，佔 {pct}%',
        cylinder: '圓柱',
        symmetry: '附有對稱軸的圖形',
        righttri: '直角三角形',
        polygon: '{n} 邊形',
        parallel: '平行線與截線',
        angletype: '角度圖',
        angle_acute: '銳角',
        angle_right: '直角',
        angle_obtuse: '鈍角',
        quadri: '四邊形',
        circleang: '圓心角與圓周角',
        clock: '時鐘',
        numberline: '數線',
        barchart: '棒形圖',
        percentgrid: '塗色 {pct}% 的方格圖',
        twotri: '兩個三角形',
        centre: '三角形的四心',
        oddeven: '單數與雙數的圓點',
        shape: '圖形',
        shape_cube: '正方體',
        shape_square: '正方形',
        shape_triangle: '三角形',
        shape_rect: '長方形',
        generic: '題目附圖'
      }
    },

    outline: { title: '課程大綱', covered: '本 app 已有練習' },

    formulas: { title: '公式一覽' },

    challenge: {
      title: '挑戰區',
      desc: '奧林匹克風格的額外難題：數論、計數、幾何、邏輯、代數與概率',
      progress: '已掌握 {m}/{t} 個挑戰',
      hint: '這些題目比年級課程更難，慢慢想、多試幾個方法！'
    },

    update: {
      available: '有新版本',
      reload: '重新載入',
      hint: '更新到最新版本（會重新載入頁面）'
    },

    error: {
      title: '這個畫面暫時打不開',
      body: '別擔心，你的學習進度仍然安全。可以先匯出進度作備份，再回到首頁。',
      export: '匯出進度',
      home: '回到首頁'
    },

    exam: { title: '綜合考試', result: '模擬試卷完成', empty: '此年級暫無可考題目', perfectUnlock: '🎉 滿分！已解鎖下一階段', passUnlock: '🎉 已達標（90%）！已解鎖下一階段', needPass: '取得 90% 或以上即可解鎖下一階段', needPerfect: '考取滿分即可解鎖下一階段' },

    direction: { east: '東', south: '南', west: '西', north: '北' },
    centre: { incentre: '內心', circumcentre: '外心', centroid: '重心', orthocentre: '垂心' },

    common: {
      cancel: '取消', confirm: '確定', close: '關閉', of: '共', masteredShort: '已掌握'
    }
  };

  var en = {
    appName: 'Math Garden',
    tagline: 'Step-by-step math for your child',
    langName: 'English',

    home: { title: 'Choose a Grade', subtitle: 'From Pre-K to College, one step at a time', stars: '⭐ {n} stars', streak: '🔥 {n}-day streak', continue: 'Continue', parent: 'Parent', settings: 'Settings', unlocked: '{u} / {t} stages unlocked', stageCount: '{u}/{t} unlocked', nextHint: 'Score 90% or above on the stage mock exam to unlock the next one' },

    stage: { back: 'Back', goal: 'Goal', unlockedCount: '{u}/{t} unlocked' },

    skill: {
      learn: 'Start', practice: 'Practice', quiz: 'Quiz',
      mastered: 'Mastered', passed: 'Passed', review: 'Review', locked: 'Locked', coming: 'Coming soon',
      unlockHint: 'Pass the previous skill\'s quiz first',
      comingText: 'This stage is coming soon. Stay tuned!'
    },

    lesson: {
      title: 'Lesson', intro: 'Learn', example: 'Example', tip: 'Tip',
      showExample: 'Step-by-step example', nextExample: 'Another one',
      start: 'Start Practice', skip: 'Skip to Quiz', later: 'Practice first'
    },

    practice: {
      title: 'Practice', progress: 'Progress', question: 'Question {i} / {n}',
      hint: 'Hint', next: 'Next', done: 'Finish Practice',
      submit: 'Submit', enterAnswer: 'Please enter an answer first', answerWas: 'The correct answer is {answer}.',
      answerHint: 'Type a number or fraction (e.g. 12, 3/4) and press Enter.',
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
      imported: 'Progress imported', importedTooLarge: 'Save file is too large (1 MB limit)', importBadFormat: 'Not a valid save file', exported: 'Copied to clipboard', empty: 'No practice yet. Let\'s get started!'
    },

    settings: {
      title: 'Settings', language: 'Language / 語言', sound: 'Sound',
      theme: 'Theme', themeLight: 'Light', themeDark: 'Dark', themeAuto: 'Auto',
      soundOn: 'On', soundOff: 'Off', refreshApp: 'Force update to latest', reset: 'Reset all progress'
    },

    colors: { green: 'Green', orange: 'Orange' },

    a11y: {
      skipLink: 'Skip to main content',
      back: 'Back',
      settings: 'Settings',
      stars: 'Total stars',
      languageZh: 'Switch language (English)',
      languageEn: 'Switch language (Traditional Chinese)',
      choice: 'Choice {i}: {text}',
      visual: {
        count: '{n} dots',
        compare: 'Two groups of dots: {a} and {b}',
        counters: '{a} {op} {b} shown with dots',
        grid: 'A grid with {a} rows of {b}',
        fraction: 'A circle split into {d} equal parts, {n} shaded',
        triangle: 'A triangle with base {b} cm and height {h} cm',
        circle: 'A circle with radius {r} cm',
        cuboid: 'A cuboid {l} cm by {w} cm by {h} cm',
        plane: 'A line segment on a coordinate plane',
        rect: 'A rectangle {l} cm by {w} cm',
        compass: 'A compass',
        cone: 'A cone',
        sphere: 'A sphere',
        pie: 'A pie chart showing {pct}%',
        cylinder: 'A cylinder',
        symmetry: 'A shape with lines of symmetry',
        righttri: 'A right-angled triangle',
        polygon: 'A polygon with {n} sides',
        parallel: 'Parallel lines with a transversal',
        angletype: 'An angle diagram',
        angle_acute: 'acute angle',
        angle_right: 'right angle',
        angle_obtuse: 'obtuse angle',
        quadri: 'A quadrilateral',
        circleang: 'A central angle and an inscribed angle',
        clock: 'A clock face',
        numberline: 'A number line',
        barchart: 'A bar chart',
        percentgrid: 'A hundred grid with {pct}% shaded',
        twotri: 'Two triangles',
        centre: 'The four centres of a triangle',
        oddeven: 'Dots showing odd and even numbers',
        shape: 'A shape',
        shape_cube: 'cube',
        shape_square: 'square',
        shape_triangle: 'triangle',
        shape_rect: 'rectangle',
        generic: 'A diagram for the question'
      }
    },

    outline: { title: 'Curriculum Outline', covered: 'covered in this app' },

    formulas: { title: 'Formula Sheet' },

    challenge: {
      title: 'Challenge Arena',
      desc: 'Extra-hard olympiad-style problems: number theory, counting, geometry, logic, algebra and probability',
      progress: '{m}/{t} challenges mastered',
      hint: 'These are harder than the grade lessons — slow down and try more than one method!'
    },

    update: {
      available: 'New version',
      reload: 'Reload',
      hint: 'Update to the latest version (the page will reload)'
    },

    error: {
      title: 'This screen could not be shown',
      body: 'Your progress is still safe. Export it as a backup, or go back home and try again.',
      export: 'Export progress',
      home: 'Back to home'
    },

    exam: { title: 'Mock Exam', result: 'Mock exam complete', empty: 'No questions for this grade yet', perfectUnlock: '🎉 Full marks! Next stage unlocked', passUnlock: '🎉 90% or above — next stage unlocked', needPass: 'Score 90% or above to unlock the next stage', needPerfect: 'Get full marks to unlock the next stage' },

    direction: { east: 'East', south: 'South', west: 'West', north: 'North' },
    centre: { incentre: 'Incentre', circumcentre: 'Circumcentre', centroid: 'Centroid', orthocentre: 'Orthocentre' },

    common: {
      cancel: 'Cancel', confirm: 'OK', close: 'Close', of: 'of', masteredShort: 'Mastered'
    }
  };

  root.I18N = { zh: zh, en: en };
})(typeof window !== 'undefined' ? window : globalThis);
