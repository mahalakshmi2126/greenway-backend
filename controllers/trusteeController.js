import Trustee from "../models/Trustee.js";
import { cloudinary } from "../config/cloudinary.js";

// Seed data of default 8 trustees
const defaultTrustees = [
  {
    name: "V. Mahadevan",
    role: "Founder & President",
    subRole: "Vision, Governance & External Representation",
    bio: "Mr. V. Mahadevan is a Film Director and committed Social Activist with over 20 years of experience in the field of disability service. As a person with spinal cord injury himself, he brings deep lived experience and strong advocacy to the Trust. He provides overall leadership, vision, and strategic direction, guiding the organisation’s mission of inclusion, empowerment, and sustainability, while representing the Trust at institutional and public forums.",
    order: 0,
  },
  {
    name: "N. Santhosh Kumar",
    role: "Vice President",
    subRole: "Planning, Coordination & Partnerships",
    bio: "Mr. N. Santhosh Kumar is a business professional and dedicated social activist actively involved in community service through Vasavi Clubs, Rotary Clubs, and various social organisations. As Vice President, he supports governance and policy decisions, contributes to resource mobilisation, and strengthens community and institutional partnerships to enhance the Trust’s outreach and impact.",
    order: 1,
  },
  {
    name: "J. Thirumala",
    role: "Vice President",
    subRole: "Programme Oversight & Community Engagement",
    bio: "Mrs. J. Thirumala is a business professional with an interest in social development initiatives. In her role as Vice President, she supports organisational oversight, assists in programme planning, and contributes to initiatives related to women, families, and inclusive community development, ensuring balanced and people-centred decision-making.",
    order: 2,
  },
  {
    name: "B. Keerthivasan",
    role: "Secretary",
    subRole: "Administration, Compliance & Operations",
    bio: "Mr. B. Keerthivasan is a Government Servant and an accomplished para sports person with over 10 years of experience in social service, particularly working with persons with spina bifida. As Secretary, he is responsible for day-to-day administration, statutory compliance, official correspondence, coordination of programmes, and ensuring effective implementation of the Trust’s policies and resolutions.",
    order: 3,
  },
  {
    name: "V. G. Vetrivel",
    role: "General Secretary",
    subRole: "Programme Implementation & Sports Development",
    bio: "Mr. V. G. Vetrivel is a Badminton Coach by profession with a strong commitment to building an inclusive society. As General Secretary, he oversees programme execution, coordinates sports and development initiatives, supports athlete and beneficiary engagement, and ensures smooth operational functioning across the Trust’s activities.",
    order: 4,
  },
  {
    name: "K. Dharmesh",
    role: "Treasurer",
    subRole: "Finance, Budgeting & Accountability",
    bio: "Mr. K. Dharmesh is a business entrepreneur and a person affected by polio. He oversees the financial management of the Trust, including budgeting, accounting, fund utilisation, and financial reporting. He ensures transparency, accountability, and compliance with financial regulations, supporting the Trust’s long-term sustainability.",
    order: 5,
  },
  {
    name: "B. Sathiyamurthy",
    role: "Joint Secretary",
    subRole: "Administration Support & Programme Coordination",
    bio: "Mr. B. Sathiyamurthy is a retired Sub-Inspector of Police and a committed social worker with a strong passion for public service. As Joint Secretary, he supports administrative functions, assists in organising programmes and meetings, and contributes his experience in governance, discipline, and community coordination.",
    order: 6,
  },
  {
    name: "G. Sam Moses",
    role: "Joint Secretary",
    subRole: "Documentation, Technical Support & Stakeholder Engagement",
    bio: "Mr. G. Sam Moses is an Engineer by profession and a person with spinal cord injury. As Joint Secretary, he supports programme coordination, documentation, and stakeholder engagement, while contributing technical insight and lived experience to promote accessibility, inclusion, and practical solutions within the Trust’s initiatives.",
    order: 7,
  },
];

// ✅ Get All Trustees (with Auto-Seeding)
export const getTrustees = async (req, res) => {
  try {
    let count = await Trustee.countDocuments();
    if (count === 0) {
      console.log("Seeding default trustees into database...");
      await Trustee.insertMany(defaultTrustees);
    }
    const trustees = await Trustee.find({}).sort({ order: 1, createdAt: 1 });
    res.json(trustees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create Trustee
export const createTrustee = async (req, res) => {
  try {
    const { name, role, subRole, bio, order } = req.body;

    const parsedOrder = order ? parseInt(order, 10) : 0;
    
    const trusteeData = {
      name,
      role,
      subRole,
      bio,
      order: parsedOrder,
    };

    if (req.file) {
      trusteeData.imageUrl = req.file.path;
      trusteeData.publicId = req.file.filename;
    }

    const trustee = new Trustee(trusteeData);
    await trustee.save();
    res.status(201).json(trustee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Trustee
export const updateTrustee = async (req, res) => {
  try {
    const { name, role, subRole, bio, order } = req.body;
    const trustee = await Trustee.findById(req.params.id);
    if (!trustee) {
      return res.status(404).json({ message: "Trustee not found" });
    }

    if (req.file) {
      // delete old image from Cloudinary if it exists
      if (trustee.publicId) {
        try {
          await cloudinary.uploader.destroy(trustee.publicId);
        } catch (err) {
          console.error("Failed to delete old image from Cloudinary:", err.message);
        }
      }
      trustee.imageUrl = req.file.path;
      trustee.publicId = req.file.filename;
    }

    if (name) trustee.name = name;
    if (role) trustee.role = role;
    if (subRole !== undefined) trustee.subRole = subRole;
    if (bio !== undefined) trustee.bio = bio;
    if (order !== undefined) trustee.order = parseInt(order, 10);

    await trustee.save();
    res.json(trustee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Trustee
export const deleteTrustee = async (req, res) => {
  try {
    const trustee = await Trustee.findById(req.params.id);
    if (!trustee) {
      return res.status(404).json({ message: "Trustee not found" });
    }

    // delete image from Cloudinary if it exists
    if (trustee.publicId) {
      try {
        await cloudinary.uploader.destroy(trustee.publicId);
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err.message);
      }
    }

    await trustee.deleteOne();
    res.json({ message: "Trustee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
