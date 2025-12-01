import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export function PersonCard({ person, onClick }) {
    if (!person) return null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="group relative bg-[#1a1a1a] rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10"
            onClick={() => onClick(person)}
        >
            {/* Image Container */}
            <div className="aspect-[2/3] overflow-hidden relative">
                {person.profile_url ? (
                    <img
                        src={person.profile_url}
                        alt={person.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                        <User size={48} />
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg truncate">{person.name}</h3>
                <p className="text-gray-400 text-sm">{person.known_for_department}</p>
            </div>
        </motion.div>
    );
}
