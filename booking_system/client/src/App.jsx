import React, { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Header from './components/Header'
import CategoryNav from './components/CategoryNav'
import AdminPanel from './pages/AdminPanel'
import { Star, Heart, Send, MessageCircle } from 'lucide-react'

// Контекст для избранного и пользователя
const AppContext = createContext()
export const useApp = () => useContext(AppContext)

// Провайдер контекста
function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })
  
  // Избранное привязано к пользователю
  const [favorites, setFavorites] = useState(() => {
    const userId = JSON.parse(localStorage.getItem('currentUser') || '{}')?.id
    if (userId) {
      const saved = localStorage.getItem(`favorites_${userId}`)
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [searchFilters, setSearchFilters] = useState({ city: '', checkIn: '', checkOut: '', guests: '' })

  // При смене пользователя загружаем его избранное
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
      const saved = localStorage.getItem(`favorites_${currentUser.id}`)
      setFavorites(saved ? JSON.parse(saved) : [])
    } else {
      localStorage.removeItem('currentUser')
      setFavorites([])
    }
  }, [currentUser])

  // Сохраняем избранное для текущего пользователя
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`favorites_${currentUser.id}`, JSON.stringify(favorites))
    }
  }, [favorites, currentUser])

  const toggleFavorite = (apartmentId) => {
    setFavorites(prev => 
      prev.includes(apartmentId) 
        ? prev.filter(id => id !== apartmentId)
        : [...prev, apartmentId]
    )
  }

  return (
    <AppContext.Provider value={{ favorites, toggleFavorite, currentUser, setCurrentUser, searchFilters, setSearchFilters }}>
      {children}
    </AppContext.Provider>
  )
}

// Карточка квартиры
function ApartmentCard({ apartment }) {
  const { favorites, toggleFavorite } = useApp()
  const navigate = useNavigate()
  const { id, city, address, pricePerNight, averageRating, rooms, maxGuests } = apartment
  const isFavorite = favorites.includes(id)

  const mainPhoto = apartment.photos && apartment.photos.length > 0 ? apartment.photos[0] : null

  return (
    <div className="group cursor-pointer" onClick={() => navigate(`/apartment/${id}`)}>
      <div className="relative aspect-square overflow-hidden rounded-xl mb-3">
        {mainPhoto ? (
          <img 
            src={mainPhoto} 
            alt={apartment.title || city} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
            <span className="text-white text-4xl">🏠</span>
          </div>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(id) }}
          className="absolute top-3 right-3 p-2 hover:scale-110 transition"
        >
          <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} style={{stroke: isFavorite ? '#ef4444' : '#000', strokeWidth: 1.5}} />
        </button>
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{city}</h3>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-sm">{averageRating?.toFixed(1) || '5.0'}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm">{address}</p>
        <p className="text-gray-500 text-sm">{rooms} комнат · до {maxGuests} гостей</p>
        <p className="mt-1"><span className="font-semibold">{pricePerNight} €</span> <span className="text-gray-500">/ ночь</span></p>
      </div>
    </div>
  )
}

// Карточка города - кликабельная
function CityCard({ city, label, onClick }) {
  return (
    <div className="cursor-pointer group" onClick={onClick}>
      <div className="aspect-square rounded-lg bg-gray-100 mb-2 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:scale-105 group-hover:bg-gray-200 transition">
          <span className="text-lg">📍{city}</span>
        </div>
      </div>
      <h3 className="font-medium">{city}</h3>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  )
}

// Главная страница с фильтрацией
function HomePage() {
  const [apartments, setApartments] = useState([])
  const [filteredApartments, setFilteredApartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { searchFilters } = useApp()
  
  const cityFilter = searchParams.get('city') || searchFilters.city

  useEffect(() => {
    fetch('/api/apartments/available')
      .then(res => {
        if (!res.ok) throw new Error('API error')
        return res.json()
      })
      .then(data => { 
        setApartments(Array.isArray(data) ? data : [])
        setLoading(false) 
      })
      .catch(err => {
        console.error('Error loading apartments:', err)
        setApartments([])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (cityFilter) {
      const filtered = apartments.filter(apt => 
        apt.city?.toLowerCase().includes(cityFilter.toLowerCase())
      )
      setFilteredApartments(filtered)
    } else {
      setFilteredApartments(apartments)
    }
  }, [apartments, cityFilter])

  const inspirationCities = [
    { city: 'Будапешт', label: 'Квартиры' },
    { city: 'Бухарест', label: 'Квартиры' },
    { city: 'Кишинёв', label: 'Квартиры' },
    { city: 'Милан', label: 'Квартиры' },
    { city: 'Москва', label: 'Квартиры' },
    { city: 'Санкт-Петербург', label: 'Квартиры' }
  ]

  const handleCityClick = (city) => {
    navigate(`/?city=${encodeURIComponent(city)}`)
  }

  const clearFilter = () => {
    navigate('/')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Фильтр по городу */}
      {cityFilter && (
        <div className="mb-6 flex items-center gap-4">
          <span className="text-gray-600">Результаты для: <strong>{cityFilter}</strong></span>
          <button onClick={clearFilter} className="text-pink-600 hover:underline">Сбросить фильтр</button>
        </div>
      )}

      {/* Популярное жилье */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-2">
          {cityFilter ? `Квартиры в городе ${cityFilter}` : 'Популярное жилье'}
        </h2>
        <p className="text-gray-500 mb-6">Откройте для себя лучшие варианты размещения</p>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredApartments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredApartments.map(apt => (
              <ApartmentCard key={apt.id} apartment={apt} />
            ))}
          </div>
        ) : cityFilter ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-600 text-lg mb-2">На данный момент в городе {cityFilter} нет доступных квартир.</p>
            <p className="text-gray-500">Благодарим за понимание!</p>
            <p className="text-gray-400 text-sm mt-2">С уважением, руководство сайта TravelNv</p>
          </div>
        ) : (
          <p className="text-gray-500">Нет доступных квартир</p>
        )}
      </section>

      {/* Вдохновение для поездок - кликабельное */}
      {!cityFilter && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">Вдохновение для будущих поездок</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {inspirationCities.map(item => (
              <CityCard 
                key={item.city} 
                {...item} 
                onClick={() => handleCityClick(item.city)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// Страница квартиры с бронированием и отзывами
function ApartmentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, favorites, toggleFavorite } = useApp()
  const [apt, setApt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [pets, setPets] = useState(0)
  const [guestPickerOpen, setGuestPickerOpen] = useState(false)
  const guests = adults + children
  const [booking, setBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(null)
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState('')
  const [newRating, setNewRating] = useState(5)
  
  const isFavorite = favorites.includes(parseInt(id))

  useEffect(() => {
    fetch('/api/apartments/available')
      .then(res => res.json())
      .then(data => {
        const found = data.find(a => a.id === parseInt(id))
        setApt(found)
        setLoading(false)
      })
    // Загрузка отзывов из localStorage (имитация)
    const savedReviews = localStorage.getItem(`reviews_${id}`)
    if (savedReviews) setReviews(JSON.parse(savedReviews))
  }, [id])

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0
    const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
    return days > 0 ? days * apt.pricePerNight : 0
  }

  const handleBooking = async () => {
    if (!currentUser) {
      alert('Пожалуйста, войдите в систему для бронирования')
      return
    }
    if (!checkIn || !checkOut) {
      alert('Выберите даты заезда и выезда')
      return
    }

    setBooking(true)
    try {
      const bookingRequest = {
        apartmentId: apt.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests
      }
      console.log('Creating booking:', bookingRequest, 'for user:', currentUser.id)
      
      const response = await fetch(`/api/bookings?clientId=${currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingRequest)
      })
      
      console.log('Booking response status:', response.status)
      
      if (response.ok) {
        const bookingData = await response.json()
        setBookingSuccess({
          id: bookingData.id,
          apartmentTitle: apt.title || apt.city,
          address: apt.address,
          checkIn,
          checkOut,
          guests,
          totalAmount: bookingData.totalAmount || calculateTotal(),
          paidAt: new Date().toISOString(),
          status: 'CONFIRMED'
        })
      } else {
        const errorText = await response.text()
        console.error('Booking error:', errorText)
        alert('Ошибка бронирования: ' + (errorText || 'Попробуйте ещё раз'))
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Ошибка сети. Проверьте подключение.')
    } finally {
      setBooking(false)
    }
  }

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    if (!newReview.trim()) return
    
    const review = {
      id: Date.now(),
      author: currentUser?.firstName || 'Гость',
      rating: newRating,
      text: newReview,
      date: new Date().toLocaleDateString('ru-RU')
    }
    const updatedReviews = [...reviews, review]
    setReviews(updatedReviews)
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews))
    setNewReview('')
    setNewRating(5)
  }

  if (loading) return <div className="p-8 text-center">Загрузка...</div>
  if (!apt) return <div className="p-8 text-center">Квартира не найдена</div>

  // Модальное окно успешного бронирования (чек)
  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-700 mb-4">Бронирование подтверждено!</h1>
          
          <div className="bg-white rounded-lg p-6 text-left mb-6 shadow">
            <h2 className="font-bold text-lg mb-4 border-b pb-2">🎫 Ваш чек / тикет</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Номер брони:</strong> #{bookingSuccess.id}</p>
              <p><strong>Квартира:</strong> {bookingSuccess.apartmentTitle}</p>
              <p><strong>Адрес:</strong> {bookingSuccess.address}</p>
              <p><strong>Заезд:</strong> {bookingSuccess.checkIn}</p>
              <p><strong>Выезд:</strong> {bookingSuccess.checkOut}</p>
              <p><strong>Гостей:</strong> {bookingSuccess.guests}</p>
              <p className="text-lg font-bold text-green-600 pt-2 border-t">
                Итого оплачено: {bookingSuccess.totalAmount} €
              </p>
              <p className="text-gray-500 text-xs">Дата оплаты: {new Date(bookingSuccess.paidAt).toLocaleString('ru-RU')}</p>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">Чек сохранён в разделе "Мои бронирования"</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    )
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : apt.averageRating?.toFixed(1) || '5.0'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/')} className="mb-6 text-pink-600 hover:underline">
        ← Назад к списку
      </button>
      
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-bold">{apt.title || apt.city}</h1>
        <button onClick={() => toggleFavorite(parseInt(id))} className="p-2">
          <Heart className={`w-8 h-8 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
      </div>
      <p className="text-gray-600 mb-6">{apt.address}, {apt.city}</p>

      {/* Галерея фото */}
      <div className="grid grid-cols-4 gap-2 mb-8 h-96">
        {apt.photos && apt.photos.length > 0 ? (
          <>
            <div className="col-span-2 row-span-2 rounded-l-xl overflow-hidden">
              <img src={apt.photos[0]} alt="" className="w-full h-full object-cover" />
            </div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`overflow-hidden ${i === 2 ? 'rounded-tr-xl' : i === 4 ? 'rounded-br-xl' : ''}`}>
                {apt.photos[i] ? (
                  <img src={apt.photos[i]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                )}
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="col-span-2 row-span-2 bg-gradient-to-br from-pink-400 to-purple-500 rounded-l-xl flex items-center justify-center">
              <span className="text-white text-6xl">🏠</span>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-pink-400"></div>
            <div className="bg-gradient-to-br from-pink-300 to-purple-400 rounded-tr-xl"></div>
            <div className="bg-gradient-to-br from-purple-300 to-pink-300"></div>
            <div className="bg-gradient-to-br from-pink-400 to-purple-300 rounded-br-xl"></div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="border-b pb-6 mb-6">
            <h2 className="text-2xl font-semibold mb-2">Жилье целиком</h2>
            <p className="text-gray-600">{apt.rooms} комнат · до {apt.maxGuests} гостей</p>
          </div>
          
          <div className="border-b pb-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Описание</h3>
            <p className="text-gray-600">{apt.description || 'Уютная квартира в самом сердце города. Идеальное место для отдыха и путешествий.'}</p>
          </div>

          <div className="border-b pb-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Удобства</h3>
            <div className="grid grid-cols-2 gap-4 text-gray-600">
              {apt.hasWifi && <div>📶 Wi-Fi</div>}
              {apt.hasKitchen && <div>🍳 Кухня</div>}
              {apt.hasWasher && <div>🧺 Стиральная машина</div>}
              {apt.hasAirConditioning && <div>❄️ Кондиционер</div>}
              {apt.hasTv && <div>📺 Телевизор</div>}
              {apt.hasParking && <div>🅿️ Парковка</div>}
              {apt.hasPool && <div>🏊 Бассейн</div>}
              {apt.hasBalcony && <div>🌅 Балкон</div>}
            </div>
          </div>

          {/* Отзывы */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 fill-current" /> {avgRating} · {reviews.length} отзывов
            </h3>
            
            {reviews.length > 0 ? (
              <div className="space-y-4 mb-6">
                {reviews.map(review => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{review.author}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600">{review.text}</p>
                    <p className="text-gray-400 text-sm mt-2">{review.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">Пока нет отзывов. Будьте первым!</p>
            )}

            {/* Форма отзыва */}
            <form onSubmit={handleReviewSubmit} className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-3">Оставить отзыв</h4>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">Оценка:</span>
                {[1,2,3,4,5].map(star => (
                  <button 
                    key={star} 
                    type="button"
                    onClick={() => setNewRating(star)}
                  >
                    <Star className={`w-6 h-6 ${star <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <textarea 
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Напишите ваш отзыв..."
                className="w-full p-3 border rounded-lg mb-3"
                rows={3}
              />
              <button type="submit" className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700">
                Отправить отзыв
              </button>
            </form>
          </div>
        </div>

        {/* Форма бронирования */}
        <div className="border rounded-xl p-6 shadow-lg h-fit sticky top-24">
          <p className="text-2xl font-bold mb-4">{apt.pricePerNight} € <span className="font-normal text-base">/ ночь</span></p>
          <div className="border rounded-lg mb-4">
            <div className="grid grid-cols-2 border-b">
              <div className="p-3 border-r">
                <label className="text-xs font-semibold">ПРИБЫТИЕ</label>
                <input 
                  type="date" 
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full mt-1" 
                />
              </div>
              <div className="p-3">
                <label className="text-xs font-semibold">ВЫЕЗД</label>
                <input 
                  type="date" 
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full mt-1" 
                />
              </div>
            </div>
            <div className="p-3 relative">
              <label className="text-xs font-semibold">ДЛЯ КОГО</label>
              <button 
                type="button"
                onClick={() => setGuestPickerOpen(!guestPickerOpen)}
                className="w-full mt-1 text-left flex justify-between items-center py-2"
              >
                <span>{guests} {guests === 1 ? 'гость' : guests < 5 ? 'гостя' : 'гостей'}{infants > 0 ? `, ${infants} млад.` : ''}</span>
                <span className="text-xl">{guestPickerOpen ? '∧' : '∨'}</span>
              </button>
              
              {guestPickerOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-xl shadow-lg z-50 p-4 mt-1">
                  {/* Взрослые */}
                  <div className="flex justify-between items-center py-4 border-b">
                    <div>
                      <div className="font-medium">Взрослые</div>
                      <div className="text-sm text-gray-500">От 13 лет</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        disabled={adults <= 1}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30 hover:border-gray-500"
                      >−</button>
                      <span className="w-6 text-center">{adults}</span>
                      <button 
                        type="button"
                        onClick={() => setAdults(Math.min(apt.maxGuests - children, adults + 1))}
                        disabled={adults + children >= apt.maxGuests}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30 hover:border-gray-500"
                      >+</button>
                    </div>
                  </div>
                  
                  {/* Дети */}
                  <div className="flex justify-between items-center py-4 border-b">
                    <div>
                      <div className="font-medium">Дети</div>
                      <div className="text-sm text-gray-500">2–12 лет</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        disabled={children <= 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30 hover:border-gray-500"
                      >−</button>
                      <span className="w-6 text-center">{children}</span>
                      <button 
                        type="button"
                        onClick={() => setChildren(Math.min(apt.maxGuests - adults, children + 1))}
                        disabled={adults + children >= apt.maxGuests}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30 hover:border-gray-500"
                      >+</button>
                    </div>
                  </div>
                  
                  {/* Младенцы */}
                  <div className="flex justify-between items-center py-4 border-b">
                    <div>
                      <div className="font-medium">Младенцы</div>
                      <div className="text-sm text-gray-500">Младше 2</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setInfants(Math.max(0, infants - 1))}
                        disabled={infants <= 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30 hover:border-gray-500"
                      >−</button>
                      <span className="w-6 text-center">{infants}</span>
                      <button 
                        type="button"
                        onClick={() => setInfants(Math.min(5, infants + 1))}
                        disabled={infants >= 5}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30 hover:border-gray-500"
                      >+</button>
                    </div>
                  </div>
                  
                  {/* Питомцы */}
                  <div className="flex justify-between items-center py-4 border-b">
                    <div>
                      <div className="font-medium">Питомцы</div>
                      <div className="text-sm text-gray-500">Путешествуете с животным-помощником?</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setPets(Math.max(0, pets - 1))}
                        disabled={pets <= 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30 hover:border-gray-500"
                      >−</button>
                      <span className="w-6 text-center">{pets}</span>
                      <button 
                        type="button"
                        onClick={() => setPets(Math.min(2, pets + 1))}
                        disabled={pets >= 2}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30 hover:border-gray-500"
                      >+</button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-3 mb-3">
                    Жильё рассчитано максимум на {apt.maxGuests} гостей, не считая младенцев. Проживание с питомцами не разрешается.
                  </p>
                  
                  <button 
                    type="button"
                    onClick={() => setGuestPickerOpen(false)}
                    className="w-full text-right font-semibold underline"
                  >
                    Закрыть
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {calculateTotal() > 0 && (
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between mb-2">
                <span>{apt.pricePerNight} € × {Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))} ночей</span>
                <span>{calculateTotal()} €</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Итого</span>
                <span>{calculateTotal()} €</span>
              </div>
            </div>
          )}
          
          <button 
            onClick={handleBooking}
            disabled={booking}
            className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50"
          >
            {booking ? 'Обработка...' : 'Забронировать'}
          </button>
          
          {!currentUser && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Войдите для бронирования
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Страница избранного
function FavoritesPage() {
  const { favorites } = useApp()
  const [apartments, setApartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/apartments/available')
      .then(res => res.json())
      .then(data => {
        const favApts = data.filter(apt => favorites.includes(apt.id))
        setApartments(favApts)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [favorites])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">❤️ Избранное</h1>
      {loading ? (
        <p>Загрузка...</p>
      ) : apartments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {apartments.map(apt => (
            <ApartmentCard key={apt.id} apartment={apt} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg">У вас пока нет избранных квартир</p>
          <p className="text-gray-400 mt-2">Нажмите ❤️ на понравившейся квартире</p>
        </div>
      )}
    </div>
  )
}

// Страница бронирований (тикеты)
function BookingsPage() {
  const { currentUser } = useApp()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      // Загружаем бронирования с сервера
      console.log('Loading bookings for user:', currentUser.id)
      fetch(`/api/bookings/client/${currentUser.id}`)
        .then(res => {
          console.log('Bookings response status:', res.status)
          return res.ok ? res.json() : []
        })
        .then(data => {
          console.log('Bookings data:', data)
          setTickets(Array.isArray(data) ? data : [])
          setLoading(false)
        })
        .catch(err => {
          console.error('Bookings error:', err)
          setTickets([])
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">🎫 Мои бронирования</h1>
        <p className="text-gray-500">Войдите в систему чтобы увидеть ваши бронирования</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🎫 Мои бронирования</h1>
      <p className="text-xs text-gray-400 mb-4">User ID: {currentUser?.id} | Email: {currentUser?.email}</p>
      {tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="border rounded-xl p-6 bg-white shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{ticket.apartmentTitle || ticket.apartmentCity}</h3>
                  <p className="text-gray-500">{ticket.apartmentAddress}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  ticket.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                  ticket.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                }`}>
                  {ticket.status === 'CONFIRMED' ? 'Подтверждено' : 
                   ticket.status === 'CHECKED_IN' ? 'Заселён' : ticket.status}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Заезд</p>
                  <p className="font-semibold">{ticket.checkIn}</p>
                </div>
                <div>
                  <p className="text-gray-500">Выезд</p>
                  <p className="font-semibold">{ticket.checkOut}</p>
                </div>
                <div>
                  <p className="text-gray-500">Гостей</p>
                  <p className="font-semibold">{ticket.guests}</p>
                </div>
                <div>
                  <p className="text-gray-500">Оплачено</p>
                  <p className="font-semibold text-green-600">{ticket.totalAmount} €</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-4">
                Номер брони: #{ticket.id} | Создано: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('ru-RU') : '-'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg">У вас пока нет бронирований</p>
        </div>
      )}
    </div>
  )
}

// Страница центра помощи
function HelpCenterPage() {
  const { currentUser } = useApp()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const ticket = {
      id: Date.now(),
      from: currentUser?.email || 'guest@example.com',
      fromName: currentUser?.firstName || 'Гость',
      subject,
      message,
      date: new Date().toISOString(),
      status: 'open'
    }
    const supportTickets = JSON.parse(localStorage.getItem('supportTickets') || '[]')
    supportTickets.push(ticket)
    localStorage.setItem('supportTickets', JSON.stringify(supportTickets))
    setSent(true)
  }

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-700 mb-4">Сообщение отправлено!</h1>
          <p className="text-gray-600 mb-6">Администратор ответит вам в ближайшее время</p>
          <a href="/" className="bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 inline-block">
            Вернуться на главную
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🆘 Центр помощи</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 shadow">
        <div className="mb-4">
          <label className="block font-semibold mb-2">Тема обращения</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Например: Проблема с бронированием"
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Описание проблемы</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Опишите вашу проблему подробно..."
            className="w-full p-3 border rounded-lg"
            rows={6}
            required
          />
        </div>
        <button type="submit" className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700">
          Отправить сообщение
        </button>
      </form>
    </div>
  )
}

// Страница сообщений
function MessagesPage() {
  const { currentUser } = useApp()
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const supportTickets = JSON.parse(localStorage.getItem('supportTickets') || '[]')
    const userMessages = supportTickets.filter(t => t.from === currentUser?.email)
    setMessages(userMessages)
  }, [currentUser])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">💬 Сообщения</h1>
      {messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className="border rounded-xl p-4 bg-white shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{msg.subject}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  msg.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                }`}>
                  {msg.status === 'open' ? 'Ожидает ответа' : 'Отвечено'}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{msg.message}</p>
              <p className="text-gray-400 text-xs mt-2">{new Date(msg.date).toLocaleString('ru-RU')}</p>
              {msg.reply && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-pink-600">Ответ администратора:</p>
                  <p className="text-sm">{msg.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">У вас пока нет сообщений</p>
          <a href="/help" className="text-pink-600 hover:underline mt-2 inline-block">
            Обратиться в поддержку
          </a>
        </div>
      )}
    </div>
  )
}

// Страница добавления квартиры
function AddApartmentPage() {
  const { currentUser } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: 'Кишинёв',
    pricePerNight: '',
    rooms: 1,
    maxGuests: 2,
    beds: 1,
    bathrooms: 1,
    hasWifi: true,
    hasParking: false,
    hasKitchen: true,
    hasAirConditioning: false,
    hasWasher: false,
    hasTv: true,
    hasPool: false,
    hasBalcony: false,
    photos: []
  })
  const [photoUrl, setPhotoUrl] = useState('')

  const addPhoto = () => {
    if (photoUrl.trim()) {
      setFormData({ ...formData, photos: [...formData.photos, photoUrl.trim()] })
      setPhotoUrl('')
    }
  }

  const removePhoto = (index) => {
    setFormData({ ...formData, photos: formData.photos.filter((_, i) => i !== index) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!currentUser) {
      alert('Войдите в систему')
      return
    }
    if (formData.photos.length === 0) {
      alert('Добавьте хотя бы 1 фото')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/apartments?ownerId=${currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pricePerNight: parseFloat(formData.pricePerNight)
        })
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => navigate('/'), 2000)
      } else {
        alert('Ошибка при создании квартиры')
      }
    } catch (err) {
      alert('Ошибка: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Сдать жильё</h1>
        <p className="text-gray-500">Войдите в систему чтобы добавить квартиру</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-2xl font-bold text-green-700 mb-4">Квартира добавлена!</h1>
          <p className="text-gray-600">Она появится на сайте для всех пользователей</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🏠 Сдать жильё в аренду</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Основная информация</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Название</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Уютная квартира в центре города"
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Описание</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Опишите вашу квартиру..."
                className="w-full p-3 border rounded-lg"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Город</label>
                <select
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="Кишинёв">Кишинёв</option>
                  <option value="Москва">Москва</option>
                  <option value="Санкт-Петербург">Санкт-Петербург</option>
                  <option value="Будапешт">Будапешт</option>
                  <option value="Бухарест">Бухарест</option>
                  <option value="Милан">Милан</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Цена за ночь (€)</label>
                <input
                  type="number"
                  value={formData.pricePerNight}
                  onChange={e => setFormData({...formData, pricePerNight: e.target.value})}
                  placeholder="50"
                  className="w-full p-3 border rounded-lg"
                  required
                  min="1"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Адрес</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="ул. Пушкина, д. 10, кв. 5"
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>
          </div>
        </div>

        {/* Параметры */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Параметры жилья</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-medium mb-1">Комнат</label>
              <input
                type="number"
                value={formData.rooms}
                onChange={e => setFormData({...formData, rooms: parseInt(e.target.value)})}
                className="w-full p-3 border rounded-lg"
                min="1"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Кроватей</label>
              <input
                type="number"
                value={formData.beds}
                onChange={e => setFormData({...formData, beds: parseInt(e.target.value)})}
                className="w-full p-3 border rounded-lg"
                min="1"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Ванных</label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={e => setFormData({...formData, bathrooms: parseInt(e.target.value)})}
                className="w-full p-3 border rounded-lg"
                min="1"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Макс. гостей</label>
              <input
                type="number"
                value={formData.maxGuests}
                onChange={e => setFormData({...formData, maxGuests: parseInt(e.target.value)})}
                className="w-full p-3 border rounded-lg"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Удобства */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Удобства</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'hasWifi', label: '📶 Wi-Fi' },
              { key: 'hasParking', label: '🅿️ Парковка' },
              { key: 'hasKitchen', label: '🍳 Кухня' },
              { key: 'hasAirConditioning', label: '❄️ Кондиционер' },
              { key: 'hasWasher', label: '🧺 Стиральная машина' },
              { key: 'hasTv', label: '📺 Телевизор' },
              { key: 'hasPool', label: '🏊 Бассейн' },
              { key: 'hasBalcony', label: '🌅 Балкон' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[item.key]}
                  onChange={e => setFormData({...formData, [item.key]: e.target.checked})}
                  className="w-5 h-5 rounded"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Фотографии */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Фотографии (минимум 1, максимум 5)</h2>
          
          {/* Загрузка файлов */}
          {formData.photos.length < 5 && (
            <div className="mb-4">
              <label className="block mb-2">
                <span className="bg-pink-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-pink-700 inline-block">
                  📷 Загрузить фото ({formData.photos.length}/5)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    const remaining = 5 - formData.photos.length
                    files.slice(0, remaining).forEach(file => {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        setFormData(prev => ({
                          ...prev, 
                          photos: [...prev.photos, event.target.result]
                        }))
                      }
                      reader.readAsDataURL(file)
                    })
                  }}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">Или вставьте URL:</p>
              <div className="flex gap-2 mt-1">
                <input
                  type="url"
                  value={photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 p-3 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={addPhoto}
                  disabled={formData.photos.length >= 5}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          )}
          
          {/* Превью фото */}
          {formData.photos.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {formData.photos.map((url, i) => (
                <div key={i} className="relative group aspect-square">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      Главное
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {formData.photos.length === 0 && (
            <p className="text-red-500 text-sm mt-2">* Необходимо добавить хотя бы 1 фото</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-pink-700 disabled:opacity-50"
        >
          {loading ? 'Сохранение...' : '✓ Опубликовать квартиру'}
        </button>
      </form>
    </div>
  )
}

// Страница "Мои квартиры" для владельцев
function MyApartmentsPage() {
  const { currentUser } = useApp()
  const [apartments, setApartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      fetch(`/api/apartments/owner/${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          setApartments(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Мои квартиры</h1>
        <p className="text-gray-500">Войдите в систему</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🏠 Мои квартиры</h1>
        <a href="/add-apartment" className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700">
          + Добавить квартиру
        </a>
      </div>
      {loading ? (
        <p>Загрузка...</p>
      ) : apartments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apartments.map(apt => (
            <div key={apt.id} className="border rounded-xl overflow-hidden bg-white shadow">
              <div className="h-48 bg-gray-200">
                {apt.photos && apt.photos[0] ? (
                  <img src={apt.photos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Нет фото
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{apt.title}</h3>
                <p className="text-gray-500 text-sm">{apt.city}, {apt.address}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold">{apt.pricePerNight} €/ночь</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    apt.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {apt.status === 'AVAILABLE' ? 'Доступна' : apt.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-4">У вас пока нет квартир</p>
          <a href="/add-apartment" className="text-pink-600 hover:underline">
            Добавить первую квартиру
          </a>
        </div>
      )}
    </div>
  )
}

// Панель владельца
function OwnerDashboard() {
  const { currentUser } = useApp()
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser && (currentUser.role === 'OWNER' || currentUser.role === 'ADMIN')) {
      Promise.all([
        fetch(`/api/admin/owner/${currentUser.id}/stats`).then(r => r.ok ? r.json() : null),
        fetch(`/api/bookings/owner/${currentUser.id}`).then(r => r.ok ? r.json() : [])
      ]).then(([statsData, bookingsData]) => {
        setStats(statsData)
        setBookings(Array.isArray(bookingsData) ? bookingsData : [])
        setLoading(false)
      }).catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [currentUser])

  if (!currentUser || (currentUser.role !== 'OWNER' && currentUser.role !== 'ADMIN')) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">💰 Панель владельца</h1>
        <p className="text-gray-500">Доступно только для владельцев квартир</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">💰 Панель владельца</h1>
      
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <>
          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border rounded-xl p-6">
              <p className="text-gray-500 text-sm">Мои квартиры</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.totalApartments || 0}</p>
            </div>
            <div className="bg-white border rounded-xl p-6">
              <p className="text-gray-500 text-sm">Всего бронирований</p>
              <p className="text-3xl font-bold text-purple-600">{stats?.totalBookings || 0}</p>
            </div>
            <div className="bg-white border rounded-xl p-6">
              <p className="text-gray-500 text-sm">Общая сумма продаж</p>
              <p className="text-3xl font-bold text-gray-600">{stats?.totalAmount?.toFixed(0) || 0} €</p>
            </div>
            <div className="bg-white border rounded-xl p-6">
              <p className="text-gray-500 text-sm">Мой доход (90%)</p>
              <p className="text-3xl font-bold text-green-600">{stats?.ownerRevenue?.toFixed(0) || 0} €</p>
            </div>
          </div>

          {/* Бронирования моих квартир */}
          <h2 className="text-xl font-bold mb-4">📅 Бронирования моих квартир</h2>
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map(b => (
                <div key={b.id} className="bg-white border rounded-xl p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{b.apartmentTitle || b.apartmentCity}</h3>
                      <p className="text-gray-500 text-sm">{b.apartmentAddress}</p>
                      <p className="text-sm mt-2">
                        Клиент: {b.clientName} ({b.clientEmail})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{b.totalAmount} €</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                      }`}>
                        {b.status === 'CONFIRMED' ? 'Подтверждено' : b.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-gray-500">Заезд</p>
                      <p className="font-medium">{b.checkIn}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Выезд</p>
                      <p className="font-medium">{b.checkOut}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Гостей</p>
                      <p className="font-medium">{b.guests}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <p className="text-gray-500">Пока нет бронирований</p>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            <a href="/my-apartments" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              📋 Мои квартиры
            </a>
            <a href="/add-apartment" className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700">
              🏠 Добавить квартиру
            </a>
          </div>
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/*" element={
            <>
              <Header />
              <Routes>
                <Route path="/" element={<><CategoryNav /><HomePage /></>} />
                <Route path="/apartment/:id" element={<ApartmentPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/help" element={<HelpCenterPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/add-apartment" element={<AddApartmentPage />} />
                <Route path="/my-apartments" element={<MyApartmentsPage />} />
                <Route path="/owner-dashboard" element={<OwnerDashboard />} />
              </Routes>
            </>
          } />
        </Routes>
      </div>
    </AppProvider>
  )
}

export default App
