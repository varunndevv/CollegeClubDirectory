import mongoose from "mongoose"

const rsvpSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ["going", "not_going"], default: "going" },
    clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' },
    clubName: String,
    eventTitle: String,
    eventDate: String,
    eventTime: String,
    eventLocation: String,
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

rsvpSchema.index({ eventId: 1, userId: 1 }, { unique: true })

const RSVP = mongoose.models.RSVP || mongoose.model("RSVP", rsvpSchema)
export default RSVP

