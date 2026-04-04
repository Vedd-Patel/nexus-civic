import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SosAlert from '@/models/SosAlert';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // In case no valid lat/lng is passed (e.g., location denied), we can supply dummy coordinates or allow nulls if we want.
    // The current schema requires it, so we fallback to a default if not found.
    const lat = body.lat || 37.7749;
    const lng = body.lng || -122.4194;

    const newAlert = await SosAlert.create({
      location: { lat, lng },
      status: 'active',
    });

    return NextResponse.json({ success: true, data: newAlert }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating SOS alert:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    // Fetch latest active alerts first, then resolved, sorted by date descending
    const alerts = await SosAlert.find({}).sort({ status: 1, createdAt: -1 }).limit(50);
    return NextResponse.json({ success: true, data: alerts });
  } catch (error: any) {
    console.error('Error fetching SOS alerts:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
