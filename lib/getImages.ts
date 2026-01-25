import { list } from '@vercel/blob';

export default async function getImages() {
  try {
    const listResult = await list();
    const blobUrls = listResult.blobs.map(blob => blob.url);
    return blobUrls;
  } catch (error) {
    console.log(error)
    return [];
  }
}
