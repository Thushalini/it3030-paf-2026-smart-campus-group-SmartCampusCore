package com.sliit.campus_core.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.sliit.campus_core.entity.Booking;
import com.sliit.campus_core.entity.BookingStatus;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    
    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);
    
    List<Booking> findByResourceIdAndDateAndStatus(String resourceId, LocalDate date, BookingStatus status);
    
    @Query("{ 'resource.$id' : ?0, 'date' : ?1, 'status' : ?2, " +
           "'$or' : [ { 'start_time' : { '$lt' : ?4 }, 'end_time' : { '$gt' : ?3 } }, " +
           "           { 'start_time' : { '$lt' : ?3 }, 'end_time' : { '$gt' : ?4 } } ] }")
    List<Booking> findOverlappingBookings(
            String resourceId,
            LocalDate date,
            BookingStatus status,
            LocalTime startTime,
            LocalTime endTime
    );
    
    @Query("{ '$and' : [ " +
           "{ '$or' : [ { 'status' : ?0 }, { 'status' : null } ] }, " +
           "{ '$or' : [ { 'date' : ?1 }, { 'date' : null } ] }, " +
           "{ '$or' : [ { 'resource.$id' : ?2 }, { 'resource.$id' : null } ] } ] }")
    List<Booking> findAllWithFilters(
            BookingStatus status,
            LocalDate date,
            String resourceId
    );
    
    Optional<Booking> findByIdAndUserId(String id, String userId);
}
