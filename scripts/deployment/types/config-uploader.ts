import { BlobServiceClient } from "@azure/storage-blob";

export class ConfigUploader {
  constructor(private readonly connectionString: string, private readonly blobContainerName: string = "configs") {}

  private readonly _blobClient = BlobServiceClient.fromConnectionString(this.connectionString);

  public async upload<T extends Object>(content: T[], chainName: string, subfolderName: string) {
    const client = await this._getBlobClient(`${subfolderName}/${chainName}.json`);

    const jsonData = JSON.stringify(content);

    await client.upload(jsonData, Buffer.byteLength(jsonData), {
      blobHTTPHeaders: {
        blobContentType: "application/json",
      },
    });
  }

  private async _getBlobClient(blobName: string) {
    const containerClient = this._blobClient.getContainerClient(this.blobContainerName);
    await containerClient.createIfNotExists();
    return containerClient.getBlockBlobClient(blobName);
  }
}
