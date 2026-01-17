import React, { useState, useEffect } from 'react'
import { Search, Menu, User, X, Heart, MessageCircle } from 'lucide-react'

export default function Header() {
  const [showMenu, setShowMenu] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '', phone: '', role: 'CLIENT'
  })
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [searchData, setSearchData] = useState({ city: '', checkIn: '', checkOut: '', guests: '' })

  // Сохранение пользователя в localStorage при изменении
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    }
  }, [currentUser])

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Регистрация успешна!')
        setCurrentUser(data)
        localStorage.setItem('currentUser', JSON.stringify(data))
        setTimeout(() => { setShowRegister(false); setMessage('') }, 1500)
      } else {
        setMessage(data.message || 'Ошибка регистрации')
      }
    } catch (err) {
      setMessage('Ошибка: ' + err.message)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Вход выполнен!')
        setCurrentUser(data)
        localStorage.setItem('currentUser', JSON.stringify(data))
        setTimeout(() => { setShowLogin(false); setMessage(''); setLoginData({ email: '', password: '' }) }, 1000)
      } else {
        setMessage(data.message || 'Неверный email или пароль')
      }
    } catch (err) {
      setMessage('Ошибка: ' + err.message)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="/" className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[#FF385C] rounded-full"></span>
              <span className="text-xl font-bold text-[#FF385C]">TravelNv</span>
            </a>

            {/* Search Bar */}
            <div className="hidden md:flex items-center border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setShowSearch(true)}>
              <div className="px-6 py-2 border-r border-gray-300">
                <div className="text-sm font-semibold">Где</div>
                <div className="text-sm text-gray-500">{searchData.city || 'Поиск направлений'}</div>
              </div>
              <div className="px-6 py-2 border-r border-gray-300">
                <div className="text-sm font-semibold">Когда</div>
                <div className="text-sm text-gray-500">{searchData.checkIn || 'Добавить даты'}</div>
              </div>
              <div className="px-6 py-2">
                <div className="text-sm font-semibold">Кто</div>
                <div className="text-sm text-gray-500">{searchData.guests ? `${searchData.guests} гостей` : 'Добавить гостей'}</div>
              </div>
              <button className="bg-[#FF385C] text-white rounded-full p-3 mr-2 hover:bg-[#E31C5F] transition">
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Right Menu */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-2 hover:shadow-md transition"
                >
                  <Menu className="w-4 h-4" />
                  <div className="bg-gray-500 text-white rounded-full p-1">
                    <User className="w-4 h-4" />
                  </div>
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {currentUser ? (
                      <>
                        <div className="px-4 py-3 border-b">
                          <p className="font-semibold">{currentUser.firstName} {currentUser.lastName}</p>
                          <p className="text-sm text-gray-500">{currentUser.email}</p>
                        </div>
                        <a href="/favorites" className="block px-4 py-3 hover:bg-gray-50">
                          ❤️ Избранное
                        </a>
                        <a href="/bookings" className="block px-4 py-3 hover:bg-gray-50">
                          🎫 Мои бронирования
                        </a>
                        <a href="/messages" className="block px-4 py-3 hover:bg-gray-50">
                          💬 Сообщения
                        </a>
                        {/* Меню для OWNER */}
                        {(currentUser.role === 'OWNER' || currentUser.role === 'ADMIN') && (
                          <>
                            <hr className="my-2" />
                            <a href="/owner-dashboard" className="block px-4 py-3 hover:bg-gray-50 text-green-600 font-semibold">
                              💰 Панель владельца
                            </a>
                            <a href="/add-apartment" className="block px-4 py-3 hover:bg-gray-50">
                              🏠 Сдать жильё
                            </a>
                            <a href="/my-apartments" className="block px-4 py-3 hover:bg-gray-50">
                              📋 Мои квартиры
                            </a>
                          </>
                        )}
                        <hr className="my-2" />
                        <a href="/help" className="block px-4 py-3 hover:bg-gray-50">
                          🆘 Центр помощи
                        </a>
                        {currentUser.role === 'ADMIN' && (
                          <a href="/admin" className="block px-4 py-3 hover:bg-gray-50 text-purple-600 font-semibold">
                            ⚙️ Админ панель
                          </a>
                        )}
                        <hr className="my-2" />
                        <button onClick={() => { setCurrentUser(null); localStorage.removeItem('currentUser'); setShowMenu(false) }} 
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 text-red-600">
                          Выйти
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setShowRegister(true); setShowMenu(false) }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 font-semibold">
                          Регистрация
                        </button>
                        <button onClick={() => { setShowLogin(true); setShowMenu(false) }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50">
                          Вход
                        </button>
                        <hr className="my-2" />
                        <a href="/favorites" className="block px-4 py-3 hover:bg-gray-50">
                          ❤️ Избранное
                        </a>
                        <a href="/help" className="block px-4 py-3 hover:bg-gray-50">
                          🆘 Центр помощи
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {showRegister && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRegister(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Регистрация</h2>
              <button onClick={() => setShowRegister(false)}><X className="w-5 h-5" /></button>
            </div>
            {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}
            <form onSubmit={handleRegister} className="space-y-4">
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full p-3 border rounded-lg">
                <option value="CLIENT">Клиент</option>
                <option value="OWNER">Владелец</option>
              </select>
              <input type="email" placeholder="Email" required value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 border rounded-lg" />
              <input type="password" placeholder="Пароль" required value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full p-3 border rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Имя" required value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="w-full p-3 border rounded-lg" />
                <input type="text" placeholder="Фамилия" required value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="w-full p-3 border rounded-lg" />
              </div>
              <input type="tel" placeholder="Телефон" required value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full p-3 border rounded-lg" />
              <button type="submit" className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700">
                Зарегистрироваться
              </button>
            </form>
          </div>
        </div>
      )}

      {showLogin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowLogin(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Вход</h2>
              <button onClick={() => setShowLogin(false)}><X className="w-5 h-5" /></button>
            </div>
            {message && <div className={`mb-4 p-3 rounded ${message.includes('выполнен') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="email" 
                placeholder="Email" 
                value={loginData.email}
                onChange={e => setLoginData({...loginData, email: e.target.value})}
                className="w-full p-3 border rounded-lg" 
                required 
              />
              <input 
                type="password" 
                placeholder="Пароль" 
                value={loginData.password}
                onChange={e => setLoginData({...loginData, password: e.target.value})}
                className="w-full p-3 border rounded-lg" 
                required 
              />
              <button type="submit" className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700">
                Войти
              </button>
            </form>
            <p className="text-center mt-4 text-gray-600">
              Нет аккаунта? <button onClick={() => { setShowLogin(false); setShowRegister(true); setMessage('') }} className="text-pink-600">Регистрация</button>
            </p>
          </div>
        </div>
      )}

      {/* Модальное окно поиска */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 p-4" onClick={() => setShowSearch(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Поиск жилья</h2>
              <button onClick={() => setShowSearch(false)}><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Куда?</label>
                <select 
                  value={searchData.city} 
                  onChange={e => setSearchData({...searchData, city: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Выберите город</option>
                  <option value="Москва">Москва</option>
                  <option value="Санкт-Петербург">Санкт-Петербург</option>
                  <option value="Кишинёв">Кишинёв</option>
                  <option value="Будапешт">Будапешт</option>
                  <option value="Бухарест">Бухарест</option>
                  <option value="Милан">Милан</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Заезд</label>
                  <input 
                    type="date" 
                    value={searchData.checkIn}
                    onChange={e => setSearchData({...searchData, checkIn: e.target.value})}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Выезд</label>
                  <input 
                    type="date"
                    value={searchData.checkOut}
                    onChange={e => setSearchData({...searchData, checkOut: e.target.value})}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Сколько гостей?</label>
                <select 
                  value={searchData.guests}
                  onChange={e => setSearchData({...searchData, guests: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Выберите</option>
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'гость' : 'гостей'}</option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={() => {
                  setShowSearch(false)
                  if (searchData.city) {
                    window.location.href = `/?city=${encodeURIComponent(searchData.city)}`
                  } else {
                    window.location.href = '/'
                  }
                }}
                className="w-full bg-[#FF385C] text-white py-3 rounded-lg font-semibold hover:bg-[#E31C5F] flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Найти жилье
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
