import React, { useState, useEffect } from 'react'
import ApartmentCard from './ApartmentCard'

export default function ApartmentGrid() {
  const [apartments, setApartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApartments()
  }, [])

  const loadApartments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/apartments/available')
      const data = await response.json()
      setApartments(data)
    } catch (error) {
      console.error('Error loading apartments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {apartments.map((apartment) => (
        <ApartmentCard key={apartment.id} apartment={apartment} />
      ))}
    </div>
  )
}
