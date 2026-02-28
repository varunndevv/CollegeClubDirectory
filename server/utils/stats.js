import Membership from "../models/Membership.js"
import Review from "../models/Review.js"

export async function buildClubStats(clubIds = []) {
  // Convert ObjectIds to strings for proper matching with Membership.clubId (which is String)
  const clubIdStrings = clubIds.filter(Boolean).map(id => id.toString())
  const matchClub = clubIdStrings.length ? { clubId: { $in: clubIdStrings } } : {}

  const [memberAgg, reviewAgg] = await Promise.all([
    Membership.aggregate([
      { $match: { ...matchClub, status: { $in: ["pending", "joined"] } } },
      { $group: { _id: "$clubId", count: { $sum: 1 } } },
    ]),
    Review.aggregate([
      { $match: matchClub },
      {
        $group: {
          _id: "$clubId",
          rating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]),
  ])

  const stats = {}

  memberAgg.forEach((item) => {
    stats[item._id] = stats[item._id] || {}
    stats[item._id].memberCount = item.count
  })

  reviewAgg.forEach((item) => {
    stats[item._id] = stats[item._id] || {}
    stats[item._id].rating = Number(item.rating?.toFixed(1)) || 0
    stats[item._id].reviewCount = item.reviewCount || 0
  })

  return stats
}

