import { ethers } from "https://cdn.ethers.io/lib/ethers-5.6.esm.min.js";
import { Web3Modal } from "https://cdn.jsdelivr.net/npm/@web3modal/html@2.8.0/+esm";
import { EthereumClient, w3mConnectors, w3mProvider } from "https://cdn.jsdelivr.net/npm/@web3modal/ethereum@2.8.0/+esm";
import { configureChains, createConfig } from "https://cdn.jsdelivr.net/npm/@wagmi/core@1.3.0/+esm";
import { polygon } from "https://cdn.jsdelivr.net/npm/@wagmi/chains@1.3.0/+esm";

const WALLETCONNECT_PROJECT_ID = "c5f160fc1c2fc9783c7ee1cd12402130";

const ORX_TOKEN_ADDRESS = "0xF4EDC72777e2AD20a02caA72b7BF51B7281BdAdE";
const ORX_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

// تنظیم شبکه پولیگون و اتصال ولت‌ها
const { chains, publicClient } = configureChains(
  [polygon],
  [w3mProvider({ projectId: WALLETCONNECT_PROJECT_ID })]
);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({
    projectId: WALLETCONNECT_PROJECT_ID,
    chains
  }),
  publicClient,
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

const web3Modal = new Web3Modal(
  {
    projectId: WALLETCONNECT_PROJECT_ID,
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent-color": "#4f46e5",
    },
  },
  ethereumClient
);

const connectBtn = document.getElementById("connectBtn");
const walletInfo = document.getElementById("walletInfo");
const addressDiv = document.getElementById("address");
const balanceDiv = document.getElementById("balance");

connectBtn.addEventListener("click", async () => {
  try {
    await web3Modal.openModal();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const tokenContract = new ethers.Contract(ORX_TOKEN_ADDRESS, ORX_ABI, provider);
    const balanceRaw = await tokenContract.balanceOf(address);
    const decimals = await tokenContract.decimals();
    const balance = ethers.utils.formatUnits(balanceRaw, decimals);

    addressDiv.textContent = `Address: ${address}`;
    balanceDiv.textContent = `ORX Balance: ${balance}`;
    walletInfo.style.display = "block";
  } catch (err) {
    console.error(err);
    alert("Wallet connection failed. Please try again.");
  }
});
