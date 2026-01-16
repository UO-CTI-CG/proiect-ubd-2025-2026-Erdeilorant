package com.foodiego.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDTO {

    private Long id;
    private String name;
    private String image;
    private String cuisine;
    private Double rating;
    private Integer reviewCount;
    private String deliveryTime;
    private Double deliveryFee;
    private Double minOrder;
    private Boolean isOpen;
    private String address;
    private List<String> categories;
    private Long ownerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
