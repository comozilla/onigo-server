export default class RankingMaker {
  constructor() {
  }
  make(controllers) {
    const controllerNames = Object.keys(controllers);
    // indexが順位となっている
    // [ { hp: 100, name: "xxx" }, { hp: 80, name: "xxx" }, ...]
    const ranking = controllerNames.filter(name => {
      // まず鬼であるものを除外する
      return controllers[name].linkedOrb !== null && !controllers[name].isOni;
    }).sort((a, b) => {
      // HPに基づき、降順にソートする
      return controllers[b].hp - controllers[a].hp;
    }).map((name, index, array) => {
      // 必要な情報のみを取り出した新しい配列を生成する
      return {
        name,
        states: controllers[name].getStates(),
        isTie: index > 0 && controllers[name].hp === controllers[array[index - 1]].hp
      };
    });
    // [name, name, ...]
    const onis = controllerNames.filter(name => controllers[name].isOni);
    return { ranking, onis };
  }
}
