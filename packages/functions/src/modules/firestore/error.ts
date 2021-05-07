export const bulkWriterErrorHandler = (error: FirebaseFirestore.BulkWriterError): boolean => {
  const MAX_RETRY_ATTEMPTS = 5;

  if (error.code === FirebaseFirestore.GrpcStatus.UNAVAILABLE && error.failedAttempts < MAX_RETRY_ATTEMPTS) {
    console.log(
      `[BulkWriter]: Retrying ${error.operationType} document for [${error.documentRef.path}] ${error.failedAttempts} time.`
    );
    return true;
  }

  console.error(`❗️[BulkWriter Error]: Failed to ${error.operationType} document for [${error.documentRef.path}]`);
  return false;
};
