"use strict";

const ORX_TOKEN_ADDRESS = "0xF4EDC72777e2AD20a02caA72b7BF51B7281BdAdE";
const ORX_SYMBOL = "ORX";
const ORX_DECIMALS = 18;
const ORX_LOGO = "https://i.ibb.co/F7YxXTG/orx-logo.png"; // تغییر بده به لوگوی واقعی

let provider;
let web3Modal;
let signer;
let contract;

const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider.default,
    options: {
      rpc: {
        137: "https://polygon-rpc.com"
      },
      chainId: 137
    }
  }
};

const btnConnect = document.getElementById("btnConnect");
const btnDisconnect = document.getElementById("btnDisconnect");
const walletDetails = document.getElementById("walletDetails");
const walletAddressSpan = document.getElementById("walletAddress");
const tokenBalanceSpan = document.getElementById("tokenBalance");
const networkNameSpan = document.getElementById("networkName");
const btnAddToken = document.getElementById("addToken");

function shorten(address) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

async function connectWallet() {
  try {
    web3Modal = new window.Web3Modal.default({
      cacheProvider: true,
      providerOptions
    });

    provider = await web3Modal.connect();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    signer = ethersProvider.getSigner();

    const network = await ethersProvider.getNetwork();
    networkNameSpan.textContent = network.name === "matic" ? "Polygon" : network.name;

    const userAddress = await signer.getAddress();
    walletAddressSpan.textContent = shorten(userAddress);

    const abi = [
      "function balanceOf(address) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];
    contract = new ethers.Contract(ORX_TOKEN_ADDRESS, abi, ethersProvider);

    const rawBalance = await contract.balanceOf(userAddress);
    const formatted = ethers.utils.formatUnits(rawBalance, ORX_DECIMALS);
    tokenBalanceSpan.textContent = Number(formatted).toLocaleString();

    walletDetails.style.display = "block";
    btnConnect.style.display = "none";
    btnDisconnect.style.display = "inline-block";

    provider.on("accountsChanged", () => window.location.reload());
    provider.on("chainChanged", () => window.location.reload());
  } catch (e) {
    alert("Wallet connect failed.");
    console.error(e);
  }
}

async function disconnectWallet() {
  if (provider?.disconnect) await provider.disconnect();
  if (web3Modal) await web3Modal.clearCachedProvider();

  btnConnect.style.display = "inline-block";
  btnDisconnect.style.display = "none";
  walletDetails.style.display = "none";
}

btnConnect.addEventListener("click", connectWallet);
btnDisconnect.addEventListener("click", disconnectWallet);

btnAddToken.addEventListener("click", async () => {
  try {
    const wasAdded = await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: ORX_TOKEN_ADDRESS,
          symbol: ORX_SYMBOL,
          decimals: ORX_DECIMALS,
          image: ORX_LOGO
        }
      }
    });

    if (wasAdded) {
      alert("ORX token added to MetaMask!");
    } else {
      alert("User canceled adding token.");
    }
  } catch (e) {
    console.error("Failed to add token:", e);
  }
});

// Auto-connect if cached
window.addEventListener("load", () => {
  web3Modal = new window.Web3Modal.default({
    cacheProvider: true,
    providerOptions
  });

  if (web3Modal.cachedProvider) {
    connectWallet();
  }
});
