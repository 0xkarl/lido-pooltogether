const { ethers } = require('hardhat');
const { solidity } = require('ethereum-waffle');
const chai = require('chai');

chai.use(solidity);
const toWei = ethers.utils.parseEther;
const toEth = ethers.utils.formatEther;
const { expect } = chai;

let overrides = { gasLimit: 9500000 };

describe('LidoYieldSource', function () {
  let lido;
  let curvePool;
  let yieldSource;

  let wallet;
  let wallet2;
  let wallet3;
  let amount;

  beforeEach(async function () {
    [wallet, wallet2, wallet3] = await ethers.getSigners();

    const LidoContract = await ethers.getContractFactory(
      'Lido',
      wallet,
      overrides
    );
    lido = await LidoContract.deploy();

    const CurvePoolContract = await ethers.getContractFactory(
      'CurvePool',
      wallet,
      overrides
    );
    curvePool = await CurvePoolContract.deploy();

    const OneSplitContract = await ethers.getContractFactory(
      'OneSplitMock',
      wallet,
      overrides
    );
    oneSplit = await OneSplitContract.deploy();

    const LidoYieldSourceContract = await ethers.getContractFactory(
      'LidoYieldSource'
    );
    yieldSource = await LidoYieldSourceContract.deploy(
      lido.address,
      wethAddr,
      curvePool.address,
      overrides
    );

    // let wallet2 stake some eth into lido
    amount = toWei('100');
    await lido.connect(wallet2).submit(0, wallet2.address, {value: amount.mul(99)});
  });

  it('get token address', async function () {
    let address = await yieldSource.depositToken();
    expect(address == lido);
  });

  it.only('balanceOfToken', async function () {
    expect(await yieldSource.callStatic.balanceOfToken(wallet3.address)).to.eq(
      0
    );
    expect(await lido.callStatic.balanceOf(wallet3.address)).to.eq(
      amount
    );
    await lido.connect(wallet3).approve(yieldSource.address, amount);
    await yieldSource.connect(wallet3).supplyTokenTo(amount, wallet3.address);
    expect(await yieldSource.callStatic.balanceOfToken(wallet3.address)).to.eq(
      amount
    );
    expect(await lido.callStatic.balanceOf(wallet3.address)).to.eq(
      0
    );
  });

  it('supplyTokenTo', async function () {
    await lido.connect(wallet3).approve(yieldSource.address, amount);
    await yieldSource.connect(wallet3).supplyTokenTo(amount, wallet3.address);
    expect(await lido.balanceOf(lido.address)).to.eq(amount.mul(100));
    expect(await yieldSource.callStatic.balanceOfToken(wallet3.address)).to.eq(
      amount
    );
  });

  it('redeemToken', async function () {
    await lido.connect(wallet3).approve(yieldSource.address, amount);
    await yieldSource.connect(wallet3).supplyTokenTo(amount, wallet3.address);

    expect(await lido.balanceOf(wallet3.address)).to.eq(0);
    await yieldSource.connect(wallet3).redeemToken(amount);
    expect(await lido.balanceOf(wallet3.address)).to.eq(amount);
  });

  [toWei('100'), toWei('100').mul(10), toWei('100').mul(99)].forEach(function (
    amountToDeposit
  ) {
    it(
      'deposit ' + toEth(amountToDeposit) + ', stETH accrues, withdrawal',
      async function () {
        await lido.mint(wallet3.address, amountToDeposit.sub(amount));
        await lido
          .connect(wallet3)
          .approve(yieldSource.address, amountToDeposit);
        await yieldSource.connect(wallet3).supplyTokenTo(amountToDeposit, wallet3.address);
        // increase total balance by amount
        await lido.mint(lido.address, amount);

        const totalAmount = await yieldSource.callStatic.balanceOfToken(
          wallet3.address
        );
        const expectedAmount = amountToDeposit
          .mul(amountToDeposit.add(amount.mul(100)))
          .div(amountToDeposit.add(amount.mul(99)));
        expect(totalAmount).to.eq(expectedAmount);

        await yieldSource.connect(wallet3).redeemToken(totalAmount);
        expect(await lido.balanceOf(wallet3.address)).to.be.closeTo(
          totalAmount,
          1
        );
      }
    );
  });
});
