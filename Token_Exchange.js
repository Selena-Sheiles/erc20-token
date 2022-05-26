export default async function getContract(provider) {
    let response = await fetch("./Token_Exchange.json");
    let contract_json = await response.json();
    let contract_abi = contract_json.abi;
    let contract_address = "0x398943aA175D5389B45ff2522547c598A107db99";
    return new ethers.Contract(contract_address, contract_abi, provider);
};