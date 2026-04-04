import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SosAlert from '@/models/SosAlert';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;
    
    const alert = await SosAlert.findByIdAndUpdate(id, { status: 'resolved' }, { new: true });
    if (!alert) {
      return NextResponse.json({ success: false, message: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: alert });
  } catch (error: any) {
    console.error('Error resolving SOS alert:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;
    
    const alert = await SosAlert.findByIdAndDelete(id);
    if (!alert) {
      return NextResponse.json({ success: false, message: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Alert deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting SOS alert:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
