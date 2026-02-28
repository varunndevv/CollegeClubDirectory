import mongoose from "mongoose"

const announcementSchema = new mongoose.Schema(
  {
    clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id.toString()
        delete ret._id
        return ret
      },
    },
  }
)

const Announcement = mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema)

export default Announcement

