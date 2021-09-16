const BN = web3.utils.BN;
const IBFR = artifacts.require("IBFR");
const WBNBFarm = artifacts.require("Farm");

module.exports = async function (deployer, network, [account]) {
  if (network === "development") {
    const WBNB = "0x094616F0BdFB0b526bD735Bf66Eca0Ad254ca81F";

    await deployer.deploy(IBFR);
    await IBFR.deployed();

    // await deployer.deploy(
    //   WBNBFarm,
    //   IBFR.address,
    //   WBNB,
    //   StakingBNB.address,
    //   BNBPool.address
    // );
  } else {
    const iBFR = "0xa9377a4700a23BF0FCA539553C4979CF904Aa726";
    const WBNB = "0x094616F0BdFB0b526bD735Bf66Eca0Ad254ca81F";
    const rewardPerBlock = 100;
    const startBlock = 12422538;
    const bonusEndBlock = 12423538;

    // await deployer.deploy(IBFR);
    // await IBFR.deployed();

    await deployer.deploy(
      WBNBFarm,
      iBFR,
      WBNB,
      rewardPerBlock,
      startBlock,
      bonusEndBlock
    );
  }
};
