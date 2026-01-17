package com.booking.controller;

import com.booking.model.Payment;
import com.booking.model.User;
import com.booking.repository.ApartmentRepository;
import com.booking.repository.BookingRepository;
import com.booking.repository.PaymentRepository;
import com.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    
    private final UserRepository userRepository;
    private final ApartmentRepository apartmentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    // Статистика для дашборда
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsers = userRepository.count();
        long totalClients = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.UserRole.CLIENT).count();
        long totalOwners = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.UserRole.OWNER).count();
        long totalApartments = apartmentRepository.count();
        long totalBookings = bookingRepository.count();
        long totalPayments = paymentRepository.count();
        
        // Общий доход всех оплат
        double totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.PAID)
                .mapToDouble(p -> p.getAmount().doubleValue())
                .sum();
        
        // Комиссия сайта (10%)
        double platformRevenue = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.PAID && p.getPlatformFee() != null)
                .mapToDouble(p -> p.getPlatformFee().doubleValue())
                .sum();
        
        stats.put("totalUsers", totalUsers);
        stats.put("totalClients", totalClients);
        stats.put("totalOwners", totalOwners);
        stats.put("totalApartments", totalApartments);
        stats.put("totalBookings", totalBookings);
        stats.put("totalPayments", totalPayments);
        stats.put("totalRevenue", totalRevenue);
        stats.put("platformRevenue", platformRevenue);
        
        return ResponseEntity.ok(stats);
    }

    // Все пользователи
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("email", user.getEmail());
                    userMap.put("firstName", user.getFirstName());
                    userMap.put("lastName", user.getLastName());
                    userMap.put("phone", user.getPhone());
                    userMap.put("role", user.getRole().name());
                    userMap.put("reputationScore", user.getReputationScore());
                    userMap.put("createdAt", user.getCreatedAt());
                    userMap.put("apartmentsCount", user.getApartments().size());
                    userMap.put("bookingsCount", user.getBookingsAsClient().size());
                    return userMap;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(users);
    }

    // Владельцы с их квартирами
    @GetMapping("/owners")
    public ResponseEntity<List<Map<String, Object>>> getOwners() {
        List<Map<String, Object>> owners = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.UserRole.OWNER)
                .map(owner -> {
                    Map<String, Object> ownerMap = new HashMap<>();
                    ownerMap.put("id", owner.getId());
                    ownerMap.put("email", owner.getEmail());
                    ownerMap.put("firstName", owner.getFirstName());
                    ownerMap.put("lastName", owner.getLastName());
                    ownerMap.put("phone", owner.getPhone());
                    ownerMap.put("reputationScore", owner.getReputationScore());
                    ownerMap.put("apartments", owner.getApartments().stream()
                            .map(apt -> {
                                Map<String, Object> aptMap = new HashMap<>();
                                aptMap.put("id", apt.getId());
                                aptMap.put("title", apt.getTitle());
                                aptMap.put("city", apt.getCity());
                                aptMap.put("address", apt.getAddress());
                                aptMap.put("pricePerNight", apt.getPricePerNight());
                                aptMap.put("status", apt.getStatus().name());
                                return aptMap;
                            })
                            .collect(Collectors.toList()));
                    return ownerMap;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(owners);
    }

    // Все квартиры
    @GetMapping("/apartments")
    public ResponseEntity<List<Map<String, Object>>> getAllApartments() {
        List<Map<String, Object>> apartments = apartmentRepository.findAll().stream()
                .map(apt -> {
                    Map<String, Object> aptMap = new HashMap<>();
                    aptMap.put("id", apt.getId());
                    aptMap.put("title", apt.getTitle());
                    aptMap.put("city", apt.getCity());
                    aptMap.put("address", apt.getAddress());
                    aptMap.put("pricePerNight", apt.getPricePerNight());
                    aptMap.put("rooms", apt.getRooms());
                    aptMap.put("maxGuests", apt.getMaxGuests());
                    aptMap.put("status", apt.getStatus().name());
                    aptMap.put("averageRating", apt.getAverageRating());
                    aptMap.put("ownerName", apt.getOwner().getFirstName() + " " + apt.getOwner().getLastName());
                    aptMap.put("ownerEmail", apt.getOwner().getEmail());
                    return aptMap;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(apartments);
    }

    // Все бронирования
    @GetMapping("/bookings")
    public ResponseEntity<List<Map<String, Object>>> getAllBookings() {
        List<Map<String, Object>> bookings = bookingRepository.findAll().stream()
                .map(booking -> {
                    Map<String, Object> bookingMap = new HashMap<>();
                    bookingMap.put("id", booking.getId());
                    bookingMap.put("apartmentTitle", booking.getApartment().getTitle());
                    bookingMap.put("apartmentCity", booking.getApartment().getCity());
                    bookingMap.put("clientName", booking.getClient().getFirstName() + " " + booking.getClient().getLastName());
                    bookingMap.put("clientEmail", booking.getClient().getEmail());
                    bookingMap.put("checkIn", booking.getCheckIn());
                    bookingMap.put("checkOut", booking.getCheckOut());
                    bookingMap.put("totalAmount", booking.getTotalAmount());
                    bookingMap.put("status", booking.getStatus().name());
                    bookingMap.put("createdAt", booking.getCreatedAt());
                    return bookingMap;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(bookings);
    }

    // Все платежи
    @GetMapping("/payments")
    public ResponseEntity<List<Map<String, Object>>> getAllPayments() {
        List<Map<String, Object>> payments = paymentRepository.findAll().stream()
                .map(payment -> {
                    Map<String, Object> paymentMap = new HashMap<>();
                    paymentMap.put("id", payment.getId());
                    paymentMap.put("bookingId", payment.getBooking().getId());
                    paymentMap.put("apartmentTitle", payment.getBooking().getApartment().getTitle());
                    paymentMap.put("clientName", payment.getBooking().getClient().getFirstName() + " " + payment.getBooking().getClient().getLastName());
                    paymentMap.put("ownerName", payment.getBooking().getApartment().getOwner().getFirstName() + " " + payment.getBooking().getApartment().getOwner().getLastName());
                    paymentMap.put("amount", payment.getAmount());
                    paymentMap.put("status", payment.getStatus().name());
                    paymentMap.put("paymentMethod", payment.getPaymentMethod().name());
                    paymentMap.put("paidAt", payment.getPaidAt());
                    return paymentMap;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(payments);
    }

    // Изменить статус пользователя
    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable Long id, 
            @RequestParam String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        user.setRole(User.UserRole.valueOf(role));
        userRepository.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Роль обновлена");
        
        return ResponseEntity.ok(response);
    }

    // Удалить пользователя
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Пользователь удален");
        
        return ResponseEntity.ok(response);
    }

    // Статистика владельца
    @GetMapping("/owner/{ownerId}/stats")
    public ResponseEntity<Map<String, Object>> getOwnerStats(@PathVariable Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Владелец не найден"));
        
        Map<String, Object> stats = new HashMap<>();
        
        // Квартиры владельца
        var apartments = owner.getApartments();
        stats.put("totalApartments", apartments.size());
        
        // Все бронирования квартир владельца
        var bookings = apartments.stream()
                .flatMap(apt -> bookingRepository.findByApartment(apt).stream())
                .collect(Collectors.toList());
        stats.put("totalBookings", bookings.size());
        
        // Общий доход владельца (90% от оплат)
        double ownerRevenue = bookings.stream()
                .map(b -> paymentRepository.findByBooking(b).orElse(null))
                .filter(p -> p != null && p.getStatus() == Payment.PaymentStatus.PAID && p.getOwnerAmount() != null)
                .mapToDouble(p -> p.getOwnerAmount().doubleValue())
                .sum();
        stats.put("ownerRevenue", ownerRevenue);
        
        // Общая сумма бронирований
        double totalAmount = bookings.stream()
                .map(b -> paymentRepository.findByBooking(b).orElse(null))
                .filter(p -> p != null && p.getStatus() == Payment.PaymentStatus.PAID)
                .mapToDouble(p -> p.getAmount().doubleValue())
                .sum();
        stats.put("totalAmount", totalAmount);
        
        return ResponseEntity.ok(stats);
    }
}
