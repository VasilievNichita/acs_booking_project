import React, { useState, useEffect } from 'react'
import { Users, Home, Calendar, CreditCard, ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [owners, setOwners] = useState([])
  const [apartments, setApartments] = useState([])
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState([])
  const [supportTickets, setSupportTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState({})

  useEffect(() => {
    loadData()
    // Загрузка тикетов из localStorage
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]')
    setSupportTickets(tickets)
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes, ownersRes, aptsRes, bookingsRes, paymentsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/owners'),
        fetch('/api/admin/apartments'),
        fetch('/api/admin/bookings'),
        fetch('/api/admin/payments')
      ])
      
      if (statsRes.ok) setStats(await statsRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
      if (ownersRes.ok) setOwners(await ownersRes.json())
      if (aptsRes.ok) setApartments(await aptsRes.json())
      if (bookingsRes.ok) setBookings(await bookingsRes.json())
      if (paymentsRes.ok) setPayments(await paymentsRes.json())
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = (ticketId) => {
    const tickets = supportTickets.map(t => 
      t.id === ticketId 
        ? { ...t, reply: replyText[ticketId], status: 'answered' }
        : t
    )
    setSupportTickets(tickets)
    localStorage.setItem('supportTickets', JSON.stringify(tickets))
    setReplyText({ ...replyText, [ticketId]: '' })
  }

  const tabs = [
    { id: 'stats', label: 'Статистика', icon: RefreshCw },
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'owners', label: 'Владельцы', icon: Home },
    { id: 'apartments', label: 'Квартиры', icon: Home },
    { id: 'bookings', label: 'Бронирования', icon: Calendar },
    { id: 'payments', label: 'Платежи', icon: CreditCard },
    { id: 'support', label: 'Поддержка', icon: MessageCircle }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </a>
              <h1 className="text-2xl font-bold text-gray-900">Панель администратора</h1>
            </div>
            <button 
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === tab.id 
                  ? 'bg-pink-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-pink-600" />
            <p className="mt-4 text-gray-500">Загрузка данных...</p>
          </div>
        ) : (
          <>
            {/* Статистика */}
            {activeTab === 'stats' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Пользователей" value={stats?.totalUsers || 0} color="blue" />
                <StatCard title="Клиентов" value={stats?.totalClients || 0} color="green" />
                <StatCard title="Владельцев" value={stats?.totalOwners || 0} color="purple" />
                <StatCard title="Квартир" value={stats?.totalApartments || 0} color="orange" />
                <StatCard title="Бронирований" value={stats?.totalBookings || 0} color="pink" />
                <StatCard title="Платежей" value={stats?.totalPayments || 0} color="indigo" />
                <StatCard title="Общий оборот" value={`${stats?.totalRevenue?.toFixed(0) || 0} €`} color="gray" />
                <StatCard title="Комиссия сайта (10%)" value={`${stats?.platformRevenue?.toFixed(0) || 0} €`} color="emerald" />
              </div>
            )}

            {/* Пользователи */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Имя</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Телефон</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Роль</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Рейтинг</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Квартиры</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{user.id}</td>
                        <td className="px-4 py-3 text-sm">{user.email}</td>
                        <td className="px-4 py-3 text-sm">{user.firstName} {user.lastName}</td>
                        <td className="px-4 py-3 text-sm">{user.phone || '-'}</td>
                        <td className="px-4 py-3">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-4 py-3 text-sm">{user.reputationScore?.toFixed(1)}</td>
                        <td className="px-4 py-3 text-sm">{user.apartmentsCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && <p className="text-center py-8 text-gray-500">Нет пользователей</p>}
              </div>
            )}

            {/* Владельцы */}
            {activeTab === 'owners' && (
              <div className="space-y-4">
                {owners.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 bg-white rounded-xl">Нет владельцев</p>
                ) : owners.map(owner => (
                  <div key={owner.id} className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{owner.firstName} {owner.lastName}</h3>
                        <p className="text-gray-500">{owner.email}</p>
                        <p className="text-gray-500">{owner.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Рейтинг</p>
                        <p className="text-xl font-bold">{owner.reputationScore?.toFixed(1)}</p>
                      </div>
                    </div>
                    <h4 className="font-medium mb-2">Квартиры ({owner.apartments?.length || 0}):</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {owner.apartments?.map(apt => (
                        <div key={apt.id} className="border rounded-lg p-3 bg-gray-50">
                          <p className="font-medium">{apt.title}</p>
                          <p className="text-sm text-gray-500">{apt.city}, {apt.address}</p>
                          <p className="text-sm font-semibold text-pink-600">{apt.pricePerNight} €/ночь</p>
                          <span className={`text-xs px-2 py-0.5 rounded ${apt.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {apt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Квартиры */}
            {activeTab === 'apartments' && (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Название</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Город</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Цена</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Комнат</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Статус</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Владелец</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {apartments.map(apt => (
                      <tr key={apt.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{apt.id}</td>
                        <td className="px-4 py-3 text-sm font-medium">{apt.title}</td>
                        <td className="px-4 py-3 text-sm">{apt.city}</td>
                        <td className="px-4 py-3 text-sm font-semibold">{apt.pricePerNight} €</td>
                        <td className="px-4 py-3 text-sm">{apt.rooms}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded ${apt.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{apt.ownerName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {apartments.length === 0 && <p className="text-center py-8 text-gray-500">Нет квартир</p>}
              </div>
            )}

            {/* Бронирования */}
            {activeTab === 'bookings' && (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Квартира</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Клиент</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Заезд</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Выезд</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Сумма</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {bookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{booking.id}</td>
                        <td className="px-4 py-3 text-sm">{booking.apartmentTitle}</td>
                        <td className="px-4 py-3 text-sm">{booking.clientName}</td>
                        <td className="px-4 py-3 text-sm">{booking.checkIn}</td>
                        <td className="px-4 py-3 text-sm">{booking.checkOut}</td>
                        <td className="px-4 py-3 text-sm font-semibold">{booking.totalAmount} €</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={booking.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bookings.length === 0 && <p className="text-center py-8 text-gray-500">Нет бронирований</p>}
              </div>
            )}

            {/* Платежи */}
            {activeTab === 'payments' && (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Квартира</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Клиент</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Владелец</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Сумма</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Метод</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.map(payment => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{payment.id}</td>
                        <td className="px-4 py-3 text-sm">{payment.apartmentTitle}</td>
                        <td className="px-4 py-3 text-sm">{payment.clientName}</td>
                        <td className="px-4 py-3 text-sm">{payment.ownerName}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">{payment.amount} €</td>
                        <td className="px-4 py-3 text-sm">{payment.paymentMethod}</td>
                        <td className="px-4 py-3">
                          <PaymentBadge status={payment.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {payments.length === 0 && <p className="text-center py-8 text-gray-500">Нет платежей</p>}
              </div>
            )}

            {/* Поддержка */}
            {activeTab === 'support' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Обращения в поддержку ({supportTickets.length})</h2>
                {supportTickets.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 bg-white rounded-xl">Нет обращений</p>
                ) : (
                  supportTickets.map(ticket => (
                    <div key={ticket.id} className="bg-white rounded-xl shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                          <p className="text-sm text-gray-500">От: {ticket.fromName} ({ticket.from})</p>
                          <p className="text-xs text-gray-400">{new Date(ticket.date).toLocaleString('ru-RU')}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {ticket.status === 'open' ? 'Открыт' : 'Отвечено'}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-gray-700">{ticket.message}</p>
                      </div>
                      {ticket.reply ? (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm font-semibold text-green-700 mb-1">Ваш ответ:</p>
                          <p className="text-gray-700">{ticket.reply}</p>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Напишите ответ..."
                            value={replyText[ticket.id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [ticket.id]: e.target.value })}
                            className="flex-1 p-2 border rounded-lg"
                          />
                          <button
                            onClick={() => handleReply(ticket.id)}
                            disabled={!replyText[ticket.id]}
                            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
                          >
                            Ответить
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Компоненты
function StatCard({ title, value, color, className = '' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    pink: 'bg-pink-50 text-pink-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  }
  
  return (
    <div className={`bg-white rounded-xl shadow p-6 ${className}`}>
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <p className={`text-3xl font-bold ${colors[color]?.split(' ')[1] || 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

function RoleBadge({ role }) {
  const styles = {
    ADMIN: 'bg-red-100 text-red-700',
    OWNER: 'bg-purple-100 text-purple-700',
    CLIENT: 'bg-blue-100 text-blue-700'
  }
  const labels = { ADMIN: 'Админ', OWNER: 'Владелец', CLIENT: 'Клиент' }
  
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${styles[role] || 'bg-gray-100'}`}>
      {labels[role] || role}
    </span>
  )
}

function StatusBadge({ status }) {
  const styles = {
    CREATED: 'bg-gray-100 text-gray-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    CHECKED_IN: 'bg-green-100 text-green-700',
    CHECKED_OUT: 'bg-purple-100 text-purple-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700'
  }
  
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${styles[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  )
}

function PaymentBadge({ status }) {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PAID: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-gray-100 text-gray-700'
  }
  const labels = { PENDING: 'Ожидает', PAID: 'Оплачен', FAILED: 'Ошибка', REFUNDED: 'Возврат' }
  
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${styles[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  )
}
