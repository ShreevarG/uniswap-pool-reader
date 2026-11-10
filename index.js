
const { ethers } = require("ethers");

const RPC_URL = process.env.RPC_URL;

const FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const factoryABI = [
    "function getPool(address,address,uint24) view returns (address)"
];

const poolABI = [
    "function token0() view returns (address)",
    "function token1() view returns (address)",
    "function fee() view returns (uint24)",
    "function liquidity() view returns (uint128)",
    "function slot0() view returns (uint160,int24,uint16,uint16,uint16,uint8,bool)"
];

async function main() {
    if (!RPC_URL) throw new Error("Missing RPC_URL");

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const network = await provider.getNetwork();

    if (network.chainId !== 1n) {
        throw new Error("Not connected to Ethereum Mainnet");
    }

    const block = await provider.getBlockNumber();

    const factory = new ethers.Contract(FACTORY, factoryABI, provider);

    const poolAddress = await factory.getPool(
        USDC, WETH, 3000, { blockTag: block }
    );

    if (poolAddress === ethers.ZeroAddress) {
        throw new Error("Pool not found");
    }

    const pool = new ethers.Contract(poolAddress, poolABI, provider);

    const [token0, token1, fee, liquidity, slot0] =
        await Promise.all([
            pool.token0({ blockTag: block }),
            pool.token1({ blockTag: block }),
            pool.fee({ blockTag: block }),
            pool.liquidity({ blockTag: block }),
            pool.slot0({ blockTag: block })
        ]);

    console.log("Network: Ethereum Mainnet");
    console.log("Block:", block);
    console.log("Pool:", poolAddress);
    console.log("Token0:", token0);
    console.log("Token1:", token1);
    console.log("Fee:", fee.toString());
    console.log("Liquidity:", liquidity.toString());
    console.log("sqrtPriceX96:", slot0[0].toString());
    console.log("Current tick:", slot0[1].toString());
    console.log("Unlocked:", slot0[6]);
}

main().catch(console.error);
