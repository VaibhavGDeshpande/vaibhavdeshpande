import { getCollections } from '@/lib/data';
import CollectionsPreview from './CollectionsPreview';

export default async function CollectionsPreviewServer() {
  const collections = await getCollections();
  return <CollectionsPreview collections={collections} />;
}
