export default async function (contract_address, provider) {
    let response = await fetch("./ERC20_Token.json");
    let contract_json = await response.json();
    let contract_abi = contract_json.abi;
    return new ethers.Contract(contract_address, contract_abi, provider);
}