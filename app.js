
const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider.default,
    options: {
      infuraId: "1e389cd3f87b4e889a60f711fde4cddb"
    }
  }
};

const web3Modal = new window.Web3Modal.default({
  cacheProvider: false,
  providerOptions
});

const ORX_TOKEN_ADDRESS = "0xF4EDC72777e2AD20a02caA72b7BF51B7281BdAdE";
const ORX_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

document.getElementById("connectWallet").onclick = async () => {
  try {
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    document.getElementById("userAddress").innerText = address;
    document.getElementById("networkName").innerText = network.name;

    const token = new ethers.Contract(ORX_TOKEN_ADDRESS, ORX_TOKEN_ABI, provider);
    const balanceRaw = await token.balanceOf(address);
    const decimals = await token.decimals();
    const balance = ethers.utils.formatUnits(balanceRaw, decimals);
    document.getElementById("tokenBalance").innerText = balance;
    document.getElementById("walletInfo").classList.remove("hidden");
  } catch (err) {
    console.error("Connection failed:", err);
  }
};
