import startExportAndGetUrls from "server/stream/input/startExportAndGetUrls";
import { StartExportRequest } from "src/@types";

import axios from "axios";

const mockExportParams: StartExportRequest = {
  endpointId: "testEndpoint",
  operation: "testOperation",
  secretKey: "testSecretKey",
  sinceDateTimeUtc: "21.05.2020 10:00",
  tillDateTimeUtc: "21.05.2020 11:00",
};

const mockResponse = {
  NotReady: {
    status: 200,
    data: {
      status: "Success",
      file: {
        processingStatus: "NotReady",
      },
    },
  },
  Ready: {
    status: 200,
    data: {
      status: "Success",
      file: {
        processingStatus: "Ready",
        urls: ["file1", "file2"],
      },
    },
  },
  StartExport: {
    status: 200,
    data: {
      status: "Success",
      exportId: "123",
    },
  },
  Rejected: {
    status: 503,
    data: "server unavailable",
  },
};

jest.mock("axios");

afterEach(() => {
  jest.clearAllMocks();
});

it("should run 3 requests and return array of links", async () => {
  (axios.post as jest.Mock)
    .mockResolvedValueOnce(mockResponse.StartExport)
    .mockResolvedValueOnce(mockResponse.NotReady)
    .mockResolvedValueOnce(mockResponse.Ready);

  const exportUrls = await startExportAndGetUrls(mockExportParams);

  expect(axios.post).toHaveBeenCalledTimes(3);
  expect(exportUrls).toStrictEqual(["file1", "file2"]);
});

it("should throw error", async () => {
  (axios.post as jest.Mock).mockRejectedValueOnce(mockResponse.Rejected);

  try {
    await startExportAndGetUrls(mockExportParams);
  } catch (error) {
    expect(error).toStrictEqual(mockResponse.Rejected);
  }
});
