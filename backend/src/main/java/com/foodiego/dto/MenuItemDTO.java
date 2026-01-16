package com.foodiego.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemDTO {

    private Long id;
    private Long restaurantId;
    private String name;
    private String description;
    private Double price;
    private String image;
    private String category;
    private Boolean isPopular;
    private Boolean isVegetarian;
    private Boolean available;
    private List<String> allergens;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
