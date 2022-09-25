import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { DocumentSyncUseCase } from '../usecase/document-sync-usecase';
import { createBinaryChangeFromNumberArray } from '../utils/array-utils';

export const documentHandler = async (fastify: FastifyInstance, documentSyncUseCase: DocumentSyncUseCase) => {
  fastify.get(
    '/v1/documents/:documentId',
    (
      request: FastifyRequest<{ Params: { documentId: string }; Headers: { 'x-user-id': string } }>,
      reply: FastifyReply,
    ) => {
      const result = documentSyncUseCase.getDocument(request.params.documentId, request.headers['x-user-id']);
      if (result) {
        reply.send(JSON.stringify(Array.from(result)));
      } else {
        reply.status(404).send();
      }
    },
  );

  fastify.post(
    '/v1/documents',
    (request: FastifyRequest<{ Headers: { 'x-user-id': string } }>, reply: FastifyReply) => {
      const documentId = documentSyncUseCase.createDocument(request.headers['x-user-id']);
      reply.status(201).send({ documentId });
    },
  );

  fastify.put(
    '/v1/documents/:documentId',
    (
      request: FastifyRequest<{ Headers: { 'x-user-id': string }; Body: number[]; Params: { documentId: string } }>,
      reply: FastifyReply,
    ) => {
      const documentId = documentSyncUseCase.updateDocument(
        request.params.documentId,
        request.headers['x-user-id'],
        createBinaryChangeFromNumberArray(request.body),
      );
      reply.status(200).send({ documentId });
    },
  );

  fastify.get(
    '/v1/documents/sync/:documentId',
    (
      request: FastifyRequest<{ Params: { documentId: string }; Querystring: { lastSyncTimestamp: number } }>,
      reply: FastifyReply,
    ) => {
      const missingUpdates = documentSyncUseCase.getUpdatesSince(request.params.documentId, request.query.lastSyncTimestamp);
      reply.send(JSON.stringify(Array.from(missingUpdates.map(missingUpdate => Array.from(missingUpdate)))));
    },
  );
};
