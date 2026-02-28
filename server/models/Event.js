import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  date: { type: String, required: true },
  time: { type: String, default: "" },
  location: { type: String, default: "" },
  rsvpCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  },
});

eventSchema.index({ clubId: 1, date: 1 });

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);
export default Event;
