import cron from "node-cron";
import moment from "moment";
import { Client } from "whatsapp-web.js";
import mongoose from "mongoose";
import Donor from "./models/Donor.js";

// ✅ WhatsApp Client
const client = new Client();
client.initialize();

client.on("ready", () => {
  console.log("WhatsApp Client Ready");
});

// ✅ Connect to MongoDB (if not already connected in main server.js)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected for WhatsApp Reminder"))
.catch((err) => console.error(err));

// ✅ Cron Job: run every day at 10 AM server time
cron.schedule("0 10 * * *", async () => {
  console.log("Running daily donation reminder check...");

  const today = moment().date(); // day number today

  const donors = await Donor.find();

  donors.forEach(donor => {
    const donorDay = moment(donor.start_date).date();

    if (donorDay === today) {
      const msg = `Vanakkam ${donor.name} 🙏\nIdhu unga monthly donation reminder.\nAmount: ₹${donor.amount}\nPay here: upi://pay?pa=greenwaytrust50.rzp@icici&pn=GreenwayTrust&am=${donor.amount}&cu=INR\nNandri 💚`;
      
      client.sendMessage(`${donor.phone}@c.us`, msg)
        .then(() => console.log(`Reminder sent to ${donor.name}`))
        .catch(err => console.error(`Failed to send to ${donor.name}`, err));
    }
  });
});