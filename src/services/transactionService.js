const mongoose = require("mongoose");

const isTransactionUnsupported = (error) =>
  typeof error?.message === "string" && error.message.includes("Transaction numbers are only allowed");

const runTransactional = async (work) => {
  const session = await mongoose.startSession();

  try {
    let result = null;

    try {
      await session.withTransaction(async () => {
        result = await work(session);
      });

      return {
        result,
        transactionMode: "mongo-session"
      };
    } catch (error) {
      if (!isTransactionUnsupported(error)) {
        throw error;
      }

      result = await work(null);
      return {
        result,
        transactionMode: "fallback-without-replica-set"
      };
    }
  } finally {
    await session.endSession();
  }
};

module.exports = {
  runTransactional
};
