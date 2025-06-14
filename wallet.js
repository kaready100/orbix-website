// wallet.js

// Load WalletConnectProvider script dynamically for walletconnect
function loadWalletConnectProviderScript() {
  return new Promise((resolve) => {
    if (window.WalletConnectProvider) {
      resolve();
    } else {
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/@walletconnect/web3-provider@1.7.8/dist/umd/index.min.js";
      script.onload = () => resolve();
      document.head.appendChild(script);
    }
  });
}

let web3Modal;
let provider;
let signer;

const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider,
    options: {
      rpc: {
        137: "https://polygon-rpc.com"
      },
      chainId: 137,
    }
  }
};

async function initWallet() {
  await loadWalletConnectProviderScript();

  web3Modal = new window.Web3Modal.default({
    cacheProvider: true,
    providerOptions
  });

  if (web3Modal.cachedProvider) {
    connectWallet();
  }
}

async function connectWallet() {
  try {
    provider = await web3Modal.connect();
    const ethersProvider = new ethers.providers.Web3Provider(provider);

    const network = await ethersProvider.getNetwork();
    if (network.chainId !== 137) {
      alert("Please switch your wallet network to Polygon Mainnet.");
    }

    signer = ethersProvider.getSigner();
    const address = await signer.getAddress();
    updateUI(address);

    provider.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        resetUI();
      } else {
        updateUI(accounts[0]);
      }
    });

    provider.on("chainChanged", (chainId) => {
      if (parseInt(chainId, 16) !== 137) {
        alert("Please switch your wallet network to Polygon Mainnet.");
      }
    });

    provider.on("disconnect", () => {
      resetUI();
    });
  } catch (err) {
    console.error("Could not get a wallet connection", err);
  }
}

function updateUI(address) {
  const walletInfo = document.getElementById("walletInfo");
  walletInfo.textContent = `Connected: ${address}`;
  document.getElementById("walletBtn").textContent = "Disconnect Wallet";
}

function resetUI() {
  const walletInfo = document.getElementById("walletInfo");
  walletInfo.textContent = "Wallet not connected.";
  document.getElementById("walletBtn").textContent = "Connect Wallet";
}

document.getElementById("walletBtn").addEventListener("click", async () => {
  if (provider) {
    if (web3Modal) {
      await web3Modal.clearCachedProvider();
    }
    if (provider.disconnect && typeof provider.disconnect === "function") {
      await provider.disconnect();
    }
    provider = null;
    resetUI();
  } else {
    connectWallet();
  }
});

initWallet();
