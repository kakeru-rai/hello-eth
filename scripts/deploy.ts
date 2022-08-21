import { Contract } from "ethers";
import { ethers, network, artifacts } from "hardhat";
// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const path = require("path");

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const contractName = "Token";
  const contractFactory = await ethers.getContractFactory(contractName);
  const contract = await contractFactory.deploy();
  await contract.deployed();

  console.log(contractName + " contract address:", contract.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(contract, contractName);
}

function saveFrontendFiles(contract: Contract, contractName: string) {
  const fs = require("fs");
  const contractsDir = path.join(
    __dirname,
    "..",
    "frontend",
    "src",
    "contracts"
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // デプロイしたコントラクトのアドレスをアドレスリストに追加する
  const contractAddressPath = path.join(contractsDir, "contract-address.json");
  const addressJson = JSON.parse(fs.readFileSync(contractAddressPath));
  addressJson[contractName] = contract.address;

  fs.writeFileSync(
    contractAddressPath,
    JSON.stringify(addressJson, undefined, 2)
  );

  // フロントエンド用にABIなどのコントラクトの情報を保存する
  const artifact = artifacts.readArtifactSync(contractName);
  fs.writeFileSync(
    path.join(contractsDir, contractName + ".json"),
    JSON.stringify(artifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
