package com.booking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final SimpMessagingTemplate messagingTemplate;

    public void sendApartmentUpdate(Long apartmentId, String message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("apartmentId", apartmentId);
        payload.put("message", message);
        payload.put("timestamp", System.currentTimeMillis());
        
        messagingTemplate.convertAndSend("/topic/apartments/" + apartmentId, payload);
        messagingTemplate.convertAndSend("/topic/apartments", payload);
    }

    public void sendBookingUpdate(Long bookingId, String message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("bookingId", bookingId);
        payload.put("message", message);
        payload.put("timestamp", System.currentTimeMillis());
        
        messagingTemplate.convertAndSend("/topic/bookings/" + bookingId, payload);
        messagingTemplate.convertAndSend("/topic/bookings", payload);
    }

    public void sendPaymentAlert(Long bookingId, String message, boolean refundable) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("bookingId", bookingId);
        payload.put("message", message);
        payload.put("refundable", refundable);
        payload.put("alert", !refundable ? "Внимание: Сумма не возвращается!" : "");
        payload.put("timestamp", System.currentTimeMillis());
        
        messagingTemplate.convertAndSend("/topic/payments/" + bookingId, payload);
        messagingTemplate.convertAndSend("/topic/alerts", payload);
    }

    public void sendHotelInfoUpdate(Long apartmentId, Integer availableRooms, Integer totalRooms) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("apartmentId", apartmentId);
        payload.put("availableRooms", availableRooms);
        payload.put("totalRooms", totalRooms);
        payload.put("timestamp", System.currentTimeMillis());
        
        messagingTemplate.convertAndSend("/topic/hotel-info/" + apartmentId, payload);
        messagingTemplate.convertAndSend("/topic/hotel-info", payload);
    }
}


