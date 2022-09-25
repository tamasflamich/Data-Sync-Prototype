import WebSocket from 'ws';
import { AddressInfo } from 'net';
import { Duplex } from 'stream';
import * as Automerge from 'automerge';
import { BinaryChange } from 'automerge';
import { FastifyInstance } from 'fastify';

import { buildFastify } from './app';
import { createBinaryChange, createBinaryDocument } from './utils/array-utils';

describe('Sync engine', () => {
  let fastify: FastifyInstance;
  let client: Duplex;
  let websocket: WebSocket;

  afterEach(async () => {
    websocket.close();
    client.end();
    await fastify.close();
  });

  beforeEach(async () => {
    fastify = buildFastify();
    await fastify.listen();
    websocket = new WebSocket(`ws://localhost:${(fastify.server.address() as AddressInfo).port}/`, {
      headers: { 'x-user-id': 'other-user' },
    });
    client = WebSocket.createWebSocketStream(websocket, { encoding: 'utf-8' });
  });

  const getDocument = async (documentId: string, userId = 'user-id') => {
    return await fastify.inject({
      method: 'GET',
      path: `/v1/documents/${documentId}`,
      headers: {
        'x-user-id': userId,
      },
    });
  };

  const createDocument = async () => {
    return await fastify.inject({
      method: 'POST',
      path: '/v1/documents',
      headers: {
        'x-user-id': 'user-id',
      },
    });
  };

  const updateDocument = async (documentId: string, change: Automerge.BinaryChange) => {
    return await fastify.inject({
      method: 'PUT',
      path: `/v1/documents/${documentId}`,
      headers: {
        'x-user-id': 'user-id',
      },
      payload: Array.from(change),
    });
  };

  const getMissingUpdate = async (documentId: string, lastSyncTimestamp: number) => {
    return await fastify.inject({
      method: 'GET',
      path: `/v1/documents/sync/${documentId}`,
      query: { lastSyncTimestamp: `${lastSyncTimestamp}` },
    });
  };

  const automergeDocFromBody = (body: string): Automerge.Doc<Record<string, string>> => {
    return Automerge.load<Record<string, string>>(createBinaryDocument(body));
  };

  it('should receive a Websocket update from change to the same document', async () => {
    await new Promise(r => setTimeout(r, 1000));
    let otherUsersDoc: Automerge.Doc<Record<string, string>>;

    client.on('data', textualData => {
      const otherUsersDocWithChangeFromFirstUser = Automerge.applyChanges(otherUsersDoc, [
        createBinaryChange(textualData),
      ]);

      expect(otherUsersDocWithChangeFromFirstUser[0]['a']).toBe('b');
    });
    const createResponse = await createDocument();
    const { documentId } = createResponse.json();

    const getResponse = await getDocument(documentId);
    const otherUserGet = await getDocument(documentId, 'other-user');
    otherUsersDoc = automergeDocFromBody(otherUserGet.body);

    const recreatedDocument = automergeDocFromBody(getResponse.body);
    const updatedDoc = Automerge.change(recreatedDocument, doc => {
      doc['a'] = 'b';
    });

    const lastUpdate = Automerge.getLastLocalChange(updatedDoc);
    await updateDocument(documentId, lastUpdate);
    await new Promise(r => setTimeout(r, 1000));
  });

  it('should receive all the changes when user falls behind the changes', async () => {
    await new Promise(r => setTimeout(r, 1000));
    const createResponse = await createDocument();
    const { documentId } = createResponse.json();

    const getResponse = await getDocument(documentId);
    const otherUserGet = await getDocument(documentId, 'other-user');
    const otherUsersDoc = automergeDocFromBody(otherUserGet.body);
    const currentTimestamp = new Date().getTime();

    const recreatedDocument = automergeDocFromBody(getResponse.body);
    const updatedDoc = Automerge.change(recreatedDocument, doc => {
      doc['a'] = 'b';
    });

    const firstUpdate = Automerge.getLastLocalChange(updatedDoc);
    await updateDocument(documentId, firstUpdate);

    const latestVersionOfDoc = Automerge.change(updatedDoc, doc => {
      doc['c'] = 'd';
    });
    const secondUpdate = Automerge.getLastLocalChange(latestVersionOfDoc);
    await updateDocument(documentId, secondUpdate);

    const missingUpdateResponse = await getMissingUpdate(documentId, currentTimestamp);
    const missingChanges = JSON.parse(missingUpdateResponse.body).map(
      (numberArray: number[]) => new Uint8Array(numberArray) as BinaryChange,
    );
    const [otherUserSyncedDoc, patch] = Automerge.applyChanges(otherUsersDoc, missingChanges);
    expect(otherUserSyncedDoc['a']).toBe(latestVersionOfDoc['a']);
    expect(otherUserSyncedDoc['c']).toBe(latestVersionOfDoc['c']);
  });
});
