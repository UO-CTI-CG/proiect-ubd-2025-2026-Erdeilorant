package com.foodiego.service;

import com.foodiego.dto.RestaurantDTO;
import com.foodiego.exception.ResourceNotFoundException;
import com.foodiego.model.Restaurant;
import com.foodiego.model.User;
import com.foodiego.repository.RestaurantRepository;
import com.foodiego.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    public List<RestaurantDTO> getAllRestaurants() {
        return restaurantRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public RestaurantDTO getRestaurantById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        return convertToDTO(restaurant);
    }

    public RestaurantDTO getRestaurantByOwnerId(Long ownerId) {
        Restaurant restaurant = restaurantRepository.findByOwner_Id(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found for owner id: " + ownerId));
        return convertToDTO(restaurant);
    }

    @Transactional
    public RestaurantDTO createRestaurant(RestaurantDTO restaurantDTO, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + ownerId));

        Restaurant restaurant = new Restaurant();
        restaurant.setName(restaurantDTO.getName());
        restaurant.setImage(restaurantDTO.getImage());
        restaurant.setCuisine(restaurantDTO.getCuisine());
        restaurant.setRating(restaurantDTO.getRating() != null ? restaurantDTO.getRating() : 0.0);
        restaurant.setReviewCount(restaurantDTO.getReviewCount() != null ? restaurantDTO.getReviewCount() : 0);
        restaurant.setDeliveryTime(restaurantDTO.getDeliveryTime());
        restaurant.setDeliveryFee(restaurantDTO.getDeliveryFee());
        restaurant.setMinOrder(restaurantDTO.getMinOrder());
        restaurant.setIsOpen(restaurantDTO.getIsOpen() != null ? restaurantDTO.getIsOpen() : true);
        restaurant.setAddress(restaurantDTO.getAddress());
        restaurant.setCategories(restaurantDTO.getCategories());
        restaurant.setOwner(owner);

        restaurant = restaurantRepository.save(restaurant);
        return convertToDTO(restaurant);
    }

    @Transactional
    public RestaurantDTO updateRestaurant(Long id, RestaurantDTO restaurantDTO) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));

        if (restaurantDTO.getName() != null) restaurant.setName(restaurantDTO.getName());
        if (restaurantDTO.getImage() != null) restaurant.setImage(restaurantDTO.getImage());
        if (restaurantDTO.getCuisine() != null) restaurant.setCuisine(restaurantDTO.getCuisine());
        if (restaurantDTO.getRating() != null) restaurant.setRating(restaurantDTO.getRating());
        if (restaurantDTO.getReviewCount() != null) restaurant.setReviewCount(restaurantDTO.getReviewCount());
        if (restaurantDTO.getDeliveryTime() != null) restaurant.setDeliveryTime(restaurantDTO.getDeliveryTime());
        if (restaurantDTO.getDeliveryFee() != null) restaurant.setDeliveryFee(restaurantDTO.getDeliveryFee());
        if (restaurantDTO.getMinOrder() != null) restaurant.setMinOrder(restaurantDTO.getMinOrder());
        if (restaurantDTO.getIsOpen() != null) restaurant.setIsOpen(restaurantDTO.getIsOpen());
        if (restaurantDTO.getAddress() != null) restaurant.setAddress(restaurantDTO.getAddress());
        if (restaurantDTO.getCategories() != null) restaurant.setCategories(restaurantDTO.getCategories());

        restaurant = restaurantRepository.save(restaurant);
        return convertToDTO(restaurant);
    }

    @Transactional
    public void deleteRestaurant(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));

        // Clear the owner's reference to the restaurant first
        if (restaurant.getOwner() != null) {
            User owner = restaurant.getOwner();
            owner.setRestaurant(null);
            userRepository.save(owner);
        }

        // Now delete the restaurant (CASCADE will handle menu items and orders)
        restaurantRepository.delete(restaurant);
    }

    private RestaurantDTO convertToDTO(Restaurant restaurant) {
        RestaurantDTO dto = new RestaurantDTO();
        dto.setId(restaurant.getId());
        dto.setName(restaurant.getName());
        dto.setImage(restaurant.getImage());
        dto.setCuisine(restaurant.getCuisine());
        dto.setRating(restaurant.getRating());
        dto.setReviewCount(restaurant.getReviewCount());
        dto.setDeliveryTime(restaurant.getDeliveryTime());
        dto.setDeliveryFee(restaurant.getDeliveryFee());
        dto.setMinOrder(restaurant.getMinOrder());
        dto.setIsOpen(restaurant.getIsOpen());
        dto.setAddress(restaurant.getAddress());
        dto.setCategories(restaurant.getCategories());
        dto.setOwnerId(restaurant.getOwner() != null ? restaurant.getOwner().getId() : null);
        dto.setCreatedAt(restaurant.getCreatedAt());
        dto.setUpdatedAt(restaurant.getUpdatedAt());
        return dto;
    }
}
