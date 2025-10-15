// whatsappReminder.js
import cron from "node-cron";
import moment from "moment";
import { Client } from "whatsapp-web.js";
import mongoose from "mongoose";
import Donation from "./models/Donation.js"; // ✅ Use Donation model, not Donor

// ✅ Initialize WhatsApp Client
const client = new Client();
client.initialize();

client.on("ready", () => {
  console.log("✅ WhatsApp Client Ready");
});

// ✅ Connect to MongoDB (if not connected in main server)
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected for WhatsApp Reminder"))
  .catch((err) => console.error(err));

// ✅ Cron Job: runs every day at 10 AM
cron.schedule("0 10 * * *", async () => {
  console.log("🕘 Running daily monthly donation reminder check...");

  const today = moment().startOf("day");

  try {
    // Find all monthly donors whose nextReminderDate is today
    const donors = await Donation.find({
      isMonthly: true,
      nextReminderDate: { $lte: today.toDate() },
    });

    if (!donors.length) {
      console.log("No reminders due today ✅");
      return;
    }

    for (const donor of donors) {
      const msg = `🌿 Vanakkam ${donor.donorName} 🙏
Idhu unga monthly donation reminder 🌱

💰 Amount: ₹${donor.monthlyAmount}
🪷 Cause: ${donor.cause}
📅 Date: ${moment(donor.nextReminderDate).format("DD MMM YYYY")}

UPI Pay Link 👇
upi://pay?pa=greenwaytrust50.rzp@icici&pn=GreenwayTrust&am=${donor.monthlyAmount}&cu=INR

Ungal support ku romba nandri 💚`;

      const phoneNumber = donor.donorPhone.replace(/\D/g, "");

      if (phoneNumber.length === 10) {
        await client.sendMessage(`91${phoneNumber}@c.us`, msg);
        console.log(`✅ Reminder sent to ${donor.donorName}`);

        // ✅ Update nextReminderDate to next month
        donor.nextReminderDate = moment(donor.nextReminderDate)
          .add(1, "month")
          .toDate();
        await donor.save();
      } else {
        console.log(`⚠️ Invalid phone for ${donor.donorName}`);
      }
    }
  } catch (err) {
    console.error("❌ Reminder job failed:", err);
  }
});