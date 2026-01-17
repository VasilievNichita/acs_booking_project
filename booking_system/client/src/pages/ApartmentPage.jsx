import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Heart, Share, MapPin, Users, Home, Calendar } from 'lucide-react'

export default function ApartmentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [apartment, setApartment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  })

  useEffect(() => {
    loadApartment()
  }, [id])

  const loadApartment = async () => {
    try {
      const response = await fetch(`/api/apartments/${id}`)
      if (response.ok) {
        const data = await response.json()
        setApartment(data)
      } else {
        // Если конкретный endpoint не работает, загрузим из списка
        const listResponse = await fetch('/api/apartments/available')
        const apartments = await listResponse.json()
        const found = apartments.find(a => a.id === parseInt(id))
        if (found) setApartment(found)
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = () => {
    alert(`Бронирование квартиры #${id}\nДата заезда: ${bookingData.checkIn}\nДата выезда: ${bookingData.checkOut}\nГостей: ${bookingData.guests}`)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded-xl mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  if (!apartment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Квартира не найдена</h1>
        <button 
          onClick={() => navigate('/')}
          className="text-airbnb-red hover:underline"
        >
          Вернуться на главную
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Кнопка назад */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Назад к списку</span>
      </button>

      {/* Заголовок */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2">{apartment.title || apartment.city}</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current" />
              {apartment.averageRating?.toFixed(1) || '5.0'}
            </span>
            <span className="text-gray-500">·</span>
            <span className="underline">{apartment.totalReviews || 0} отзывов</span>
            <span className="text-gray-500">·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {apartment.address}, {apartment.city}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-lg">
            <Share className="w-4 h-4" />
            <span className="underline">Поделиться</span>
          </button>
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className="flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-lg"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-airbnb-red text-airbnb-red' : ''}`} />
            <span className="underline">Сохранить</span>
          </button>
        </div>
      </div>

      {/* Галерея фотографий - МЕСТО ДЛЯ ВАШИХ ФОТО */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[500px] mb-8 rounded-xl overflow-hidden">
        {/* Главное фото */}
        <div className="col-span-2 row-span-2 bg-gray-200 relative">
          <img 
            src={apartment.images?.[0] || '/images/apartment-1.jpg'} 
            alt="Главное фото"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.classList.add('flex', 'items-center', 'justify-center')
              e.target.parentElement.innerHTML = '<span class="text-gray-400 text-lg">Фото 1 (главное)</span>'
            }}
          />
        </div>
        {/* Дополнительные фото */}
        {[2, 3, 4, 5].map((num) => (
          <div key={num} className="bg-gray-200 relative">
            <img 
              src={apartment.images?.[num-1] || `/images/apartment-${num}.jpg`}
              alt={`Фото ${num}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.classList.add('flex', 'items-center', 'justify-center')
                e.target.parentElement.innerHTML = `<span class="text-gray-400">Фото ${num}</span>`
              }}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-12">
        {/* Левая колонка - информация */}
        <div className="col-span-2">
          {/* Характеристики */}
          <div className="border-b pb-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">
              Жилье целиком в {apartment.city}
            </h2>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                до {apartment.maxGuests} гостей
              </span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                {apartment.rooms} комнат
              </span>
            </div>
          </div>

          {/* Описание */}
          <div className="border-b pb-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Описание</h3>
            <p className="text-gray-600 leading-relaxed">
              {apartment.description || `Уютная квартира в самом сердце ${apartment.city}. Идеальное место для отдыха и путешествий. 
              В квартире есть всё необходимое для комфортного проживания: полностью оборудованная кухня, 
              удобные кровати, быстрый Wi-Fi и современная бытовая техника.
              
              Расположение идеальное - в пешей доступности кафе, рестораны, магазины и основные достопримечательности города.`}
            </p>
          </div>

          {/* Удобства */}
          <div className="border-b pb-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Удобства</h3>
            <div className="grid grid-cols-2 gap-4">
              {['Wi-Fi', 'Кухня', 'Стиральная машина', 'Кондиционер', 'Отопление', 'Телевизор', 'Утюг', 'Фен'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-gray-600">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Отзывы */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              <span className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-current" />
                {apartment.averageRating?.toFixed(1) || '5.0'} · {apartment.totalReviews || 0} отзывов
              </span>
            </h3>
            {apartment.totalReviews > 0 ? (
              <div className="grid grid-cols-2 gap-6">
                {/* Здесь будут отзывы */}
                <p className="text-gray-500">Отзывы загружаются...</p>
              </div>
            ) : (
              <p className="text-gray-500">Пока нет отзывов. Будьте первым!</p>
            )}
          </div>
        </div>

        {/* Правая колонка - форма бронирования */}
        <div className="col-span-1">
          <div className="sticky top-24 border rounded-xl p-6 shadow-lg">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <span className="text-2xl font-semibold">{apartment.pricePerNight} ₽</span>
                <span className="text-gray-500"> / ночь</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-current" />
                <span>{apartment.averageRating?.toFixed(1) || '5.0'}</span>
              </div>
            </div>

            <div className="border rounded-lg mb-4">
              <div className="grid grid-cols-2 border-b">
                <div className="p-3 border-r">
                  <label className="block text-xs font-semibold mb-1">ПРИБЫТИЕ</label>
                  <input 
                    type="date" 
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                    className="w-full text-sm focus:outline-none"
                  />
                </div>
                <div className="p-3">
                  <label className="block text-xs font-semibold mb-1">ВЫЕЗД</label>
                  <input 
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                    className="w-full text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="p-3">
                <label className="block text-xs font-semibold mb-1">ГОСТИ</label>
                <select 
                  value={bookingData.guests}
                  onChange={(e) => setBookingData({...bookingData, guests: e.target.value})}
                  className="w-full text-sm focus:outline-none"
                >
                  {[...Array(apartment.maxGuests)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'гость' : 'гостей'}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={handleBooking}
              className="w-full bg-airbnb-red text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
            >
              Забронировать
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              Пока с вас не будет списана оплата
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
