import { motion } from "framer-motion";
import mentorJames from "@/assets/mentor-james.jpg";
import mentorPriya from "@/assets/mentor-priya.jpg";
import mentorErik from "@/assets/mentor-erik.jpg";

const mentors = [
  {
    name: "James Okafor",
    area: "Leadership & Scaling",
    years: 12,
    description: "Helps community leaders develop strategies for sustainable growth and member engagement.",
    photo: mentorJames,
  },
  {
    name: "Priya Sharma",
    area: "Product Management",
    years: 8,
    description: "Guides founders and community builders on product thinking and user-centric development.",
    photo: mentorPriya,
  },
  {
    name: "Erik Lindqvist",
    area: "Community Building",
    years: 15,
    description: "Veteran community builder with experience growing developer communities from zero to thousands.",
    photo: mentorErik,
  },
];

const Mentors = () => (
  <div className="max-w-6xl mx-auto py-12 px-8">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Mentors</h1>
      <p className="text-muted-foreground mb-10">Connect with mentors who can guide your members and help your community grow.</p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mentors.map((m, i) => (
        <motion.div
          key={m.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          whileHover={{ y: -4 }}
          className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <img src={m.photo} alt={m.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h3 className="text-foreground font-semibold text-sm">{m.name}</h3>
              <p className="text-muted-foreground text-xs tabular-nums">{m.years} years experience</p>
            </div>
          </div>
          <span className="inline-block bg-accent text-accent-foreground px-2 py-0.5 rounded text-xs font-medium mb-3">
            {m.area}
          </span>
          <p className="text-muted-foreground text-sm leading-relaxed mb-5">{m.description}</p>
          <button className="w-full py-2 bg-foreground text-background rounded-lg text-sm font-medium transition-colors hover:opacity-90">
            Request Mentorship
          </button>
        </motion.div>
      ))}
    </div>
  </div>
);

export default Mentors;
