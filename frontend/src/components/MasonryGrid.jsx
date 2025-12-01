import React from 'react';
import { motion } from 'framer-motion';

export function MasonryGrid({ items, renderItem, columns = 4 }) {
    return (
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${columns} gap-6 p-4`}>
            {items.map((item, idx) => (
                <motion.div
                    key={item.id || idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                    {renderItem(item)}
                </motion.div>
            ))}
        </div>
    );
}
