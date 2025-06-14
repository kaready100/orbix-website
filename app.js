
const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider.default,
    options: {
      rpc: {
        137: "https://polygon-rpc.com"
      }
    }
  }
};

const web3Modal = new window.Web3Modal.default({
  network: "polygon",
  cacheProvider: true,
  providerOptions
});

let provider;
let signer;
let userAddress;

const ORX_ADDRESS = "0xF4EDC72777e2AD20a02caA72b7BF51B7281BdAdE";
const ORX_ABI = [
  { "constant":true, "inputs":[{ "name":"_owner", "type":"address" }],
    "name":"balanceOf", "outputs":[{ "name":"balance", "type":"uint256" }],
    "type":"function"
  },
  { "constant":true, "inputs":[], "name":"decimals", "outputs":[{ "name":"","type":"uint8" }], "type":"function" }
];

document.getElementById("connectButton").onclick = async () => {
  try {
    provider = await web3Modal.connect();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    signer = ethersProvider.getSigner();
    userAddress = await signer.getAddress();
    document.getElementById("userAddress").textContent = userAddress;

    const network = await ethersProvider.getNetwork();
    document.getElementById("networkName").textContent = network.name + " (" + network.chainId + ")";

    const token = new ethers.Contract(ORX_ADDRESS, ORX_ABI, signer);
    const decimals = await token.decimals();
    const rawBalance = await token.balanceOf(userAddress);
    const formatted = ethers.utils.formatUnits(rawBalance, decimals);
    document.getElementById("orxBalance").textContent = formatted + " ORX";
  } catch (e) {
    console.error("Connection failed", e);
  }
};
