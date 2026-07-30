import mongoose from "mongoose";

const CodingProgressSnapshotSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    fingerprint: { type: String, default: "" },
    fetchedAt: { type: Date, default: null },
    data: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model("CodingProgressSnapshot", CodingProgressSnapshotSchema);
