import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import IssueReport from '@/models/IssueReport';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const newReport = await IssueReport.create({
      title: body.title,
      description: body.description,
      category: body.category,
      district: body.district,
      location: body.location,
      status: 'active',
      // We aren't saving the base64 photo directly into MongoDB since it's heavy,
      // but in a real scenario it would upload to S3 first and save the URL.
      // We just ignore the photo in this hackathon schema for performance.
    });

    return NextResponse.json({ success: true, data: { ticketId: newReport._id } }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating Issue Report:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    // Fetch latest active reports sorted by date descending
    const reports = await IssueReport.find({}).sort({ status: 1, createdAt: -1 }).limit(50);
    return NextResponse.json({ success: true, data: reports });
  } catch (error: any) {
    console.error('Error fetching Issue Reports:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
