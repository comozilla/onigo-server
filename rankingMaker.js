export default class RankingMaker {
  constructor() {
  }
  make(controllers) {
    const controllerKeys = Object.keys(controllers);
    // indexが順位となっている
    // [ { hp: 100, key: "xxx" }, { hp: 80, key: "xxx" }, ...]
    const ranking = controllerKeys.filter(key => {
      // まず鬼であるものを除外する
      return !controllers[key].isOni;
    }).sort((a, b) => {
      // HPに基づき、降順にソートする
      return controllers[b].hp - controllers[a].hp;
    }).map((key, index, array) => {
      // 必要な情報のみを取り出した新しい配列を生成する
      return {
        key,
        hp: controllers[key].hp,
        isTie: index > 0 && controllers[key].hp === controllers[array[index - 1]].hp
      };
    });
    // [key, key, ...]
    const onis = controllerKeys.filter(key => controllers[key].isOni);
    return { ranking, onis };
  }
}
