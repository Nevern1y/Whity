"use client"

import { Card3D } from "@/components/ui/card-3d"
import { navigation } from "@/config/navigation"
import Link from "next/link"
import { motion } from "framer-motion"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
} as const;

export default function HomeCards() {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {navigation.map((group) =>
        group.items.map((item) => (
          <motion.div key={item.href} variants={variants}>
            <Link href={item.href}>
              <Card3D
                className="group p-6"
                gradient="bg-gradient-to-br from-primary/5 to-primary/10"
              >
                <div className="flex items-start space-x-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Перейти в раздел {item.name.toLowerCase()}
                    </p>
                  </div>
                </div>
              </Card3D>
            </Link>
          </motion.div>
        ))
      )}
    </motion.div>
  )
} 