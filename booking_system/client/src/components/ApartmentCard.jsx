import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Heart } from 'lucide-react'

export default function ApartmentCard({ apartment }) {
  const { id, title, city, address, pricePerNight, averageRating, totalReviews, rooms, maxGuests, images } = apartment
  const [isFavorite, setIsFavorite] = useState(false)
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/apartment/${id}`)
  }

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  return (
    <div className="group cursor-pointer" onClick={handleCardClick}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-xl mb-3">
        <img
          src={images?.[0] || `https://source.unsplash.com/400x400/?apartment,interior,${id}`}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 hover:scale-110 transition"
        >
          <Heart 
            className={`w-6 h-6 text-white ${isFavorite ? 'fill-airbnb-red' : 'fill-black/20'} hover:fill-white/80`} 
            strokeWidth={1.5} 
          />
        </button>
        <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
          Выбор гостей
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-airbnb-dark truncate flex-1">{city}</h3>
          <div className="flex items-center gap-1 ml-2">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold">{averageRating?.toFixed(1) || '5.0'}</span>
          </div>
        </div>
        
        <p className="text-airbnb-gray text-sm truncate">{address}</p>
        <p className="text-airbnb-gray text-sm">{rooms} комнат · до {maxGuests} гостей</p>
        
        <div className="mt-1">
          <span className="font-semibold text-airbnb-dark">{pricePerNight} ₽</span>
          <span className="text-airbnb-gray text-sm"> / ночь</span>
        </div>
        
        {totalReviews > 0 && (
          <p className="text-airbnb-gray text-xs">{totalReviews} отзывов</p>
        )}
      </div>
    </div>
  )
}
