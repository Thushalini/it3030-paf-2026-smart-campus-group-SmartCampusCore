package com.campus.operations.repository;

import com.campus.operations.entity.Booking;
import com.campus.operations.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Booking> findByResourceIdAndDateAndStatus(Long resourceId, LocalDate date, BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.date = :date " +
           "AND b.status = :status AND " +
           "((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findOverlappingBookings(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("status") BookingStatus status,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );
    
    @Query("SELECT b FROM Booking b WHERE " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:date IS NULL OR b.date = :date) AND " +
           "(:resourceId IS NULL OR b.resource.id = :resourceId) " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findAllWithFilters(
            @Param("status") BookingStatus status,
            @Param("date") LocalDate date,
            @Param("resourceId") Long resourceId
    );
    
    Optional<Booking> findByIdAndUserId(Long id, Long userId);
}
