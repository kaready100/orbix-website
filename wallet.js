import { ethers } from "https://cdn.ethers.io/lib/ethers-5.6.esm.min.js";
import Web3Modal from "https://cdn.jsdelivr.net/npm/web3modal@1.9.5/dist/index.js";

const ORX_TOKEN_ADDRESS = "0xF4EDC72777e2AD20a02caA72b7BF51B7281BdAdE";
const ORX_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const connectWalletBtn = document.getElementById("connectWalletBtn");
const walletSection = document.getElementById("walletSection");
const addressDiv = document.getElementById("address");
const balanceDiv = document.getElementById("balance");

async function connectWallet() {
  try {
    const web3Modal = new Web3Modal.default({
      cacheProvider: false,
      providerOptions: {},
    });

    const instance = await web3Modal.connect();

    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    addressDiv.innerText = `Wallet: ${userAddress}`;
    walletSection.classList.remove("hidden");

    const token = new ethers.Contract(ORX_TOKEN_ADDRESS, ORX_ABI, provider);
    const balance = await token.balanceOf(userAddress);
    const decimals = await token.decimals();
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);

    balanceDiv.innerText = `ORX Balance: ${formattedBalance}`;
  } catch (err) {
    console.error("Connection error:", err);
    alert("MetaMask connection failed. Make sure you have it installed and the correct network (Polygon) selected.");
  }
}

connectWalletBtn.addEventListener("click", connectWallet);
