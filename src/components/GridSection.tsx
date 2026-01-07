import { motion } from "framer-motion";

export default function GridSection() {
  const cards = [
    { title: "Design", icon: "D", color: "from-pink-500/20" },
    { title: "Development", icon: "Dev", color: "from-blue-500/20" },
    { title: "Strategy", icon: "S", color: "from-purple-500/20" },
    { title: "Analytics", icon: "A", color: "from-green-500/20" },
    { title: "Marketing", icon: "M", color: "from-orange-500/20" },
    { title: "Support", icon: "Sup", color: "from-cyan-500/20" },
    { title: "Security", icon: "Sec", color: "from-red-500/20" },
    { title: "Cloud", icon: "C", color: "from-indigo-500/20" },
  ];
  

  return (
    <section className="relative p-2 md:p-3 bg-white">
      <div className="relative w-full rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-50 via-white to-gray-50 border border-gray-200 shadow-xl overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative z-10 px-6 md:px-12 py-12 md:py-16 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-4"
            >
              <span className="px-4 py-1.5 rounded-full border border-gray-300 bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-[0.3em]">
                Services
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4 text-gray-900"
            >
              What We Do
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-500 text-sm md:text-base font-medium uppercase tracking-wider"
            >
              Comprehensive solutions for your business
            </motion.p>
          </div>

          {/* Grid with 4 Divisions */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Vertical Dashed Line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] border-l-2 border-dashed border-red-400/50 -translate-x-1/2" />
            
            {/* Horizontal Dashed Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[2px] border-t-2 border-dashed border-red-400/50 -translate-y-1/2" />

            {/* Top Left Division - Pink/Purple Gradient */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative p-8 rounded-2xl bg-gradient-to-br from-pink-100/50 via-white to-white border-2 border-gray-300 hover:border-pink-400 transition-all duration-300 group"
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-pink-300/30 to-transparent rounded-full blur-3xl" />
              
              <div className="relative grid grid-cols-2 gap-4">
                {cards.slice(0, 2).map((card, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-xl border-2 border-gray-300 bg-white hover:border-pink-400 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 group/card"
                  >
                    <span className="text-3xl">{card.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-700">{card.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Right Division - Blue Gradient */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative p-8 rounded-2xl bg-gradient-to-bl from-blue-100/50 via-white to-white border-2 border-gray-300 hover:border-blue-400 transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-300/30 to-transparent rounded-full blur-3xl" />
              
              <div className="relative grid grid-cols-2 gap-4">
                {cards.slice(2, 4).map((card, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-xl border-2 border-gray-300 bg-white hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 group/card"
                  >
                    <span className="text-3xl">{card.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-700">{card.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bottom Left Division - Green Gradient */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative p-8 rounded-2xl bg-gradient-to-tr from-green-100/50 via-white to-white border-2 border-gray-300 hover:border-green-400 transition-all duration-300 group"
            >
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-300/30 to-transparent rounded-full blur-3xl" />
              
              <div className="relative grid grid-cols-2 gap-4">
                {cards.slice(4, 6).map((card, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-xl border-2 border-gray-300 bg-white hover:border-green-400 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 group/card"
                  >
                    <span className="text-3xl">{card.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-700">{card.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bottom Right Division - Orange Gradient */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative p-8 rounded-2xl bg-gradient-to-tl from-orange-100/50 via-white to-white border-2 border-gray-300 hover:border-orange-400 transition-all duration-300 group"
            >
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-orange-300/30 to-transparent rounded-full blur-3xl" />
              
              <div className="relative grid grid-cols-2 gap-4">
                {cards.slice(6, 8).map((card, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-xl border-2 border-gray-300 bg-white hover:border-orange-400 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 group/card"
                  >
                    <span className="text-3xl">{card.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-700">{card.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
