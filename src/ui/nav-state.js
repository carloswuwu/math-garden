/* 導航共享狀態（ESM）：目前 hash 記錄，避免 hashchange/popstate 雙觸發。 */
export const nav = { lastHash: null };
