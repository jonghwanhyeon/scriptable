const {toAsyncFunction} = importModule('utils');

module.exports = async (title, func) => {
  func = toAsyncFunction(func);
  
  const start = new Date();
  const result = await func();
  const end = new Date();

  const elapsed = (end.getTime() - start.getTime());
  const readable = (elapsed >= 100) ? `${(elapsed / 1000).toFixed(4)}s` : `${elapsed}ms`;
  console.log(`[Profile] ${readable} ~ ${title}`)
  return result;
}