import Donation from "../models/Donation.js";

// ✅ Save a new donation (manual/UPI/PayPal)
export const saveDonation = async (req, res) => {
  try {
    const payload = req.body;

    // 🔹 Normalize to array
    const donationsArray = Array.isArray(payload) ? payload : [payload];

    const requiredFields = ["donorName", "parcelName", "cause", "amountPerItem"];
    const savedDonations = [];

    for (const data of donationsArray) {
      // 🔹 Required fields check
      const missing = requiredFields.filter((f) => !data[f]);
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missing.join(", ")}`,
        });
      }

      // 🔹 Total amount calculation
      const totalAmount =
        data.totalAmount || data.amountPerItem * (data.count || 1);

      const donation = await Donation.create({
        donorName: data.donorName,
        donorEmail: data.donorEmail || "",
        donorPhone: data.donorPhone || "",
        serviceDate: Array.isArray(data.serviceDate) ? data.serviceDate[0] || null : data.serviceDate || null,
        parcelName: data.parcelName,
        count: data.count || 1,
        amountPerItem: data.amountPerItem,
        totalAmount,
        cause: data.cause,
        status: data.status || "pending",
        method: data.method || "Manual",
        impact: data.impact || "",
        orderId: data.orderId || "",
        paymentId: data.paymentId || "",
        signature: data.signature || "",
        isMonthly: data.isMonthly || false,
        monthlyAmount: data.isMonthly ? data.monthlyAmount : null,
        startDate: Array.isArray(data.startDate) ? data.startDate[0] || null : data.startDate || null,
        nextReminderDate: Array.isArray(data.nextReminderDate) ? data.nextReminderDate[0] || null : data.nextReminderDate || null,
      });

      savedDonations.push(donation);
    }

    res.status(201).json({
      success: true,
      count: savedDonations.length,
      donations: savedDonations,
    });
  } catch (err) {
    console.error("❌ Save Donation Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get donations by donor email
export const getDonationsByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const donations = await Donation.find({ donorEmail: email }).sort({ createdAt: -1 });
    res.json({ success: true, donations });
  } catch (err) {
    console.error("❌ Get Donations By Email Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get all donations
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json({ success: true, donations });
  } catch (err) {
    console.error("❌ Get All Donations Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get latest 10 completed donations
export const getLatestDonations = async (req, res) => {
  try {
    const donations = await Donation.aggregate([
      { $match: { status: "completed" } },
      { $sort: { serviceDate: -1, createdAt: -1 } },
      {
        $group: {
          _id: "$donorName",
          donorName: { $first: "$donorName" },
          totalAmount: { $first: "$totalAmount" },
          cause: { $first: "$cause" },
          serviceDate: { $first: "$serviceDate" },
          createdAt: { $first: "$createdAt" },
        },
      },
      { $limit: 10 },
    ]);

    res.json({ success: true, donations });
  } catch (err) {
    console.error("❌ Get Latest Donations Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};