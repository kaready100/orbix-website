"use strict";

// توکن ORX روی شبکه Polygon
const ORX_TOKEN_ADDRESS = "0xF4EDC72777e2AD20a02caA72b7BF51B7281BdAdE";
const ORX_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

// Web3Modal تنظیمات برای چند کیف پول
const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider.default,
    options: {
      infuraId: "YOUR_INFURA_ID", // اگر لازم نیست خالی بذار
      rpc: {
        137: "https://polygon-rpc.com"
      },
      chainId: 137
    }
  },
  // میشه کیف پول های دیگه رو هم اضافه کرد اینجا
};

// ساخت Web3Modal
const web3Modal = new window.Web3Modal.default({
  cacheProvider: true,
  providerOptions
});

let provider;
let signer;
let contract;

const btnConnect = document.getElementById("btnConnect");
const btnDisconnect = document.getElementById("btnDisconnect");
const walletDetails = document.getElementById("walletDetails");
const walletAddressSpan = document.getElementById("walletAddress");
const tokenBalanceSpan = document.getElementById("tokenBalance");
const networkNameSpan = document.getElementById("networkName");

// نمایش آدرس کوتاه شده
function shortenAddress(address) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

async function connectWallet() {
  try {
    provider = await web3Modal.connect();
    const web3Provider = new ethers.providers.Web3Provider(provider);
    signer = web3Provider.getSigner();

    const network = await web3Provider.getNetwork();
    networkNameSpan.textContent = network.name === "matic" ? "Polygon Mainnet" : network.name;

    const userAddress = await signer.getAddress();
    walletAddressSpan.textContent = shortenAddress(userAddress);

    contract = new ethers.Contract(ORX_TOKEN_ADDRESS, ORX_ABI, web3Provider);

    const rawBalance = await contract.balanceOf(userAddress);
    const decimals = await contract.decimals();
    const formattedBalance = ethers.utils.formatUnits(rawBalance, decimals);
    tokenBalanceSpan.textContent = Number(formattedBalance).toLocaleString();

    walletDetails.style.display = "block";
    btnConnect.style.display = "none";
    btnDisconnect.style.display = "inline-block";

    // Listen for accounts change
    provider.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        walletAddressSpan.textContent = shortenAddress(accounts[0]);
        updateBalance(accounts[0]);
      }
    });

    // Listen for network changes
    provider.on("chainChanged", () => {
      window.location.reload();
    });

  } catch (error) {
    console.error("Connection failed:", error);
    alert("Connection to wallet failed or was cancelled.");
  }
}

async function updateBalance(address) {
  if (!contract) return;
  try {
    const rawBalance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    const formattedBalance = ethers.utils.formatUnits(rawBalance, decimals);
    tokenBalanceSpan.textContent = Number(formattedBalance).toLocaleString();
  } catch (error) {
    console.error("Failed to update balance", error);
  }
}

async function disconnectWallet() {
  if (provider && provider.disconnect && typeof provider.disconnect === "function") {
    await provider.disconnect();
  }
  await web3Modal.clearCachedProvider();
  walletDetails.style.display = "none";
  btnConnect.style.display = "inline-block";
  btnDisconnect.style.display = "none";
  walletAddressSpan.textContent = "";
  tokenBalanceSpan.textContent = "";
  networkNameSpan.textContent = "";
}

btnConnect.addEventListener("click", connectWallet);
btnDisconnect.addEventListener("click", disconnectWallet);

// اگر کیف پول قبلا وصل شده بود، خودکار وصل کن
if (web3Modal.cachedProvider) {
  connectWallet();
}
