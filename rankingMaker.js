export default class RankingMaker {
  constructor() {
  }
  make(controllers) {
    // indexが順位となっている
    // [ { hp: 100, key: "xxx" }, { hp: 80, key: "xxx" }, ...]
    const ranking = Object.keys(controllers).filter(key => {
      // まず鬼であるものを除外する
      return !controllers[key].isOni;
    }).sort((a, b) => {
      // HPに基づき、降順にソートする
      return controllers[b].hp - controllers[a].hp;
    }).map(key => {
      // 必要な情報のみを取り出した新しい配列を生成する
      return {
        key,
        hp: controllers[key].hp
      };
    });
    // [key, key, ...]
    const onis = Object.keys(controllers).filter(key => controllers[key].isOni);
    return { ranking, onis };
  }
}
