import { deployTokenRegistry, mintTokenRegistry } from "../fixture/e2e/utils";
import { extractLine, LineInfo, run } from "../fixture/e2e/shell";
import { emoji, network, owner } from "../fixture/e2e/constants";
import { BaseTitleEscrowCommand } from "../../commands/title-escrow/title-escrow-command.type";
import { generateSurrenderCommand } from "../fixture/e2e/commands";

describe("surrender title-escrow", () => {
  jest.setTimeout(90000);

  let tokenRegistryAddress = "";
  beforeAll(() => {
    tokenRegistryAddress = deployTokenRegistry(owner.privateKey);
  });

  const defaultTitleEscrow = {
    beneficiary: owner.ethAddress,
    holder: owner.ethAddress,
    network: network,
    dryRun: false,
  };

  it("should be able to surrender title-escrow on token-registry", async () => {
    const { tokenRegistry, tokenId } = mintTokenRegistry(owner.privateKey, tokenRegistryAddress);
    const surrenderTitleEscrow: BaseTitleEscrowCommand = {
      tokenRegistry,
      tokenId,
      ...defaultTitleEscrow,
    };

    const command = generateSurrenderCommand(surrenderTitleEscrow, owner.privateKey);
    const results = run(command);

    const tokenRegistrySuccessFormat = `${emoji.tick}  success   Transferable record with hash `;
    const queryResults = extractLine(results, tokenRegistrySuccessFormat);
    expect(queryResults).toBeTruthy();
    const filteredLine = (queryResults as LineInfo[])[0].lineContent.trim();
    const checkSuccess = filteredLine.includes(tokenRegistrySuccessFormat);
    expect(checkSuccess).toBe(true);
    const resultTokenId = filteredLine
      .trim()
      .substring(tokenRegistrySuccessFormat.length, tokenRegistrySuccessFormat.length + 66);
    expect(resultTokenId).toBe(surrenderTitleEscrow.tokenId);
  });
});
