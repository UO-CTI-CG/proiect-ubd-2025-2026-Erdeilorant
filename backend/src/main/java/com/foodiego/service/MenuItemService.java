package com.foodiego.service;

import com.foodiego.dto.MenuItemDTO;
import com.foodiego.exception.ResourceNotFoundException;
import com.foodiego.model.MenuItem;
import com.foodiego.model.Restaurant;
import com.foodiego.repository.MenuItemRepository;
import com.foodiego.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;

    public List<MenuItemDTO> getMenuItemsByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurant_Id(restaurantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public MenuItemDTO getMenuItemById(Long id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));
        return convertToDTO(menuItem);
    }

    @Transactional
    public MenuItemDTO createMenuItem(MenuItemDTO menuItemDTO) {
        Restaurant restaurant = restaurantRepository.findById(menuItemDTO.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + menuItemDTO.getRestaurantId()));

        MenuItem menuItem = new MenuItem();
        menuItem.setRestaurant(restaurant);
        menuItem.setName(menuItemDTO.getName());
        menuItem.setDescription(menuItemDTO.getDescription());
        menuItem.setPrice(menuItemDTO.getPrice());
        menuItem.setImage(menuItemDTO.getImage());
        menuItem.setCategory(menuItemDTO.getCategory());
        menuItem.setIsPopular(menuItemDTO.getIsPopular() != null ? menuItemDTO.getIsPopular() : false);
        menuItem.setIsVegetarian(menuItemDTO.getIsVegetarian() != null ? menuItemDTO.getIsVegetarian() : false);
        menuItem.setAvailable(menuItemDTO.getAvailable() != null ? menuItemDTO.getAvailable() : true);
        menuItem.setAllergens(menuItemDTO.getAllergens());

        menuItem = menuItemRepository.save(menuItem);
        return convertToDTO(menuItem);
    }

    @Transactional
    public MenuItemDTO updateMenuItem(Long id, MenuItemDTO menuItemDTO) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        if (menuItemDTO.getName() != null) menuItem.setName(menuItemDTO.getName());
        if (menuItemDTO.getDescription() != null) menuItem.setDescription(menuItemDTO.getDescription());
        if (menuItemDTO.getPrice() != null) menuItem.setPrice(menuItemDTO.getPrice());
        if (menuItemDTO.getImage() != null) menuItem.setImage(menuItemDTO.getImage());
        if (menuItemDTO.getCategory() != null) menuItem.setCategory(menuItemDTO.getCategory());
        if (menuItemDTO.getIsPopular() != null) menuItem.setIsPopular(menuItemDTO.getIsPopular());
        if (menuItemDTO.getIsVegetarian() != null) menuItem.setIsVegetarian(menuItemDTO.getIsVegetarian());
        if (menuItemDTO.getAvailable() != null) menuItem.setAvailable(menuItemDTO.getAvailable());
        if (menuItemDTO.getAllergens() != null) menuItem.setAllergens(menuItemDTO.getAllergens());

        menuItem = menuItemRepository.save(menuItem);
        return convertToDTO(menuItem);
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        if (!menuItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Menu item not found with id: " + id);
        }
        menuItemRepository.deleteById(id);
    }

    private MenuItemDTO convertToDTO(MenuItem menuItem) {
        MenuItemDTO dto = new MenuItemDTO();
        dto.setId(menuItem.getId());
        dto.setRestaurantId(menuItem.getRestaurantId());
        dto.setName(menuItem.getName());
        dto.setDescription(menuItem.getDescription());
        dto.setPrice(menuItem.getPrice());
        dto.setImage(menuItem.getImage());
        dto.setCategory(menuItem.getCategory());
        dto.setIsPopular(menuItem.getIsPopular());
        dto.setIsVegetarian(menuItem.getIsVegetarian());
        dto.setAvailable(menuItem.getAvailable());
        dto.setAllergens(menuItem.getAllergens());
        dto.setCreatedAt(menuItem.getCreatedAt());
        dto.setUpdatedAt(menuItem.getUpdatedAt());
        return dto;
    }
}
