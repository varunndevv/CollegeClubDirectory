import Club from "../models/Club.js"
import Event from "../models/Event.js"
import { clubs as defaultClubs } from "../../lib/clubs.js"
export default async function seedClubs() {
  for (const club of defaultClubs) {
    const { events = [], ...clubData } = club

    await Club.findOneAndUpdate(
      { _id: club.id },
      {
        _id: club.id,
        ...clubData,
        status: "approved",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    for (const event of events) {
      await Event.findOneAndUpdate(
        { clubId: club.id, title: event.title, date: event.date },
        {
          clubId: club.id,
          title: event.title,
          date: event.date,
          time: event.time || "",
          location: event.location,
          description: event.description || "",
          createdBy: "seed",
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    }
  }
}

