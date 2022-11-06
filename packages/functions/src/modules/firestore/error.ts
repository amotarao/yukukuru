import { BulkWriterError, GrpcStatus } from '@google-cloud/firestore';

export const bulkWriterErrorHandler = (error: BulkWriterError): boolean => {
  const MAX_RETRY_ATTEMPTS = 5;

  if (error.code === GrpcStatus.UNAVAILABLE && error.failedAttempts < MAX_RETRY_ATTEMPTS) {
    console.log(
      `[BulkWriter]: Retrying ${error.operationType} document for [${error.documentRef.path}] ${error.failedAttempts} time.`
    );
    return true;
  }

  console.error(`❗️[BulkWriter Error]: Failed to ${error.operationType} document for [${error.documentRef.path}]`);
  return false;
};
