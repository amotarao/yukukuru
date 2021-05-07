export const bulkWriterErrorHandler = (error: FirebaseFirestore.BulkWriterError): boolean => {
  const MAX_RETRY_ATTEMPTS = 5;

  if (error.code === FirebaseFirestore.GrpcStatus.UNAVAILABLE && error.failedAttempts < MAX_RETRY_ATTEMPTS) {
    return true;
  }
  console.error(`❗️[Error]: Failed to ${error.operationType} document for ${error.documentRef}`);
  return false;
};
