import { Inject, Injectable, NotAcceptableException } from '@nestjs/common';
import { ethers } from 'ethers';
import { WEBARCHIVE_ABI } from './abis';
import { CreateArchiveDTO } from './create-archive-dto';
import { getImageData, imageFromBuffer } from '@canvas/image';
import { bmvbhash } from 'blockhash-core';
import { Address, createWalletClient, http } from 'viem';
import { polygonAmoy } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

interface ICachedData {
  ipAddress: string;
  webpageUrl: string;
  timestamp: string;
  hexHash: string;
  image: string;
}

@Injectable()
export class AppService {
  private readonly AKORD_API_KEY = process.env.AKORD_API_KEY;
  private readonly INFURA_RPC_URL = process.env.INFURA_RPC_URL;
  private readonly PRIVATE_KEY = process.env.PRIVATE_KEY;
  private readonly account = privateKeyToAccount(this.PRIVATE_KEY as Address);
  private readonly DEPLOYED_CONTRACT_ADDRESS =
    process.env.DEPLOYED_CONTRACT_ADDRESS;
  private readonly DEPLOYED_CONTRACT_ABI = WEBARCHIVE_ABI;
  private readonly HCAPTCHA_SECRET_KEY = process.env.HCAPTCHA_SECRET_KEY;
  private readonly provider = http(this.INFURA_RPC_URL);
  private readonly walletClient = createWalletClient({
    account: this.account,
    chain: polygonAmoy,
    transport: this.provider,
  });

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  getHello(): string {
    return 'Hello World!';
  }

  async storeNft(image: Buffer) {
    const response = await fetch(
      'https://api.akord.com/files?tag-file-category=photo',
      {
        method: 'POST',

        headers: {
          Accept: 'application/json',
          'Api-Key': this.AKORD_API_KEY,
          'Content-Type': 'image/png',
        },
        body: image,
      },
    );

    return response.json();
  }

  async storeDataInCache(data: CreateArchiveDTO, image: Express.Multer.File) {
    const { ipAddress, webpageUrl, timestamp, cacheKey } = data;

    const bytes = await image.buffer;
    const buffer = Buffer.from(bytes);

    const imageData = await getImageData(await imageFromBuffer(buffer));

    const { width, height, data: _data } = imageData;

    // Calculate phash (perceptual hash)
    const hexHash = bmvbhash({ width, height, data: _data }, 8);
    await this.cacheManager.set(cacheKey, {
      ipAddress,
      webpageUrl,
      timestamp,
      hexHash,
      image: buffer.toString('base64'),
    });
  }

  async createArchive(cacheKey: string) {
    const cachedData: ICachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      try {
        const hash = await this.walletClient.writeContract({
          address: this.DEPLOYED_CONTRACT_ADDRESS as `0x${string}`,
          abi: this.DEPLOYED_CONTRACT_ABI,
          functionName: 'setArchive',
          args: [
            cachedData.timestamp,
            ethers.encodeBytes32String(cachedData.ipAddress),
            ethers.encodeBytes32String(cachedData.hexHash),
            cachedData.webpageUrl.split('.')[0],
          ],
          chain: polygonAmoy,
          account: this.account,
        });

        const imageBuffer = Buffer.from(cachedData.image, 'base64');
        const res = await this.storeNft(imageBuffer);
        return {
          message: 'Archive created and processed successfully.',
          nftUrl: res.cloud.url,
          transactionHash: hash,
        };
      } catch (error) {
        console.error('Error creating archive:', error);
        return { message: 'An error occurred creating the archive.' };
      }
    }

    throw new NotAcceptableException('Error verifying, please try again.');
  }

  async verifyHCaptchaToken(token: string): Promise<boolean> {
    const url = 'https://api.hcaptcha.com/siteverify';
    const formData = new URLSearchParams();
    formData.append('response', token);
    formData.append('secret', this.HCAPTCHA_SECRET_KEY);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async verifyAndArchive(token: string, cacheKey: string): Promise<any> {
    const isTokenValid = this.verifyHCaptchaToken(token);
    if (isTokenValid) {
      return await this.createArchive(cacheKey);
    }
  }
}
