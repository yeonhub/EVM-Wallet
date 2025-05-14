export const RPC_ENDPOINTS = [
  {
    name: "LlamaRPC",
    url: "https://eth.llamarpc.com",
  },
  {
    name: "PublicNode",
    url: "https://ethereum.publicnode.com",
  },
  {
    name: "1RPC",
    url: "https://1rpc.io/eth",
  },
  {
    name: "Flashbots",
    url: "https://rpc.flashbots.net",
  },
  {
    name: "Cloudflare",
    url: "https://cloudflare-eth.com",
  },
];

export const RPC_URL = RPC_ENDPOINTS[0].url;

export const CTC_CONTRACT = "0xd7b45e0cdae4c65ef2c7e19152eeb3074e20f98f";
export const GCRE_CONTRACT = "0xa3ee21c306a700e682abcdfe9baa6a08f3820419";

export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];
