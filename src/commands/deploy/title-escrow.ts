import { Argv } from "yargs";
import { error, success, info } from "signale";
import { getLogger } from "../../logger";
import { deployTitleEscrow } from "../../implementations/deploy/title-escrow";
import { DeployTitleEscrowCommand } from "./deploy.types";

const { trace } = getLogger("deploy:title-escrow");

export const command = "title-escrow <token-registry> <beneficiary> <holder> <title-escrow-factory> [options]";

export const describe = "Deploys a title escrow on the blockchain";

export const builder = (yargs: Argv): Argv =>
  yargs
    .positional("token-registry", {
      description: "Address of ERC721 contract that the escrow will receive the token from",
      normalize: true
    })
    .positional("beneficiary", {
      description: "Beneficiary address",
      normalize: true
    })
    .positional("holder", {
      description: "Holder address",
      normalize: true
    })
    .positional("title-escrow-factory", {
      description: "Address of title escrow creator/factory",
      normalize: true
    })
    .option("network", {
      alias: "n",
      choices: ["mainnet", "ropsten"],
      default: "mainnet",
      description: "Ethereum network to deploy to"
    })
    .option("key", {
      alias: "k",
      type: "string",
      description: "Private key of deployer account"
    })
    .option("key-file", {
      alias: "f",
      type: "string",
      description: "Path to file containing private key of deployer account"
    });

export const handler = async (args: DeployTitleEscrowCommand): Promise<string | undefined> => {
  trace(`Args: ${JSON.stringify(args, null, 2)}`);
  try {
    info(`Deploying title escrow`);
    const titleEscrow = await deployTitleEscrow(args);
    success(`Title escrow deployed at ${titleEscrow.contractAddress}`);
    info(
      `Find more details at https://${args.network === "ropsten" ? "ropsten." : ""}etherscan.io/address/${
        titleEscrow.contractAddress
      }`
    );
    return titleEscrow.contractAddress;
  } catch (e) {
    error(e.message);
  }
};

export default {
  command,
  describe,
  builder,
  handler
};
