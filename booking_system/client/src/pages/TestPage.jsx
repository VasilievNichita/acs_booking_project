import React, { useState } from 'react'

export default function TestPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testBackend = async () => {
    setLoading(true)
    setResult('Тестирование...')
    
    try {
      // Тест 1: Проверка доступности backend
      const response = await fetch('/api/apartments/available')
      const data = await response.json()
      
      setResult(`✅ Backend работает!\n\nПолучено квартир: ${data.length}\n\nОтвет: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`❌ Ошибка подключения к backend:\n${error.message}\n\nПроверьте:\n1. Запущен ли backend на порту 8080\n2. Запущен ли frontend (npm run dev)`)
    } finally {
      setLoading(false)
    }
  }

  const testRegister = async () => {
    setLoading(true)
    setResult('Тестирование регистрации...')
    
    try {
      const testUser = {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Тест',
        lastName: 'Пользователь',
        phone: '+373-123-45-67',
        role: 'CLIENT'
      }
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testUser)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ Регистрация работает!\n\nСоздан пользователь:\nID: ${data.id}\nEmail: ${data.email}\nИмя: ${data.firstName} ${data.lastName}`)
      } else {
        setResult(`⚠️ Ошибка регистрации:\n${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResult(`❌ Ошибка:\n${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">🔧 Тестирование подключения Backend ↔ Frontend</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Инструкция:</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Убедитесь, что backend запущен: <code className="bg-gray-100 px-2 py-1 rounded">mvn spring-boot:run</code></li>
          <li>Убедитесь, что frontend запущен: <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code></li>
          <li>Нажмите кнопки ниже для тестирования</li>
        </ol>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Тесты:</h2>
        <div className="space-y-4">
          <button
            onClick={testBackend}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Тестирование...' : '1. Проверить подключение к Backend'}
          </button>
          
          <button
            onClick={testRegister}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Тестирование...' : '2. Тест регистрации пользователя'}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-gray-900 text-green-400 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap">
          {result}
        </div>
      )}

      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Если тесты не работают:</h3>
        <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm">
          <li>Проверьте, что backend запущен на <code>http://localhost:8080</code></li>
          <li>Проверьте, что frontend запущен на <code>http://localhost:3000</code></li>
          <li>Откройте консоль браузера (F12) для просмотра ошибок</li>
          <li>Проверьте вкладку Network в DevTools</li>
        </ul>
      </div>
    </div>
  )
}
