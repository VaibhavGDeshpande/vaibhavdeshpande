// This file was used to get the dimensions of the existing photos which were already present in the db

// import { createClient } from '@supabase/supabase-js';
// import { imageSize } from 'image-size';
// import fetch from 'node-fetch';

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY! 
// );

// const BUCKET = 'photos';

// async function run() {
//   const { data: photos, error } = await supabase
//     .from('photos')
//     .select('id, image_url')
//     .is('width', null);

//   if (error) throw error;
//   if (!photos?.length) {
//     console.log('No photos to backfill');
//     return;
//   }

//   console.log(`Backfilling ${photos.length} images…`);

//   for (const photo of photos) {
//     try {
//       const { data } = supabase
//         .storage
//         .from(BUCKET)
//         .getPublicUrl(photo.image_url);

//       const res = await fetch(data.publicUrl);
//       const buffer = Buffer.from(await res.arrayBuffer());

//       const { width, height } = imageSize(buffer);
//       if (!width || !height) throw new Error('Invalid dimensions');

//       const orientation =
//         width === height ? 'square' :
//         width > height ? 'landscape' : 'portrait';

//       await supabase
//         .from('photos')
//         .update({
//           width,
//           height,
//           aspect_ratio: width / height,
//           orientation,
//         })
//         .eq('id', photo.id);

//       console.log(`✔ ${photo.image_url} → ${width}×${height}`);
//     } catch (err) {
//       console.error(`✖ Failed: ${photo.image_url}`, err);
//     }
//   }

//   console.log('Backfill complete 🎉');
// }

// run();
