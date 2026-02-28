import mongoose from "mongoose"

const membershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
    userName: String,
    userEmail: String,
    status: {
      type: String,
      enum: ["pending", "joined", "rejected"],
      default: "pending",
    },
    role: { type: String, default: "member" },
    joinedAt: { type: Date, default: Date.now },
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

membershipSchema.index({ userId: 1, clubId: 1 }, { unique: true })

const Membership = mongoose.models.Membership || mongoose.model("Membership", membershipSchema)

export default Membership

