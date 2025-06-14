import { ethers } from "https://cdn.ethers.io/lib/ethers-5.6.esm.min.js";
import { EthereumClient, w3mConnectors, w3mProvider } from "https://cdn.jsdelivr.net/npm/@web3modal/ethereum@2.8.0/+esm";
import { Web3Modal } from "https://cdn.jsdelivr.net/npm/@web3modal/html@2.8.0/+esm";
import { configureChains, createConfig, WagmiConfig } from "https://cdn.jsdelivr.net/npm/@wagmi/core@1.3.0/+esm";
import { polygon } from "https://cdn.jsdelivr.net/npm/@wagmi/chains@1.3.0/+esm";

const ORX_TOKEN_ADDRESS = "0xF4EDC72777e2AD20a02caA72b7BF51B7281BdAdE";
const ORX_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const { chains, publicClient } = configureChains([polygon], [w3mProvider({ projectId: 'WALLETCONNECT_PROJECT_ID' })]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId: 'WALLETCONNECT_PROJECT_ID', chains }),
  publicClient,
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);
const modal = new Web3Modal({ projectId: 'WALLETCONNECT_PROJECT_ID', themeMode: "dark" }, ethereumClient);

document.getElementById("connectWalletBtn").addEventListener("click", async () => {
  try {
    await modal.openModal();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    const token = new ethers.Contract(ORX_TOKEN_ADDRESS, ORX_ABI, provider);
    const balance = await token.balanceOf(userAddress);
    const decimals = await token.decimals();
    const formatted = ethers.utils.formatUnits(balance, decimals);

    document.getElementById("walletSection").classList.remove("hidden");
    document.getElementById("address").innerText = `Wallet: ${userAddress}`;
    document.getElementById("balance").innerText = `ORX Balance: ${formatted}`;
  } catch (err) {
    console.error("Wallet connection failed:", err);
    alert("Could not connect to wallet.");
  }
});
