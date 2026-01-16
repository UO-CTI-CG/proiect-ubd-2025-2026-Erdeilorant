package com.foodiego.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {

    private Long id;
    private Long menuItemId;
    private String name;
    private String description;
    private Double price;
    private String image;
    private Integer quantity;
}
