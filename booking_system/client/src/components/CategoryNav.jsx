import React from 'react'
import { Home, Building2 } from 'lucide-react'

const categories = [
  { icon: Home, label: 'Жилье', active: true },
  { icon: Building2, label: 'Впечатления' },
]

export default function CategoryNav() {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 overflow-x-auto py-4 scrollbar-hide">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`flex flex-col items-center gap-2 min-w-fit pb-2 border-b-2 transition ${
                category.active
                  ? 'border-airbnb-dark opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'
              }`}
            >
              <category.icon className="w-6 h-6" />
              <span className="text-xs font-semibold whitespace-nowrap">{category.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
