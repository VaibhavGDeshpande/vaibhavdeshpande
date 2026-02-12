import { getPhotos } from '@/lib/data';
import Link from 'next/link';
import { Upload, Image as ImageIcon, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default async function DashboardPage() {
  const photos = await getPhotos();
  const recentPhotos = photos.slice(0, 5); // Get 5 most recent

  return (
    <div className="p-8 md:p-12 text-white">
      <header className="mb-12">
        <h1 className="text-3xl font-serif mb-2">Dashboard</h1>
        <p className="text-neutral-400">Welcome back to your administration panel.</p>
      </header>

      {/* Quick Stats / Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl relative overflow-hidden group">
            <div className="relative z-10">
                <h3 className="text-lg font-medium mb-1">Total Photos</h3>
                <p className="text-4xl font-bold font-serif mb-4">{photos.length}</p>
                <Link href="/admin/gallery" className="inline-flex items-center text-sm text-neutral-400 group-hover:text-white transition-colors">
                    View Gallery <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform"/>
                </Link>
            </div>
            <ImageIcon className="absolute right-4 bottom-4 text-neutral-800/50" size={80} />
        </div>

        <Link href="/admin/upload-image" className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl relative overflow-hidden group hover:border-neutral-700 transition-colors block">
             <div className="relative z-10">
                <h3 className="text-lg font-medium mb-1">Upload New</h3>
                <p className="text-sm text-neutral-400 mb-6 max-w-[200px]">Add new photography to your portfolio collection.</p>
                <span className="inline-flex items-center justify-center bg-white text-black px-4 py-2 rounded-lg text-sm font-medium">
                    Upload Photo
                </span>
            </div>
            <Upload className="absolute right-4 bottom-4 text-neutral-800/50" size={80} />
        </Link>
      </div>

      {/* Recent Uploads */}
      <section>
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium">Recent Uploads</h2>
            <Link href="/admin/gallery" className="text-sm text-neutral-400 hover:text-white transition-colors">View All</Link>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            {recentPhotos.length > 0 ? (
                 <div className="divide-y divide-neutral-800">
                    {recentPhotos.map((photo) => (
                        <div key={photo.id} className="p-4 flex items-center gap-4 hover:bg-neutral-800/30 transition-colors">
                            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-neutral-800 flex-shrink-0">
                                <Image 
                                    src={photo.image_url} 
                                    alt={photo.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{photo.title || 'Untitled'}</h4>
                                <p className="text-xs text-neutral-500 mt-0.5 capitalize">{photo.category}</p>
                            </div>
                        </div>
                    ))}
                 </div>
            ) : (
                <div className="p-12 text-center text-neutral-500">
                    No photos uploaded yet.
                </div>
            )}
        </div>
      </section>
    </div>
  );
}
