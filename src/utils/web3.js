const { ethers } = require("ethers")
const { aggregate } = require('@makerdao/multicall')

const multiConfig = {
    rpcUrl: process.env.RPC_URL,
    multicallAddress: process.env.MULTICALL_ADDRESS,
}

const SlimeContract = '0x68503A15efD0D2F81D185a07d60Ed9Ac2a66B59e'

async function getSlimeBalance(ethAddrs) {
    if (!Array.isArray(ethAddrs)) {
        ethAddrs = [ethAddrs];
    }
    ethAddrs = ethAddrs.filter(ethAddr => ethers.isAddress(ethAddr));
    if (ethAddrs.length === 0) {
        return [];
    }
    const res = await aggregate(ethAddrs.map(a => ({
        target: SlimeContract,
        call: [
            'balanceOf(address)(uint256)',
            a
        ],
        returns: [
            [a, val => val / 1e18]
        ]
    })), multiConfig)

    return res.results.transformed;
}

module.exports = {
    getSlimeBalance
}