package com.foodiego.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id")
    private MenuItem menuItem;

    private String menuItemName;

    private String menuItemDescription;

    @NotNull
    @Min(0)
    private Double price;

    @NotNull
    @Min(1)
    private Integer quantity;

    private String image;

    private String category;

    @PrePersist
    @PreUpdate
    public void syncMenuItemData() {
        if (menuItem != null) {
            this.menuItemName = menuItem.getName();
            this.menuItemDescription = menuItem.getDescription();
            this.price = menuItem.getPrice();
            this.image = menuItem.getImage();
            this.category = menuItem.getCategory();
        }
    }
}
