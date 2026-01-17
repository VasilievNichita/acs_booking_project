import React from 'react'
import ApartmentGrid from '../components/ApartmentGrid'

export default function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-airbnb-dark mb-2">
          Популярное жилье
        </h1>
        <p className="text-airbnb-gray">
          Откройте для себя лучшие варианты размещения
        </p>
      </div>
      
      <ApartmentGrid />
      
      {/* Inspiration Section */}
      <div className="mt-16 mb-12">
        <h2 className="text-2xl font-semibold text-airbnb-dark mb-6">
          Вдохновение для будущих поездок
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Будапешт', 'Бухарест', 'Сектор 1', 'Милан'].map((city, index) => (
            <div key={index} className="cursor-pointer group">
              <div className="aspect-square overflow-hidden rounded-lg mb-2">
                <img
                  src={`https://source.unsplash.com/400x400/?${city},city`}
                  alt={city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-semibold text-airbnb-dark">{city}</h3>
              <p className="text-sm text-airbnb-gray">Квартиры</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
