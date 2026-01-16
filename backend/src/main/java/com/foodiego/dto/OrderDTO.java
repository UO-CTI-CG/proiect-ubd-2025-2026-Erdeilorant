package com.foodiego.dto;

import com.foodiego.model.Order.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {

    private Long id;
    private String orderNumber;
    private Long restaurantId;
    private String restaurantName;
    private Double total;
    private OrderStatus status;
    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private String notes;
    private List<OrderItemDTO> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
