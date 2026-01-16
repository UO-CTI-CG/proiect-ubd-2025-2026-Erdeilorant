package com.foodiego;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class FoodiegoApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodiegoApplication.class, args);
    }
}
