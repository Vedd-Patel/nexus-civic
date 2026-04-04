import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import IssueReport from '@/models/IssueReport';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;
    
    const report = await IssueReport.findByIdAndDelete(id);
    if (!report) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Report deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting Issue Report:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
