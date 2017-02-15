import assert from "assert";
import RankingMaker from "../rankingMaker";
import controllerModel from "../model/controllerModel";
import sinon from "sinon";
import publisher from "../publisher";

describe("RankingMaker", () => {
  describe("#make", () => {
    const rankingMaker = new RankingMaker();
    controllerModel.controllers = {
      controller1: {
        linkedOrb: "orb1",
        isOni: false,
        hp: 80,
        getStates() { return "states"; }
      },
      controller2: {
        linkedOrb: "orb2",
        isOni: false,
        hp: 100,
        getStates() { return "states"; }
      },
      controller3: {
        linkedOrb: "orb3",
        isOni: false,
        hp: 80,
        getStates() { return "states"; }
      },
      oni1: {
        linkedOrb: "orb4",
        isOni: true,
        hp: 100,
        getStates() { return "oni-states"; }
      }
    };

    const makeSpy = sinon.spy(rankingMaker, "make");
    let rankingDetails;
    publisher.subscribe("ranking", (author, ranking) => {
      it("should publish ranking", () => {
        assert(author === rankingMaker);
        rankingDetails = ranking;
      });
    });

    rankingMaker.make("show");

    it("should be called", () => {
      assert(makeSpy.withArgs("show").called);
    });

    it("should return correct ranking", () => {
      assert(typeof rankingDetails.ranking !== "undefined");
      assert.equal(rankingDetails.ranking.length, 3);
      assert.deepEqual(rankingDetails.ranking[0], { name: "controller2", states: "states", isTie: false });
      assert.deepEqual(rankingDetails.ranking[1], { name: "controller1", states: "states", isTie: false });
      assert.deepEqual(rankingDetails.ranking[2], { name: "controller3", states: "states", isTie: true });
    });

    it("should return correct onis", () => {
      assert(typeof rankingDetails.onis !== "undefined");
      assert(typeof rankingDetails.onis["oni1"] !== "undefined");
      assert.equal(rankingDetails.onis["oni1"], "oni-states");
    });

    makeSpy.restore();
  });
});
