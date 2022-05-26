import getSellContract from "./Token_Exchange.js";
import getERC20Token from "./ERC20_Token.js";

const provider = new ethers.providers.Web3Provider(window.ethereum);

var Token_Exchange, Token_KEEY, Token_USDT;

var _accountAddress, accountAddress,
    _userBalance, userBalance,
    _userBalanceKEEY, userBalanceKEEY,
    _exchangePrice, exchangePrice,
    _currentAllowance, currentAllowance,
    _newAllowance, _buyingAmount;

async function onLoad() {
    loadDocElements();
    
    await provider.send('eth_requestAccounts', []);
    
    Token_Exchange = await getSellContract(provider);
    
    let addressTokenKEEY = await Token_Exchange.tokenOwner();
    Token_KEEY = await getERC20Token(addressTokenKEEY, provider);
    
    let addressTokenUSDT = await Token_Exchange.tokenBuyer();
    Token_USDT = await getERC20Token(addressTokenUSDT, provider);
    
    updateDisplay();
}

async function updateDisplay() {
    await updateData();
    
    _accountAddress.innerHTML = accountAddress;
    _userBalance.innerHTML = await displayValue(Token_USDT, userBalance);
    _userBalanceKEEY.innerHTML = await displayValue(Token_KEEY, userBalanceKEEY);
    _exchangePrice.innerHTML = exchangePrice;
    _currentAllowance.innerHTML = await displayValue(Token_USDT, currentAllowance);
    _newAllowance.value = "";
    _buyingAmount.value = "";
}

async function updateData() {
    accountAddress = await provider.getSigner().getAddress();
    userBalance = await Token_USDT.balanceOf(accountAddress);
    userBalanceKEEY = await Token_KEEY.balanceOf(accountAddress);
    exchangePrice = await Token_Exchange.exchangeRate();
    currentAllowance = await Token_USDT.allowance(accountAddress, Token_Exchange.address);
}

async function buyKEEY() {
    let amount = await rawValue(Token_KEEY, _buyingAmount.value);
    if (amount <= 0) {
        console.log("Cannot attempt to buy non-positive amount of KEEY.");
        return;
    }
    
    await updateData();
    
    if (userBalance < amount * exchangePrice) {
        console.log("Insufficient balance. Please get more USDT.");
        return;
    }
    if (currentAllowance < amount * exchangePrice) {
        console.log("Insufficient allowance. Please approve more USDT.");
        return;
    }
    
    let signerContract = Token_Exchange.connect(provider.getSigner());
    signerContract.buyToken(BigNumber(amount).toFixed()).then(response => {
        console.log("Transaction pending...");
        return response.wait(5);
    }).then(receipt => {
        console.log("Transaction successful.");
        console.log(receipt);
        updateDisplay();
    }).catch(error => {
        console.log(error);
    });
}

async function approveUSDT() {
    let amount = await rawValue(Token_USDT, _newAllowance.value);
    if (amount < 0) {
        console.log("Cannot attempt to approve negative amount of USDT.");
        return;
    }
    
    await updateData();
    
    let signerContract = Token_USDT.connect(provider.getSigner());
    signerContract.approve(Token_Exchange.address, BigNumber(amount).toFixed()).then(response => {
        console.log("Transaction pending...");
        return response.wait(5);
    }).then(receipt => {
        console.log("Transaction successful.");
        console.log(receipt);
        updateDisplay();
    }).catch(error => {
        console.log(error);
    });
}

async function displayValue(ERC20_Token, rawValue) {
    let decimals = await ERC20_Token.decimals();
    return rawValue / (10 ** decimals);
}

async function rawValue(ERC20_Token, displayValue) {
    let decimals = await ERC20_Token.decimals();
    return displayValue * (10 ** decimals);
}

function loadDocElements() {
    _accountAddress = document.querySelector("#account-address");
    _userBalance = document.querySelector("#user-balance");
    _userBalanceKEEY = document.querySelector("#user-balance-KEEY");
    _exchangePrice = document.querySelector("#exchange-price");
    _currentAllowance = document.querySelector("#current-allowance");
    _newAllowance = document.querySelector("#new-allowance");
    _buyingAmount = document.querySelector("#buying-amount");
    document.querySelector("#button-approve").onclick = approveUSDT;
    document.querySelector("#button-buy").onclick = buyKEEY;
    document.querySelector("#button-refresh").onclick = updateDisplay;
}

onLoad();