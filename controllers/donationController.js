import Donation from "../models/Donation.js";

// ✅ Save a new donation (manual/UPI)
export const saveDonation = async (req, res) => {
  try {
    const { donor, isMonthly } = req.body;
    const requiredFields = ["name", "email", "phone", "parcelName", "amount", "cause"];
    const missingFields = requiredFields.filter((field) => !donor[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const donation = await Donation.create({
      donorName: donor.name,
      donorEmail: donor.email,
      donorPhone: donor.phone,
      parcelName: donor.parcelName,
      count: donor.count || 1,
      amountPerItem: donor.amount,
      totalAmount: donor.count * donor.amount,
      cause: donor.cause,
      status: "pending", // can be updated manually to "completed"
      method: "UPI",
      isMonthly: isMonthly || false,
      monthlyAmount: isMonthly ? donor.amount : undefined,
      startDate: isMonthly ? new Date() : undefined,
      nextReminderDate: isMonthly ? new Date() : undefined,
    });

    res.status(200).json({ success: true, donation });
  } catch (err) {
    console.error("Save Donation Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get donations by email
export const getDonationsByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const donations = await Donation.find({ donorEmail: email }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all donations
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Latest donations
export const getLatestDonations = async (req, res) => {
  try {
    const donations = await Donation.aggregate([
      { $match: { status: "completed" } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$donorName",
          donorName: { $first: "$donorName" },
          totalAmount: { $first: "$totalAmount" },
          cause: { $first: "$cause" },
          createdAt: { $first: "$createdAt" },
        },
      },
      { $limit: 10 },
    ]);

    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};