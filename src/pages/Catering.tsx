import { motion } from "framer-motion";
import { Coffee, UtensilsCrossed, Sandwich } from "lucide-react";

const companies = [
  {
    name: "BrewBox",
    type: "Coffee & Beverages",
    location: "San Francisco, CA",
    icon: Coffee,
  },
  {
    name: "FeastMode Catering",
    type: "Full Meals",
    location: "New York, NY",
    icon: UtensilsCrossed,
  },
  {
    name: "SnackStack",
    type: "Snacks & Light Bites",
    location: "Austin, TX",
    icon: Sandwich,
  },
];

const Catering = () => (
  <div className="max-w-6xl mx-auto py-12 px-8">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Catering Companies</h1>
      <p className="text-muted-foreground mb-10">Find catering services for meetups, hackathons, and community events.</p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((c, i) => (
        <motion.div
          key={c.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          whileHover={{ y: -4 }}
          className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-accent-foreground">
              <c.icon size={22} />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-sm">{c.name}</h3>
              <p className="text-muted-foreground text-xs">{c.location}</p>
            </div>
          </div>
          <span className="inline-block bg-accent text-accent-foreground px-2 py-0.5 rounded text-xs font-medium mb-5">
            {c.type}
          </span>
          <button className="w-full py-2 bg-foreground text-background rounded-lg text-sm font-medium transition-colors hover:opacity-90">
            Contact
          </button>
        </motion.div>
      ))}
    </div>
  </div>
);

export default Catering;
