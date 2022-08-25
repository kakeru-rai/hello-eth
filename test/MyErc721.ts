import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ContractFactory } from "ethers";
import { MyErc721 } from "../typechain-types/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ConstructorFragment } from "@ethersproject/abi";

const NFT_NAME = "TestNft";
const NFT_SYMBOL = "TN";

describe("MyErc721 contract", function () {
  async function deployTokenFixture(): Promise<{
    contractFactory: ContractFactory;
    contract: MyErc721;
    owner: SignerWithAddress;
    addr1: SignerWithAddress;
    addr2: SignerWithAddress;
  }> {
    const contractFactory = await ethers.getContractFactory("MyErc721");
    const [owner, addr1, addr2] = await ethers.getSigners();
    const contract = await contractFactory.deploy(NFT_NAME, NFT_SYMBOL);

    await contract.deployed();

    return {
      contractFactory: contractFactory,
      contract: contract,
      owner,
      addr1,
      addr2,
    };
  }

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    it("指定した名前とシンボルでデプロイされている", async function () {
      const { contract } = await loadFixture(deployTokenFixture);
      expect(await contract.name()).to.equal(NFT_NAME);
      expect(await contract.symbol()).to.equal(NFT_SYMBOL);
    });
  });

  describe("function", function () {
    it("hello", async function () {
      const { contract, owner } = await loadFixture(deployTokenFixture);
      expect(await contract.hello("world")).to.equal("hello world.");
    });

    it("signer", async function () {
      const { contract, owner, addr1 } = await loadFixture(deployTokenFixture);

      expect(await contract.msgSender()).to.equal(
        owner.address,
        "デプロイして得られるcontractのsighnerはowner"
      );

      let contractAddr1 = contract.connect(addr1);
      expect(await contractAddr1.msgSender()).to.equal(
        addr1.address,
        "connectするとsignerが変わる"
      );
    });
  });

  describe("シナリオ", function () {
    it("誰でもmintできる", async function () {
      const { contract, owner, addr1 } = await loadFixture(deployTokenFixture);

      const TOKEN_ID = 1;
      let contractAddr1 = contract.connect(addr1);
      try {
        expect(await contractAddr1.ownerOf(TOKEN_ID)).to.equal(addr1.address);
        expect(true).to.equal(false);
      } catch (e) {
        if (e instanceof Error) {
          expect(true).to.equal(true, "トークンがないのでエラー");
        } else {
          expect(true).to.equal(false);
        }
      }

      await contractAddr1.safeMint(addr1.address, TOKEN_ID);
      expect(await contractAddr1.ownerOf(TOKEN_ID)).to.equal(addr1.address);
    });

    it("自分のNFTの受け渡しができる", async function () {
      const { contract, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      let contractAddr1 = contract.connect(addr1);

      const TOKEN_ID = 1;
      await contractAddr1.safeMint(addr1.address, TOKEN_ID);
      expect(await contractAddr1.ownerOf(TOKEN_ID)).to.equal(addr1.address);

      await contractAddr1["safeTransferFrom(address,address,uint256)"](
        addr1.address,
        addr2.address,
        TOKEN_ID
      );

      expect(await contractAddr1.ownerOf(TOKEN_ID)).to.equal(addr2.address);
    });

    it("自分以外のNFTの受け渡しはできない", async function () {
      const { contract, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      let contractAddr1 = contract.connect(addr1);

      const TOKEN_ID = 1;
      await contractAddr1.safeMint(addr1.address, TOKEN_ID);
      expect(await contractAddr1.ownerOf(TOKEN_ID)).to.equal(
        addr1.address,
        "addr1でmint"
      );

      let contractAddr2 = contract.connect(addr2);
      try {
        await contractAddr2["safeTransferFrom(address,address,uint256)"](
          addr1.address,
          addr2.address,
          TOKEN_ID
        );
        expect(true).to.equal(false);
      } catch (e) {
        expect(true).to.equal(
          true,
          "addr1のトークンをaddr2が自分に移譲できない"
        );
      }
    });

    it("インデックスを使ってトークンIDを取得できる", async function () {
      const { contract, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      let contractAddr1 = contract.connect(addr1);

      const TOKEN_ID1 = 111;
      await contractAddr1.safeMint(addr1.address, TOKEN_ID1);
      expect(await contractAddr1.totalSupply()).to.equal(1);
      expect(await contractAddr1.balanceOf(addr1.address)).to.equal(1);

      const TOKEN_ID2 = 222;
      const TOKEN_ID3 = 333;
      let contractAddr2 = contract.connect(addr2);
      await contractAddr2.safeMint(addr2.address, TOKEN_ID2);
      await contractAddr2.safeMint(addr2.address, TOKEN_ID3);
      expect(await contractAddr2.totalSupply()).to.equal(3);
      expect(await contractAddr2.balanceOf(addr2.address)).to.equal(
        2,
        "所有しているトークンの数が確認できる"
      );

      expect(await contractAddr2.tokenByIndex(0)).to.equal(
        TOKEN_ID1,
        "自分が所有していないトークンIDも見れる"
      );
      expect(await contractAddr2.tokenByIndex(1)).to.equal(
        TOKEN_ID2,
        "全てのオーナーのトークンをindexの通し番号で取得する"
      );
      expect(await contractAddr2.tokenByIndex(2)).to.equal(TOKEN_ID3);

      expect(
        await contractAddr2.tokenOfOwnerByIndex(addr1.address, 0)
      ).to.equal(TOKEN_ID1);
      expect(
        await contractAddr2.tokenOfOwnerByIndex(addr2.address, 0)
      ).to.equal(
        TOKEN_ID2,
        "tokenByIndexと違ってオーナーごとの通し番号でトークンを取得する"
      );
    });

    it("トークンIDから保有者アドレスを取得できる", async function () {
      const { contract, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      const TOKEN_ID1 = 111;
      let contractAddr1 = contract.connect(addr1);
      await contractAddr1.safeMint(addr1.address, TOKEN_ID1);
      expect(await contractAddr1.ownerOf(TOKEN_ID1)).to.equal(
        addr1.address,
        "自分のトークン所有者を取得できる"
      );

      let contractAddr2 = contract.connect(addr2);
      expect(await contractAddr2.ownerOf(TOKEN_ID1)).to.equal(
        addr1.address,
        "他人のトークン所有者を取得できる"
      );
    });
  });
});
