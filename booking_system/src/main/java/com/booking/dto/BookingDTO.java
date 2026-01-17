package com.booking.dto;

import com.booking.model.Booking;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookingDTO {
    private Long id;
    private Long apartmentId;
    private String apartmentTitle;
    private String apartmentCity;
    private String apartmentAddress;
    private Long clientId;
    private String clientName;
    private String clientEmail;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer guests;
    private BigDecimal totalAmount;
    private Booking.BookingStatus status;
    private Boolean paymentRequired;
    private Boolean paymentCompleted;
    private Boolean refundable;
    private LocalDateTime createdAt;
    private LocalDateTime paymentDate;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;

    public static BookingDTO fromEntity(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setApartmentId(booking.getApartment().getId());
        dto.setApartmentTitle(booking.getApartment().getTitle());
        dto.setApartmentCity(booking.getApartment().getCity());
        dto.setApartmentAddress(booking.getApartment().getAddress());
        dto.setClientId(booking.getClient().getId());
        dto.setClientName(booking.getClient().getFirstName() + " " + booking.getClient().getLastName());
        dto.setClientEmail(booking.getClient().getEmail());
        dto.setCheckIn(booking.getCheckIn());
        dto.setCheckOut(booking.getCheckOut());
        dto.setGuests(booking.getGuests());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setStatus(booking.getStatus());
        dto.setPaymentRequired(booking.getPaymentRequired());
        dto.setPaymentCompleted(booking.getPaymentCompleted());
        dto.setRefundable(!booking.isNonRefundable());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setPaymentDate(booking.getPaymentDate());
        dto.setCheckInTime(booking.getCheckInTime());
        dto.setCheckOutTime(booking.getCheckOutTime());
        return dto;
    }
}


