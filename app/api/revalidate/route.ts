import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST() {
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/gallery');
    revalidatePath('/camera');
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ revalidated: false, message: err.message }, { status: 500 });
  }
}
