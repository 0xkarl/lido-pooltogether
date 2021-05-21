// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.6.12;

import {
    IYieldSource
} from "@pooltogether/yield-source-interface/contracts/IYieldSource.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ILido.sol";
import "./ICurvePool.sol";
import "hardhat/console.sol";

/// @title A pooltogether yield source for lido staking
/// @author 0xkarl
contract LidoYieldSource is IYieldSource {
    using SafeMath for uint256;

    address constant ONE_SPLIT_ETH_ADDRESS =
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    address public lidoAddr;
    address public wethAddr;
    address public curvePoolAddr;
    address public oneSplitAddr;
    mapping(address => uint256) public balances;

    constructor(
        address _lidoAddr,
        address _wethAddr,
        address _curvePoolAddr,
        address _oneSplitAddr
    ) public {
        lidoAddr = _lidoAddr;
        curvePoolAddr = _curvePoolAddr;
        wethAddr = _wethAddr;
        oneSplitAddr = _oneSplitAddr;
    }

    /// @notice Returns the ERC20 asset token used for deposits.
    /// @return The ERC20 asset token
    function depositToken() public view override returns (address) {
        return (wethAddr);
    }

    /// @notice Returns the total balance (in asset tokens).  This includes the deposits and interest.
    /// @return The underlying balance of asset tokens
    function balanceOfToken(address addr) public override returns (uint256) {
        if (balances[addr] == 0) return 0;
        ILido lido = ILido(lidoAddr);

        uint256 shares = lido.balanceOf(address(this));
        uint256 totalShares = lido.totalSupply();

        uint256 lidoBalance = shares.mul(lido.balance()).div(totalShares);
        uint256 sourceShares = lido.balanceOf(address(this));

        return (balances[addr].mul(lidoBalance).div(sourceShares));
    }

    /// @notice Allows assets to be supplied on other user's behalf using the `to` param.
    /// @param amount The amount of `token()` to be supplied
    /// @param to The user whose balance will receive the tokens
    function supplyTokenTo(uint256 amount, address to) public override {
        IERC20 weth = IERC20(wethAddr);
        ILido lido = ILido(lidoAddr);
        IOneSplitAudit oneSplit = IOneSplitAudit(oneSplitAddr);

        weth.transferFrom(msg.sender, address(this), amount);
        weth.approve(lidoAddr, amount);

        // swap weth to eth using 1inch
        uint256[] parts = []; // todo
        (minReturn, distribution) = oneSplit.getExpectedReturn(
            wethAddr,
            ONE_SPLIT_ETH_ADDRESS,
            amount,
            parts,
            0
        );
        oneSplit.swap(
            wethAddr,
            ONE_SPLIT_ETH_ADDRESS,
            minReturn,
            distribution,
            parts,
            0
        );

        uint256 beforeBalance = lido.balanceOf(address(this));
        lido.submit(0){value: address(this).balance}; // send all eth balance obtained from 1inch
        uint256 afterBalance = lido.balanceOf(address(this));
        uint256 balanceDiff = afterBalance.sub(beforeBalance);
        balances[to] = balances[to].add(balanceDiff);
    }

    /// @notice Redeems tokens from the yield source from the msg.sender, it burn yield bearing tokens and return token to the sender.
    /// @param amount The amount of `token()` to withdraw.  Denominated in `token()` as above.
    /// @return The actual amount of tokens that were redeemed.
    function redeemToken(uint256 amount) public override returns (uint256) {
        // ILido lido = ILido(lidoAddr);
        // ICurvePool curvePool = ICurvePool(curvePoolAddr);

        // uint256 lidoBeforeBalance = lido.balanceOf(address(this));

        // lido.approve(curvePoolAddr, amount);
        // int128 i = 0;
        // int128 j = 0;
        // uint256 dx = 0;
        // uint256 minDy = 0;
        // curvePool.exchange(amount, i, j, dx, minDy);

        // uint256 lidoAfterBalance = lido.balanceOf(address(this));
        // uint256 lidoBalanceDiff = lidoBeforeBalance.sub(lidoAfterBalance);
        // balances[msg.sender] = balances[msg.sender].sub(lidoBalanceDiff);
        // return (lidoBalanceDiff);
        return (0);
    }
}
