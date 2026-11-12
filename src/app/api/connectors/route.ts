import { NextResponse } from 'next/server';
import dataStore from '../../../lib/dataStore';
import { ConnectorDefinition } from '../../../lib/types';

export async function GET() {
  const connectors = await dataStore.listConnectors();
  return NextResponse.json(connectors);
}

export async function POST(request: Request) {
  const body = (await request.json()) as ConnectorDefinition;
  await dataStore.upsertConnectors([body]);
  return NextResponse.json({ status: 'ok', connector: body });
}
