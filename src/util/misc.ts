export const retry = async <T>(asyncFn: () => Promise<T>, retryCount: number = Infinity): Promise<T> => {
  let tried = 1;
  while (tried <= retryCount) {
    const answer = await asyncFn();
    if (answer) {
      return answer;
    }
    tried++;
    if (isFinite(retryCount)) {
      console.log(`[${tried}/${retryCount}]`);
    }
  }
  return null;
};
