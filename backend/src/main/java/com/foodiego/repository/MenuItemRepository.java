package com.foodiego.repository;

import com.foodiego.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByRestaurant_Id(Long restaurantId);

    List<MenuItem> findByRestaurant_IdAndCategory(Long restaurantId, String category);

    List<MenuItem> findByRestaurant_IdAndAvailableTrue(Long restaurantId);

    List<MenuItem> findByRestaurant_IdAndIsPopularTrue(Long restaurantId);

    List<MenuItem> findByRestaurant_IdAndIsVegetarianTrue(Long restaurantId);
}
