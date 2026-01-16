package com.foodiego.repository;

import com.foodiego.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    Optional<Restaurant> findByOwner_Id(Long ownerId);

    List<Restaurant> findByIsOpenTrue();

    List<Restaurant> findByCuisineContainingIgnoreCase(String cuisine);

    @Query("SELECT r FROM Restaurant r WHERE " +
           "LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.cuisine) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.address) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Restaurant> searchRestaurants(@Param("search") String search);

    @Query("SELECT r FROM Restaurant r JOIN r.categories c WHERE LOWER(c) = LOWER(:category)")
    List<Restaurant> findByCategory(@Param("category") String category);
}
