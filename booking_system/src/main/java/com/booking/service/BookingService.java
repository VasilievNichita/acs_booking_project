package com.booking.service;

import com.booking.dto.BookingDTO;
import com.booking.dto.BookingRequestDTO;
import com.booking.model.*;
import com.booking.model.Booking.BookingStatus;
import com.booking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final AlertRepository alertRepository;
    private final TicketRepository ticketRepository;

    // Создание брони (новый метод с DTO)
    @Transactional
    public BookingDTO createBooking(BookingRequestDTO request, Long clientId) {
        Booking booking = createBookingInternal(
            request.getApartmentId(),
            clientId,
            request.getCheckInDate(),
            request.getCheckOutDate(),
            false
        );
        booking.setGuests(request.getGuests());
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        // Автоматически создаём оплаченный платёж с комиссией 10%
        BigDecimal totalAmount = booking.getTotalAmount();
        BigDecimal platformFee = totalAmount.multiply(BigDecimal.valueOf(0.10)); // 10% сайту
        BigDecimal ownerAmount = totalAmount.subtract(platformFee); // 90% владельцу

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(totalAmount)
                .platformFee(platformFee)
                .ownerAmount(ownerAmount)
                .status(Payment.PaymentStatus.PAID)
                .paidAt(java.time.LocalDateTime.now())
                .paymentMethod(com.booking.model.PaymentMethod.CREDIT_CARD)
                .build();
        paymentRepository.save(payment);

        return BookingDTO.fromEntity(booking);
    }

    // Создание брони (внутренний метод)
    @Transactional
    public Booking createBookingInternal(Long apartmentId, Long clientId, LocalDate checkIn, LocalDate checkOut, boolean nonRefundable) {

        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found"));

        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        // Расчет суммы
        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        BigDecimal totalAmount = apartment.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        Booking booking = Booking.builder()
                .apartment(apartment)
                .client(client)
                .checkIn(checkIn)
                .checkOut(checkOut)
                .totalAmount(totalAmount)
                .status(BookingStatus.CREATED)
                .nonRefundable(nonRefundable)
                .build();

        bookingRepository.save(booking);

        // Статус квартиры
        apartment.setStatus(Apartment.ApartmentStatus.BOOKED);
        apartment.setLastStatusUpdate(java.time.LocalDateTime.now());
        apartmentRepository.save(apartment);

        // Создать алерт, если тариф невозвратный
        if (nonRefundable) {
            Alert alert = Alert.builder()
                    .user(client)
                    .booking(booking)
                    .type(Alert.AlertType.NON_REFUNDABLE_WARNING)
                    .message("Обращаем внимание: сумма по этому тарифу не возвращается.")
                    .accepted(true) // клиент подтверждает сразу
                    .acceptedAt(java.time.LocalDateTime.now())
                    .build();

            alertRepository.save(alert);
        }

        // Тикет — бронирование создано
        Ticket ticket = Ticket.builder()
                .user(client)
                .booking(booking)
                .type(Ticket.TicketType.BOOKING_CREATED)
                .dataJson("{\"total\": \"" + totalAmount + "\"}")
                .build();

        ticketRepository.save(ticket);

        return booking;
    }

    // Check-out
    @Transactional
    public BookingDTO checkOut(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(BookingStatus.COMPLETED);
        booking.setCheckOutTime(java.time.LocalDateTime.now());
        bookingRepository.save(booking);

        Apartment apartment = booking.getApartment();
        apartment.setStatus(Apartment.ApartmentStatus.AVAILABLE);
        apartment.setLastStatusUpdate(java.time.LocalDateTime.now());
        apartmentRepository.save(apartment);

        Ticket ticket = Ticket.builder()
                .user(booking.getClient())
                .booking(booking)
                .type(Ticket.TicketType.STATUS_CHANGED)
                .dataJson("{\"status\": \"COMPLETED\"}")
                .build();
        ticketRepository.save(ticket);

        return BookingDTO.fromEntity(booking);
    }

    // Отмена брони
    @Transactional
    public BookingDTO cancelBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        Apartment apartment = booking.getApartment();
        apartment.setStatus(Apartment.ApartmentStatus.AVAILABLE);
        apartment.setLastStatusUpdate(java.time.LocalDateTime.now());
        apartmentRepository.save(apartment);

        Ticket ticket = Ticket.builder()
                .user(booking.getClient())
                .booking(booking)
                .type(Ticket.TicketType.STATUS_CHANGED)
                .dataJson("{\"status\": \"CANCELLED\", \"reason\": \"" + (reason != null ? reason : "No reason") + "\"}")
                .build();
        ticketRepository.save(ticket);

        return BookingDTO.fromEntity(booking);
    }

    // Завершение проживания
    @Transactional
    public void completeBooking(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        Apartment apartment = booking.getApartment();
        apartment.setStatus(Apartment.ApartmentStatus.AVAILABLE);
        apartment.setLastStatusUpdate(java.time.LocalDateTime.now());
        apartmentRepository.save(apartment);

        Ticket ticket = Ticket.builder()
                .user(booking.getClient())
                .booking(booking)
                .type(Ticket.TicketType.STATUS_CHANGED)
                .dataJson("{\"status\": \"COMPLETED\"}")
                .build();

        ticketRepository.save(ticket);
    }

    // Получить бронь по ID
    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return BookingDTO.fromEntity(booking);
    }

    // Получить все брони клиента
    public List<BookingDTO> getBookingsByClient(Long clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));
        return bookingRepository.findByClient(client).stream()
                .map(BookingDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Получить все брони владельца
    public List<BookingDTO> getBookingsByOwner(Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));
        return owner.getApartments().stream()
                .flatMap(apartment -> bookingRepository.findByApartment(apartment).stream())
                .map(BookingDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Подтвердить бронь
    @Transactional
    public BookingDTO confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        Ticket ticket = Ticket.builder()
                .user(booking.getClient())
                .booking(booking)
                .type(Ticket.TicketType.STATUS_CHANGED)
                .dataJson("{\"status\": \"CONFIRMED\"}")
                .build();
        ticketRepository.save(ticket);

        return BookingDTO.fromEntity(booking);
    }

    // Check-in (перегрузка для DTO)
    @Transactional
    public BookingDTO checkIn(Long bookingId) {
        Payment payment = checkInInternal(bookingId);
        Booking booking = payment.getBooking();
        booking.setCheckInTime(java.time.LocalDateTime.now());
        bookingRepository.save(booking);
        return BookingDTO.fromEntity(booking);
    }

    // Check-in (внутренний метод)
    @Transactional
    public Payment checkInInternal(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(BookingStatus.CHECKED_IN);
        bookingRepository.save(booking);

        // Платёж
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalAmount())
                .status(Payment.PaymentStatus.PENDING)
                .paymentMethod(com.booking.model.PaymentMethod.CREDIT_CARD)
                .build();

        paymentRepository.save(payment);

        // Обновление статуса квартиры
        Apartment apartment = booking.getApartment();
        apartment.setStatus(Apartment.ApartmentStatus.OCCUPIED);
        apartment.setLastStatusUpdate(java.time.LocalDateTime.now());
        apartmentRepository.save(apartment);

        // Тикет
        Ticket ticket = Ticket.builder()
                .user(booking.getClient())
                .booking(booking)
                .type(Ticket.TicketType.STATUS_CHANGED)
                .dataJson("{\"status\": \"CHECKED_IN\"}")
                .build();

        ticketRepository.save(ticket);

        return payment;
    }
}
