import { TitleEscrow__factory, TradeTrustERC721__factory } from "@govtechsg/token-registry/contracts";
import { Wallet } from "ethers";

import { BaseTitleEscrowCommand as TitleEscrowSurrenderDocumentCommand } from "../../commands/title-escrow/title-escrow-command.type";
import { surrenderDocument } from "./surrenderDocument";

jest.mock("@govtechsg/token-registry/contracts");

const surrenderDocumentParams: TitleEscrowSurrenderDocumentCommand = {
  tokenRegistry: "0x1122",
  tokenId: "0x12345",
  network: "goerli",
  maxPriorityFeePerGasScale: 1,
  feeData: false,
};

describe("title-escrow", () => {
  describe("surrender transferable record", () => {
    const mockedTradeTrustERC721Factory: jest.Mock<TradeTrustERC721__factory> = TradeTrustERC721__factory as any;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock static method
    const mockedConnectERC721: jest.Mock = mockedTradeTrustERC721Factory.connect;
    const mockedTitleEscrowFactory: jest.Mock<TitleEscrow__factory> = TitleEscrow__factory as any;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock static method
    const mockedConnectTitleEscrowFactory: jest.Mock = mockedTitleEscrowFactory.connect;
    const mockedOwnerOf = jest.fn();
    const mockSurrender = jest.fn();
    const mockCallStaticSurrender = jest.fn().mockResolvedValue(undefined);
    const mockedTitleEscrowAddress = "0x2133";

    beforeEach(() => {
      delete process.env.OA_PRIVATE_KEY;
      mockedTradeTrustERC721Factory.mockReset();
      mockedConnectERC721.mockReset();
      mockedTitleEscrowFactory.mockReset();
      mockedConnectTitleEscrowFactory.mockReset();

      mockedOwnerOf.mockReturnValue(mockedTitleEscrowAddress);
      mockSurrender.mockReturnValue({
        hash: "hash",
        wait: () => Promise.resolve({ transactionHash: "transactionHash" }),
      });
      mockedConnectERC721.mockReturnValue({
        ownerOf: mockedOwnerOf,
      });
      mockedConnectTitleEscrowFactory.mockReturnValue({
        surrender: mockSurrender,
        callStatic: {
          surrender: mockCallStaticSurrender,
        },
      });

      mockedOwnerOf.mockClear();
      mockSurrender.mockClear();
      mockCallStaticSurrender.mockClear();
    });
    it("should pass in the correct params and successfully surrender a transferable record", async () => {
      const privateKey = "0000000000000000000000000000000000000000000000000000000000000001";
      await surrenderDocument({
        ...surrenderDocumentParams,
        key: privateKey,
      });

      const passedSigner: Wallet = mockedConnectERC721.mock.calls[0][1];

      expect(passedSigner.privateKey).toBe(`0x${privateKey}`);
      expect(mockedConnectERC721).toHaveBeenCalledWith(surrenderDocumentParams.tokenRegistry, passedSigner);
      expect(mockedOwnerOf).toHaveBeenCalledWith(surrenderDocumentParams.tokenId);
      expect(mockedConnectTitleEscrowFactory).toHaveBeenCalledWith(mockedTitleEscrowAddress, passedSigner);
      expect(mockCallStaticSurrender).toHaveBeenCalledTimes(1);
      expect(mockSurrender).toHaveBeenCalledTimes(1);
    });
  });
});
