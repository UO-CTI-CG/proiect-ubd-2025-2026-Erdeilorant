package com.foodiego.repository;

import com.foodiego.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByRestaurant_Id(Long restaurantId);

    List<Order> findByRestaurant_IdOrderByCreatedAtDesc(Long restaurantId);

    List<Order> findByRestaurant_IdAndStatus(Long restaurantId, Order.OrderStatus status);

    List<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.restaurant.id = :restaurantId AND o.createdAt >= :startDate")
    List<Order> findRecentOrders(@Param("restaurantId") Long restaurantId,
                                  @Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurant.id = :restaurantId AND o.status = :status")
    Long countByRestaurantIdAndStatus(@Param("restaurantId") Long restaurantId,
                                      @Param("status") Order.OrderStatus status);

    @Query("SELECT SUM(o.total) FROM Order o WHERE o.restaurant.id = :restaurantId AND o.status = 'COMPLETED'")
    Double getTotalRevenue(@Param("restaurantId") Long restaurantId);
}
