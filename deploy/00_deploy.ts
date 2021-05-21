import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";

const func: DeployFunction =  async (hre: HardhatRuntimeEnvironment) => {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;
  const {deployer, lido, weth, curvePool, oneSplit} = await getNamedAccounts();

  if (!lido) {
    throw new Error('lido must be defined as a named account')
  }

  if (!weth) {
    throw new Error('weth must be defined as a named account')
  }

  if (!curvePool) {
    throw new Error('curvePool must be defined as a named account')
  }

  if (!oneSplit) {
    throw new Error('oneSplit must be defined as a named account')
  }

  console.time("LidoYieldSource deployed");
  const contract = await deploy('LidoYieldSource', {
    from: deployer,
    args: [lido, weth, curvePool, oneSplit],
    log: true,
  });

  console.timeEnd("LidoYieldSource deployed");
  console.log("LidoYieldSource address:", contract.address);
};

export default func
module.exports.tags = ['LidoYieldSource']